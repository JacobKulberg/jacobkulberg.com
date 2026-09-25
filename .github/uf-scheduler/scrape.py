#!/usr/bin/env python3
"""
Refresh course data for /projects/uf-scheduler (a static copy of Andy Chen's
UF Scheduler, https://github.com/andychen482/UF-Scheduler).

Ports the scrapers from https://github.com/andychen482/UF-Scheduler-Backend-New
(pythonScripts/UFCourseGrabber.py and scrapeRMP.py):

  1. Find the current and upcoming terms UF has published.
  2. Page through UF's Schedule of Courses API for each and clean the courses
     the same way UFCourseGrabber.py does.
  3. Look up RateMyProfessors ratings for instructors not checked in the last
     week (cached between runs) and merge them in, as scrapeRMP.py does.
  4. Write <out>/courses_<yy>_<term>.js per term and <out>/terms.js.

UF only includes meeting times for logged-in users, so the UF_COOKIE
environment variable should hold the Cookie header of a logged-in one.uf.edu
session. It is only ever sent to one.uf.edu and never logged. If no times come
back (no cookie, or the session expired), the published copy of each term is
kept when it has times, and "login_expired=true" is written to $GITHUB_OUTPUT.

If a term can't be scraped, or comes back far smaller than the published copy,
the published copy at --fallback-url is reused so a UF outage never takes
courses off the site. Exits non-zero only if no term could be produced.

Standard library only.
"""

import argparse
import base64
import datetime as dt
import gzip
import json
import os
import sys
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor

SOC_URL = "https://one.uf.edu/apix/soc/schedule/?category=RES&term={code}&last-control-number={cursor}"
RMP_URL = "https://www.ratemyprofessors.com/graphql"
RMP_SCHOOL_ID = "U2Nob29sLTExMDA="  # University of Florida
# RMP's public web-client credential ("test:test"), same as scrapeRMP.py
RMP_AUTH = "Basic " + base64.b64encode(b"test:test").decode()

USER_AGENT = (
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/140.0.0.0 Safari/537.36"
)

TERM_CODES = {"spring": "1", "summer": "5", "fall": "8"}
# Approximate (month, day) each term starts and ends, for picking which terms
# are still relevant and which one to open by default
TERM_DATES = {
    "spring": ((1, 5), (5, 5)),
    "summer": ((5, 10), (8, 10)),
    "fall": ((8, 20), (12, 20)),
}
SECTION_KEYS_TO_DROP = ["EEP", "LMS", "acadCareer", "addEligible", "dNote"]

RMP_STALE_DAYS = 7
RMP_WORKERS = 4
# Stop looking up ratings for this run after this many failures (RMP down or
# blocking us); cached ratings are still used
RMP_MAX_FAILURES = 25
MAX_RETRIES = 3
# A scrape smaller than this fraction of the published copy is treated as a
# partial failure
MIN_SIZE_RATIO = 0.5


def log(msg):
    print(msg, flush=True)


def http(url, data=None, headers=None, timeout=60):
    """GET (or POST when data is given), retrying on 429/5xx and network errors."""
    headers = {"User-Agent": USER_AGENT, "Accept-Encoding": "gzip", **(headers or {})}
    for attempt in range(MAX_RETRIES + 1):
        req = urllib.request.Request(url, data=data, headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=timeout) as res:
                body = res.read()
                if res.headers.get("Content-Encoding") == "gzip":
                    body = gzip.decompress(body)
                return body
        except urllib.error.HTTPError as e:
            if e.code != 429 and e.code < 500 or attempt == MAX_RETRIES:
                raise
        except (urllib.error.URLError, TimeoutError, ConnectionError):
            if attempt == MAX_RETRIES:
                raise
        time.sleep(2 * 2**attempt)


# ---------------------------------------------------------------------------
# Terms
# ---------------------------------------------------------------------------


def term_key(term, yy):
    return f"{yy:02d}_{term}"


def term_value(term, yy):
    """The app's name for a term, e.g. "spring 27"."""
    return f"{term} {yy:02d}"


def term_dates(term, yy):
    (sm, sd), (em, ed) = TERM_DATES[term]
    return dt.date(2000 + yy, sm, sd), dt.date(2000 + yy, em, ed)


def candidate_terms(today):
    """Terms that haven't ended yet and start within about a year, in order."""
    out = []
    for yy in (today.year % 100, today.year % 100 + 1):
        for term in ("spring", "summer", "fall"):
            start, end = term_dates(term, yy)
            if end >= today and start <= today + dt.timedelta(days=400):
                out.append((term, yy))
    return out


def uf_headers():
    cookie = os.environ.get("UF_COOKIE", "").strip()
    return {"Cookie": cookie} if cookie else {}


def soc_page(term, yy, cursor):
    code = f"2{yy:02d}{TERM_CODES[term]}"
    body = http(SOC_URL.format(code=code, cursor=cursor), headers=uf_headers())
    data = json.loads(body)
    if not isinstance(data, list) or not data:
        raise ValueError(f"Unexpected response for {term} {yy}: {body[:200]!r}")
    return data[0]


def is_published(term, yy):
    return soc_page(term, yy, 0).get("RETRIEVEDROWS", 0) > 0


# ---------------------------------------------------------------------------
# Courses (UFCourseGrabber.py)
# ---------------------------------------------------------------------------


def scrape_term(term, yy):
    """All raw courses for a term, following the API's cursor one page at a time."""
    courses, cursor, pages = [], 0, 0
    while True:
        page = soc_page(term, yy, cursor)
        if page.get("RETRIEVEDROWS", 0) == 0:
            break
        courses.extend(page.get("COURSES", []))
        pages += 1
        next_cursor = page.get("LASTCONTROLNUMBER")
        if not isinstance(next_cursor, int) or next_cursor <= cursor:
            raise ValueError(f"Cursor stopped advancing at {cursor} for {term} {yy}")
        cursor = next_cursor
        if pages > 2000:
            raise ValueError(f"Too many pages for {term} {yy}")
    log(f"{term} {yy}: {pages} pages, {len(courses)} raw courses")
    return courses


def to_24_hour(t):
    try:
        return dt.datetime.strptime(t, "%I:%M %p").strftime("%H:%M")
    except (TypeError, ValueError):
        return t


def clean_courses(raw):
    """Same cleanup as alphabeticalNoDuplicates() in UFCourseGrabber.py."""
    unique = {json.dumps(c, sort_keys=True) for c in raw}
    courses = [json.loads(c) for c in unique]
    courses.sort(key=lambda c: (c["code"], c["name"], c.get("termInd", "")))
    for course in courses:
        course["codeWithSpace"] = course["code"][:3] + " " + course["code"][3:]
        for section in course.get("sections", []):
            for key in SECTION_KEYS_TO_DROP:
                section.pop(key, None)
            section["courseCode"] = course["code"]
            for meet in section.get("meetTimes", []):
                meet["meetTimeBegin"] = to_24_hour(meet.get("meetTimeBegin"))
                meet["meetTimeEnd"] = to_24_hour(meet.get("meetTimeEnd"))
    return courses


def timed_sections(courses):
    """Sections with meeting times; zero everywhere means we weren't logged in."""
    return sum(1 for c in courses for s in c.get("sections", []) if s.get("meetTimes"))


def instructor_names(courses):
    return {
        inst["name"]
        for c in courses
        for s in c.get("sections", [])
        for inst in s.get("instructors", [])
        if inst.get("name")
    }


# ---------------------------------------------------------------------------
# Ratings (scrapeRMP.py)
# ---------------------------------------------------------------------------

RMP_QUERY = """
query NewSearchTeachersQuery($query: TeacherSearchQuery!) {
  newSearch {
    teachers(query: $query) {
      edges { node { legacyId firstName lastName numRatings avgRatingRounded avgDifficultyRounded } }
    }
  }
}
"""


def fetch_rating(name):
    """RMP rating for an exact name match at UF, or None if there isn't one."""
    payload = json.dumps(
        {"query": RMP_QUERY, "variables": {"query": {"text": name, "schoolID": RMP_SCHOOL_ID}}}
    ).encode()
    body = http(
        RMP_URL,
        data=payload,
        headers={
            "Authorization": RMP_AUTH,
            "Content-Type": "application/json",
            "Origin": "https://www.ratemyprofessors.com",
        },
        timeout=30,
    )
    edges = (
        json.loads(body).get("data", {}).get("newSearch", {}).get("teachers", {}).get("edges", [])
    )
    for edge in edges:
        node = edge["node"]
        if node["numRatings"] > 0 and f"{node['firstName']} {node['lastName']}".lower() == name.lower():
            return {
                "avgRating": node.get("avgRatingRounded"),
                "avgDifficulty": node.get("avgDifficultyRounded"),
                "professorID": node.get("legacyId"),
            }
    return None


def update_ratings(names, cache_path, now):
    """Refresh stale ratings in the cache file and return {name: rating}."""
    try:
        with open(cache_path) as f:
            cache = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        cache = {}

    def stale(name):
        checked = cache.get(name, {}).get("checked")
        return not checked or now - dt.datetime.fromisoformat(checked) >= dt.timedelta(days=RMP_STALE_DAYS)

    todo = sorted(n for n in names if stale(n))
    log(f"RMP: {len(names)} instructors, {len(todo)} to check")
    failures = 0

    def check(name):
        nonlocal failures
        if failures >= RMP_MAX_FAILURES:
            return
        try:
            rating = fetch_rating(name)
        except Exception as e:  # keep the old cached rating, retry next run
            failures += 1
            if failures <= 5:
                log(f"RMP lookup failed for {name}: {e}")
            elif failures == RMP_MAX_FAILURES:
                log("RMP: too many failures, skipping the rest until next run")
            return
        entry = {"checked": now.isoformat()}
        entry["rating"] = rating or cache.get(name, {}).get("rating")
        cache[name] = entry
        if rating:
            time.sleep(0.5)  # same spacing as scrapeRMP.py

    with ThreadPoolExecutor(RMP_WORKERS) as pool:
        list(pool.map(check, todo))
    if failures:
        log(f"RMP: {failures} lookups failed")

    os.makedirs(os.path.dirname(os.path.abspath(cache_path)), exist_ok=True)
    with open(cache_path, "w") as f:
        json.dump(cache, f)
    return {n: e["rating"] for n, e in cache.items() if e.get("rating")}


def merge_ratings(courses, ratings):
    for c in courses:
        for s in c.get("sections", []):
            for inst in s.get("instructors", []):
                if inst.get("name") in ratings:
                    inst.update(ratings[inst["name"]])


# ---------------------------------------------------------------------------
# Output
# ---------------------------------------------------------------------------


def courses_js(key, courses):
    data = json.dumps(courses, separators=(",", ":"))
    return f"(window.__UF_COURSES__=window.__UF_COURSES__||{{}})[{json.dumps(key)}]={data};\n"


def fetch_published(fallback_url, filename):
    try:
        return http(f"{fallback_url.rstrip('/')}/{filename}").decode()
    except Exception as e:
        log(f"No published copy of {filename}: {e}")
        return None


def published_manifest(fallback_url):
    text = fetch_published(fallback_url, "terms.js") if fallback_url else None
    if not text:
        return {}
    try:
        return json.loads(text[text.index("=") + 1 :].rstrip().rstrip(";"))
    except ValueError:
        return {}


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--out", required=True, help="data directory next to the app's index.html")
    ap.add_argument("--rmp-cache", required=True, help="JSON file that keeps ratings between runs")
    ap.add_argument("--fallback-url", help="published data directory to reuse when a scrape fails")
    ap.add_argument("--skip-rmp", action="store_true", help="don't contact RateMyProfessors")
    args = ap.parse_args()

    now = dt.datetime.now(dt.timezone.utc).replace(microsecond=0)
    today = now.date()
    published = published_manifest(args.fallback_url)
    published_counts = published.get("counts", {})
    published_timed = published.get("timed", {})
    if not uf_headers():
        log("UF_COOKIE is not set; UF will leave out meeting times")

    # Which terms to publish
    terms, unknown = [], []
    for term, yy in candidate_terms(today):
        try:
            if is_published(term, yy):
                terms.append((term, yy))
        except Exception as e:
            log(f"Couldn't check {term} {yy}: {e}")
            unknown.append((term, yy))
    # Keep terms we already publish if UF couldn't be reached to confirm them
    for term, yy in unknown:
        if term_value(term, yy) in published.get("terms", []):
            terms.append((term, yy))
    terms.sort(key=lambda t: term_dates(*t)[0])
    log(f"Terms: {[term_value(*t) for t in terms]}")

    # Scrape (terms in parallel, each one page at a time)
    def scrape(t):
        try:
            return t, clean_courses(scrape_term(*t))
        except Exception as e:
            log(f"Scrape failed for {term_value(*t)}: {e}")
            return t, None

    with ThreadPoolExecutor(3) as pool:
        scraped = dict(pool.map(scrape, terms))

    if not args.skip_rmp:
        names = set().union(*(instructor_names(c) for c in scraped.values() if c))
        ratings = update_ratings(names, args.rmp_cache, now)
        for courses in scraped.values():
            if courses:
                merge_ratings(courses, ratings)

    # Logged in if any term came back with meeting times. (A term UF hasn't
    # scheduled yet can legitimately have none, so one empty term isn't enough.)
    logged_in = any(timed_sections(c) for c in scraped.values() if c)
    if not logged_in and any(scraped.values()):
        log("::warning::No meeting times from UF. The UF_COOKIE login is missing or expired.")

    # Write, reusing the published copy for failed or suspiciously small scrapes,
    # and for scrapes without times when the published copy has them
    os.makedirs(args.out, exist_ok=True)
    written, counts, timed = [], {}, {}
    for t in terms:
        key, value = term_key(*t), term_value(*t)
        filename = f"courses_{key}.js"
        courses = scraped.get(t)
        old_count = published_counts.get(value)
        if courses is not None and old_count and len(courses) < MIN_SIZE_RATIO * old_count:
            log(f"{value}: only {len(courses)} courses vs {old_count} published; keeping published copy")
            courses = None
        if courses is not None and not logged_in and published_timed.get(value):
            log(f"{value}: no meeting times; keeping published copy, which has them")
            courses = None
        if courses is not None:
            text, counts[value] = courses_js(key, courses), len(courses)
            timed[value] = timed_sections(courses)
        else:
            text = fetch_published(args.fallback_url, filename) if args.fallback_url else None
            if text is None:
                log(f"{value}: dropped (no scrape and no published copy)")
                continue
            counts[value] = old_count
            timed[value] = published_timed.get(value, 0)
        with open(os.path.join(args.out, filename), "w") as f:
            f.write(text)
        written.append(t)
        log(f"{value}: {counts[value]} courses, {timed[value]} sections with times -> {filename}")

    if not written:
        log("No course data could be produced")
        sys.exit(1)

    # Open the next term that hasn't started (what students are planning),
    # or the latest one
    upcoming = [t for t in written if term_dates(*t)[0] > today]
    default = upcoming[0] if upcoming else written[-1]
    manifest = {
        "terms": [term_value(*t) for t in written],
        "default": term_value(*default),
        "updated": now.isoformat(),
        "counts": counts,
        "timed": timed,
        "login_ok": logged_in,
    }
    with open(os.path.join(args.out, "terms.js"), "w") as f:
        f.write(f"window.__UF_TERMS__={json.dumps(manifest)};\n")
    log(f"Wrote terms.js: {manifest['terms']} (default {manifest['default']})")

    if not logged_in and os.environ.get("GITHUB_OUTPUT"):
        with open(os.environ["GITHUB_OUTPUT"], "a") as f:
            f.write("login_expired=true\n")


if __name__ == "__main__":
    main()
