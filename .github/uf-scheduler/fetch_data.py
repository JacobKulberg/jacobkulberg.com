#!/usr/bin/env python3
"""
Put UF Scheduler's course data in place for a site deploy.

The data is scraped on the Raspberry Pi (pi/run.py), which pushes it as the
only commit on the uf-data branch. This copies that branch's data/ into
--out, or, if the branch can't be fetched, the currently published data so a
deploy never drops the courses.

Writes to $GITHUB_OUTPUT:
  stale=true          the data is older than --max-age-hours (Pi offline?)
  login_expired=true  the Pi's UF login no longer returns meeting times

Standard library only.
"""

import argparse
import datetime as dt
import io
import json
import os
import subprocess
import sys
import tarfile
import urllib.request


USER_AGENT = "jacobkulberg.com deploy (github.com/JacobKulberg/jacobkulberg.com)"


def log(msg):
    print(msg, flush=True)


def from_branch(branch, out):
    fetch = subprocess.run(["git", "fetch", "--depth", "1", "origin", branch], capture_output=True, text=True)
    if fetch.returncode != 0:
        log(f"Couldn't fetch {branch}: {fetch.stderr.strip()}")
        return False
    archive = subprocess.run(["git", "archive", "FETCH_HEAD", "data"], capture_output=True, check=True)
    with tarfile.open(fileobj=io.BytesIO(archive.stdout)) as tar:
        for member in tar.getmembers():
            if member.isfile():
                name = os.path.relpath(member.name, "data")
                with open(os.path.join(out, name), "wb") as f:
                    f.write(tar.extractfile(member).read())
    log(f"Using data from the {branch} branch")
    return True


def from_live(url, out):
    def get(name):
        # Cloudflare in front of the site rejects urllib's default user agent
        req = urllib.request.Request(f"{url.rstrip('/')}/{name}", headers={"User-Agent": USER_AGENT})
        with urllib.request.urlopen(req, timeout=120) as res:
            return res.read()

    terms_js = get("terms.js")
    manifest = parse_manifest(terms_js.decode())
    with open(os.path.join(out, "terms.js"), "wb") as f:
        f.write(terms_js)
    for term in manifest["terms"]:
        term_name, yy = term.split()
        name = f"courses_{yy}_{term_name}.js"
        with open(os.path.join(out, name), "wb") as f:
            f.write(get(name))
    log(f"Using the published data from {url}")


def parse_manifest(text):
    return json.loads(text[text.index("=") + 1 :].rstrip().rstrip(";"))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", required=True)
    ap.add_argument("--branch", default="uf-data")
    ap.add_argument("--fallback-url", required=True)
    ap.add_argument("--max-age-hours", type=float, default=3)
    args = ap.parse_args()

    os.makedirs(args.out, exist_ok=True)
    if not from_branch(args.branch, args.out):
        from_live(args.fallback_url, args.out)

    with open(os.path.join(args.out, "terms.js")) as f:
        manifest = parse_manifest(f.read())
    updated = dt.datetime.fromisoformat(manifest["updated"])
    age_h = (dt.datetime.now(dt.timezone.utc) - updated).total_seconds() / 3600
    log(f"Terms {manifest['terms']}, updated {manifest['updated']} ({age_h:.1f}h ago), "
        f"login_ok={manifest.get('login_ok')}, timed={manifest.get('timed')}")

    outputs = []
    if age_h > args.max_age_hours:
        log(f"::warning::UF Scheduler data is {age_h:.0f} hours old. Is the Pi's scrape running?")
        outputs.append("stale=true")
    if manifest.get("login_ok") is False:
        log("::warning::The Pi's UF login no longer returns meeting times.")
        outputs.append("login_expired=true")
    if outputs and os.environ.get("GITHUB_OUTPUT"):
        with open(os.environ["GITHUB_OUTPUT"], "a") as f:
            f.write("\n".join(outputs) + "\n")


if __name__ == "__main__":
    sys.exit(main())
