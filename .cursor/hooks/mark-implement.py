#!/usr/bin/env python3
"""Remember that this conversation invoked /implement, so the stop hook can commit its work."""

import hashlib
import json
import os
import re
import sys
from pathlib import Path

IMPLEMENT = re.compile(r"(?:^|\s)/implement(?:\s|$)")


def marker_path() -> Path:
    project = Path(os.environ.get("CURSOR_PROJECT_DIR") or os.getcwd())
    key = os.environ.get("CURSOR_TRANSCRIPT_PATH") or str(project)
    digest = hashlib.sha256(key.encode()).hexdigest()[:16]
    return project / ".cursor" / "hooks" / "state" / f"implement-{digest}"


def invoked(data: dict) -> bool:
    parts = [data.get("prompt") or ""]
    for attachment in data.get("attachments") or []:
        if isinstance(attachment, dict):
            parts.append(attachment.get("file_path") or "")
    text = "\n".join(parts)
    return bool(IMPLEMENT.search(text)) or "implement/SKILL.md" in text


def main() -> None:
    data = json.load(sys.stdin)
    if invoked(data):
        path = marker_path()
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text("pending\n")
    print(json.dumps({"continue": True}))


if __name__ == "__main__":
    try:
        main()
    except Exception:
        print(json.dumps({"continue": True}))
        sys.exit(0)
