#!/usr/bin/env python3
"""Send the owner a phone notification (via ntfy.sh) about a submitted puzzle.

Usage (from the submissions routine, see SUBMISSIONS.md):
    NTFY_TOPIC=… python3 scripts/notify.py "<title>" "<message>" <issue URL>

The topic is a secret: it comes from the routine's private prompt, never from the repo.
"""

from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request


def main() -> int:
    topic = os.environ.get("NTFY_TOPIC")
    if not topic or len(sys.argv) != 4:
        print(__doc__, file=sys.stderr)
        return 1
    title, message, url = sys.argv[1:]

    payload = {
        "topic": topic,
        "title": title,
        "message": message,
        "tags": ["link"],
        "click": url,
        "actions": [{"action": "view", "label": "Voir et répondre", "url": url}],
    }
    request = urllib.request.Request(
        "https://ntfy.sh",
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json"},
    )
    try:
        urllib.request.urlopen(request, timeout=30).close()
    except urllib.error.URLError as exc:
        print(f"ERROR: ntfy refused the notification: {exc}", file=sys.stderr)
        return 1
    print(f"notified: {title}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
