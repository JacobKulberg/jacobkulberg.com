#!/usr/bin/env python3
"""
Hourly UF Scheduler data refresh on the Raspberry Pi.

UF only shows meeting times to logged-in users, and a one.uf.edu session only
works from the network it was created on, so scraping happens here instead of
on GitHub. Each run:

  1. Updates ~/uf-scheduler/site (a sparse clone of jacobkulberg.com) so the
     latest scrape.py is used.
  2. Runs scrape.py with the cookie in ~/.config/uf-scheduler/cookie.
  3. Publishes the data directory as the single commit on the repo's uf-data
     branch (force-pushed, so the branch never grows). The site's deploy
     workflow picks it up from there.
  4. Writes ~/.local/state/uf-scheduler/status.json for the Pi dashboard.

Run by uf-scheduler-scrape.service (see install.sh). Standard library only.
"""

import datetime as dt
import json
import os
import re
import subprocess
import sys
import tempfile
import time

HOME = os.path.expanduser("~")
BASE = os.path.join(HOME, "uf-scheduler")
SITE = os.path.join(BASE, "site")  # sparse clone of main, for scrape.py
DATA = os.path.join(BASE, "data")  # repo whose only commit is the uf-data branch
COOKIE = os.path.join(HOME, ".config", "uf-scheduler", "cookie")
STATE = os.path.join(HOME, ".local", "state", "uf-scheduler")
RMP_CACHE = os.path.join(HOME, ".cache", "uf-scheduler", "rmp.json")
DEPLOY_KEY = os.path.join(HOME, ".ssh", "uf_scheduler_deploy")

REMOTE = "git@github.com:JacobKulberg/jacobkulberg.com.git"
BRANCH = "uf-data"
LIVE_DATA = "https://www.jacobkulberg.com/projects/uf-scheduler/data"
SCRAPER = ".github/uf-scheduler/scrape.py"

GIT_ENV = {
    **os.environ,
    "GIT_SSH_COMMAND": f"ssh -i {DEPLOY_KEY} -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new",
    "GIT_AUTHOR_NAME": "UF Scheduler (raspi)",
    "GIT_AUTHOR_EMAIL": "jacobkulberg@gmail.com",
    "GIT_COMMITTER_NAME": "UF Scheduler (raspi)",
    "GIT_COMMITTER_EMAIL": "jacobkulberg@gmail.com",
}


def git(*args, cwd, check=True):
    return subprocess.run(
        ["git", *args], cwd=cwd, env=GIT_ENV, check=check, capture_output=True, text=True
    )


def update_site():
    if not os.path.isdir(os.path.join(SITE, ".git")):
        os.makedirs(BASE, exist_ok=True)
        subprocess.run(
            ["git", "clone", "--depth", "1", "--filter=blob:none", "--sparse", REMOTE, SITE],
            env=GIT_ENV, check=True, capture_output=True, text=True,
        )
        git("sparse-checkout", "set", ".github/uf-scheduler", cwd=SITE)
    git("fetch", "--depth", "1", "origin", "main", cwd=SITE)
    git("reset", "--hard", "FETCH_HEAD", cwd=SITE)


def scrape():
    """Run scrape.py into DATA; returns its output lines."""
    with open(COOKIE) as f:
        cookie = f.read().strip()
    os.makedirs(DATA, exist_ok=True)
    out_dir = os.path.join(DATA, "data")
    env = {**os.environ, "UF_COOKIE": cookie}
    env.pop("GITHUB_OUTPUT", None)
    proc = subprocess.run(
        [sys.executable, os.path.join(SITE, SCRAPER),
         "--out", out_dir, "--rmp-cache", RMP_CACHE, "--fallback-url", LIVE_DATA],
        env=env, capture_output=True, text=True, timeout=3600,
    )
    lines = (proc.stdout + proc.stderr).splitlines()
    for line in lines:
        print(line, flush=True)
    if proc.returncode != 0:
        raise RuntimeError(f"scrape.py exited with {proc.returncode}")
    return out_dir, lines


def publish():
    """Replace the uf-data branch with one commit holding DATA/data."""
    if not os.path.isdir(os.path.join(DATA, ".git")):
        git("init", "-q", cwd=DATA)
        git("remote", "add", "origin", REMOTE, cwd=DATA)
    # Knowing the remote's current commit lets push skip unchanged course files
    git("fetch", "--depth", "1", "origin", BRANCH, cwd=DATA, check=False)
    git("checkout", "-q", "--orphan", "publish", cwd=DATA, check=False)
    git("add", "-A", "data", cwd=DATA)
    git("commit", "-q", "-m", "UF Scheduler course data", cwd=DATA)
    git("push", "-q", "--force", "origin", f"HEAD:refs/heads/{BRANCH}", cwd=DATA)
    commit = git("rev-parse", "--short", "HEAD", cwd=DATA).stdout.strip()
    # Start the next run from a clean orphan branch
    git("checkout", "-q", "--detach", cwd=DATA)
    git("branch", "-q", "-D", "publish", cwd=DATA)
    return commit


def read_manifest(out_dir):
    with open(os.path.join(out_dir, "terms.js")) as f:
        text = f.read()
    return json.loads(text[text.index("=") + 1 :].rstrip().rstrip(";"))


def write_status(status):
    os.makedirs(STATE, exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=STATE)
    with os.fdopen(fd, "w") as f:
        json.dump(status, f, indent=2)
    os.replace(tmp, os.path.join(STATE, "status.json"))


def main():
    started = time.time()
    status = {"last_run": dt.datetime.now().astimezone().isoformat(timespec="seconds")}
    try:
        update_site()
        out_dir, lines = scrape()
        manifest = read_manifest(out_dir)
        status["commit"] = publish()
        status["terms"] = {
            t: {"courses": manifest["counts"].get(t), "timed": manifest.get("timed", {}).get(t)}
            for t in manifest["terms"]
        }
        status["default_term"] = manifest["default"]
        status["login_ok"] = manifest.get("login_ok", False)
        status["fallbacks"] = [l for l in lines if re.search(r"keeping published|Scrape failed|dropped", l)]
        status["state"] = "ok" if status["login_ok"] and not status["fallbacks"] else "warn"
        if not status["login_ok"]:
            status["message"] = "UF login expired: update the cookie"
        elif status["fallbacks"]:
            status["message"] = "Some terms reused published data"
    except Exception as e:
        status["state"] = "error"
        status["message"] = (getattr(e, "stderr", None) or str(e)).strip()[-500:]
        print(f"ERROR: {status['message']}", flush=True)
    status["duration_s"] = round(time.time() - started)
    write_status(status)
    return 0 if status["state"] != "error" else 1


if __name__ == "__main__":
    sys.exit(main())
