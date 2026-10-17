#!/usr/bin/env python3
"""
Log the Pi back in to one.uf.edu when its UF session expires.

run.py calls this (with ~/uf-scheduler/venv's Python, which has Playwright)
when a scrape comes back without meeting times. It signs in to GatorLink in a
headless Chromium whose profile is kept in ~/.local/share/uf-scheduler/browser,
so the Pi stays a device Duo knows ("Yes, this is my device"), and writes the
new one.uf.edu Cookie header to ~/.config/uf-scheduler/cookie.

UF's Duo only skips MFA for 10 hours after a trusted login, so most logins end
in a Verified Duo Push: Duo shows a 3-digit code on the login page and wants it
typed into Duo Mobile. The Pi has no screen, so the code is sent to your phone
through ntfy (https://ntfy.sh): subscribe to the topic in the ntfy app and type
the code it shows into Duo Mobile. Duo's push lasts about a minute; up to
DUO_TRIES codes are sent before waiting for the next hourly run. Nothing is
attempted during QUIET_HOURS, when a code would go unanswered.

Files (all chmod 600):
  ~/.config/uf-scheduler/gatorlink  GatorLink username, then password, one per line
  ~/.config/uf-scheduler/ntfy       ntfy topic URL, e.g. https://ntfy.sh/uf-login-...

  relogin.py --setup   asks for those, sends a test notification and logs in
  relogin.py           logs in (exit 0), skips in quiet hours (exit 2), or fails (exit 1)

When a login fails, a screenshot and the page's HTML are saved to
~/.local/state/uf-scheduler/relogin-failed.{png,html}.
"""

import datetime as dt
import getpass
import json
import os
import re
import secrets
import sys
import time
import urllib.request

from playwright.sync_api import Error as PlaywrightError
from playwright.sync_api import sync_playwright

HOME = os.path.expanduser("~")
CONFIG = os.path.join(HOME, ".config", "uf-scheduler")
COOKIE = os.path.join(CONFIG, "cookie")
GATORLINK = os.path.join(CONFIG, "gatorlink")
NTFY = os.path.join(CONFIG, "ntfy")
PROFILE = os.path.join(HOME, ".local", "share", "uf-scheduler", "browser")
STATE = os.path.join(HOME, ".local", "state", "uf-scheduler")
FAILURE = os.path.join(STATE, "relogin.json")  # last failure we notified about

LOGIN_URL = "https://one.uf.edu/shib/login"
SYSTEM_CHROMIUM = "/usr/bin/chromium"
QUIET_HOURS = range(0, 8)  # local hours with no login attempts
DUO_TRIES = 3
TIMEOUT_S = 6 * 60


class LoginFailed(Exception):
    pass


def read_lines(path):
    with open(path) as f:
        return [line.rstrip("\n") for line in f]


def write_private(path, text):
    """Write text to path (mode 600), replacing it atomically."""
    tmp = f"{path}.tmp"
    fd = os.open(tmp, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
    with os.fdopen(fd, "w") as f:
        f.write(text)
    os.replace(tmp, path)


def notify(title, message, priority="default", tags=""):
    """Send a push notification to the ntfy topic; never raises."""
    try:
        url = read_lines(NTFY)[0].strip()
        req = urllib.request.Request(
            url, data=message.encode(),
            headers={"Title": title, "Priority": priority, "Tags": tags},
        )
        urllib.request.urlopen(req, timeout=15).close()
    except Exception as e:
        print(f"Couldn't send notification: {e}", flush=True)


def notify_failure(reason):
    """Tell the phone a login failed, once per distinct reason."""
    try:
        with open(FAILURE) as f:
            if json.load(f).get("reason") == reason:
                return
    except (FileNotFoundError, json.JSONDecodeError):
        pass
    notify("UF auto-login failed", f"{reason}\n\nUpdate the cookie by hand or check relogin.py.", "high", "warning")
    os.makedirs(STATE, exist_ok=True)
    with open(FAILURE, "w") as f:
        json.dump({"reason": reason}, f)


def save_debug(page):
    os.makedirs(STATE, exist_ok=True)
    try:
        page.screenshot(path=os.path.join(STATE, "relogin-failed.png"), full_page=True)
        with open(os.path.join(STATE, "relogin-failed.html"), "w") as f:
            f.write(page.content())
    except PlaywrightError:
        pass


def visible(locator):
    try:
        return locator.first.is_visible()
    except PlaywrightError:
        return False


def duo_code(page):
    """The 3-digit Verified Duo Push code on the page, if one is showing."""
    for selector in (".verification-code", "[class*=verification-code]", "[data-testid*=verification]"):
        loc = page.locator(selector)
        if visible(loc):
            match = re.search(r"\b\d{3}\b", loc.first.inner_text())
            if match:
                return match.group()
    try:
        text = page.locator("body").inner_text()
    except PlaywrightError:
        return None
    match = re.search(r"[Ee]nter (?:this |the )?code[^\d]{0,80}?\b(\d{3})\b", text)
    return match.group(1) if match else None


def log_in(page, username, password):
    """Drive the GatorLink and Duo pages until one.uf.edu has a session."""
    page.goto(LOGIN_URL, wait_until="domcontentloaded")
    submitted = False
    last_code, codes_sent = None, 0
    deadline = time.monotonic() + TIMEOUT_S
    while time.monotonic() < deadline:
        host = re.sub(r"^https?://([^/]+).*", r"\1", page.url)
        if host == "one.uf.edu" and "Shibboleth.sso" not in page.url:
            return

        if host == "login.ufl.edu" and visible(page.locator("#username")):
            if submitted:
                raise LoginFailed("GatorLink rejected the username or password")
            page.fill("#username", username)
            page.fill("#password", password)
            page.click("#submit")
            submitted = True
            page.wait_for_load_state("domcontentloaded")
            continue

        if "duosecurity.com" in host:
            trust = page.locator("#trust-browser-button")
            if not visible(trust):
                trust = page.get_by_role("button", name=re.compile(r"yes,? this is my device", re.I))
            if visible(trust):
                trust.first.click()
                continue

            code = duo_code(page)
            if code and code != last_code:
                if codes_sent >= DUO_TRIES:
                    raise LoginFailed("Duo push wasn't answered")
                last_code, codes_sent = code, codes_sent + 1
                print(f"Duo wants a code; sent it to the phone ({codes_sent}/{DUO_TRIES})", flush=True)
                notify("UF login: Duo code", f"Enter {code} in Duo Mobile", "urgent", "key")
                deadline = max(deadline, time.monotonic() + 120)

            retry = page.get_by_role("button", name=re.compile(r"try again|send (?:me )?a(?:nother)? push", re.I))
            if visible(retry):
                if codes_sent >= DUO_TRIES:
                    raise LoginFailed("Duo push wasn't answered")
                retry.first.click()
                last_code = None
                continue

        time.sleep(1)
    raise LoginFailed(f"Login didn't finish (stuck on {page.url.split('?')[0]})")


def chromium_options():
    opts = {"headless": True}
    if os.path.exists(SYSTEM_CHROMIUM):
        opts["executable_path"] = SYSTEM_CHROMIUM
    return opts


def relogin():
    username, password = read_lines(GATORLINK)[:2]
    os.makedirs(PROFILE, exist_ok=True)
    with sync_playwright() as p:
        # Look like the normal Chromium it is, rather than "HeadlessChrome"
        probe = p.chromium.launch(**chromium_options())
        user_agent = probe.new_page().evaluate("navigator.userAgent").replace("HeadlessChrome", "Chrome")
        probe.close()

        context = p.chromium.launch_persistent_context(
            PROFILE, **chromium_options(), user_agent=user_agent,
            viewport={"width": 1280, "height": 900}, locale="en-US", timezone_id="America/New_York",
        )
        page = context.pages[0] if context.pages else context.new_page()
        try:
            log_in(page, username, password)
            page.goto("https://one.uf.edu/", wait_until="networkidle")
            cookies = context.cookies("https://one.uf.edu/")
        except Exception:
            save_debug(page)
            raise
        finally:
            context.close()
    if not cookies:
        raise LoginFailed("one.uf.edu set no cookies after logging in")
    write_private(COOKIE, "; ".join(f"{c['name']}={c['value']}" for c in cookies) + "\n")


def setup():
    os.makedirs(CONFIG, mode=0o700, exist_ok=True)
    username = input("GatorLink username: ").strip()
    password = getpass.getpass("GatorLink password: ")
    write_private(GATORLINK, f"{username}\n{password}\n")
    if not os.path.exists(NTFY):
        write_private(NTFY, f"https://ntfy.sh/uf-login-{secrets.token_urlsafe(12)}\n")
    topic = read_lines(NTFY)[0].strip()
    print(f"\nIn the ntfy app on your phone, subscribe to:\n  {topic}\n")
    input("Press Enter once you've subscribed to send a test notification...")
    notify("UF login", "Notifications from the Pi work", "default", "white_check_mark")
    input("Got it? Press Enter to log in (have Duo Mobile ready)...")
    return main(force=True)


def main(force=False):
    if not force and dt.datetime.now().hour in QUIET_HOURS:
        print("Quiet hours; not logging in to UF until morning", flush=True)
        return 2
    try:
        relogin()
    except LoginFailed as e:
        print(f"UF login failed: {e}", flush=True)
        if "wasn't answered" not in str(e):
            notify_failure(str(e))
        return 1
    except Exception as e:
        print(f"UF login failed: {e!r}", flush=True)
        notify_failure(f"relogin.py crashed: {str(e).splitlines()[0][:200]}")
        return 1
    try:
        os.remove(FAILURE)
    except FileNotFoundError:
        pass
    print("Logged in to UF; saved the new cookie", flush=True)
    notify("UF login renewed", "The Pi has a fresh UF session", "low", "white_check_mark")
    return 0


if __name__ == "__main__":
    if "--setup" in sys.argv:
        sys.exit(setup())
    sys.exit(main())
