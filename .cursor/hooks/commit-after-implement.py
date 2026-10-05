#!/usr/bin/env python3
"""After an /implement run, ask the agent to commit anything it left unstaged."""

import hashlib
import json
import os
import subprocess
import sys
from pathlib import Path

FOLLOWUP = (
    "The /implement run left uncommitted changes. "
    "Stage them with `git add .`, leaving out secrets such as .env and credentials, "
    "then create one commit. Write the subject and a short body from the diff: "
    "what changed and why, in this repository's commit style. "
    "Do not amend, do not push, and do not create an empty commit. "
    "If a pre-commit hook changes files, include those and make a new commit. "
    "If there is nothing left to commit, stop."
)


def marker_path() -> Path:
    project = Path(os.environ.get("CURSOR_PROJECT_DIR") or os.getcwd())
    key = os.environ.get("CURSOR_TRANSCRIPT_PATH") or str(project)
    digest = hashlib.sha256(key.encode()).hexdigest()[:16]
    return project / ".cursor" / "hooks" / "state" / f"implement-{digest}"


def git(project: str, *args: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["git", *args],
        cwd=project,
        capture_output=True,
        text=True,
        check=False,
    )


def finish(message: dict | None = None) -> None:
    print(json.dumps(message or {}))
    sys.exit(0)


def main() -> None:
    data = json.load(sys.stdin)
    if data.get("status") != "completed":
        finish()

    marker = marker_path()
    if not marker.is_file():
        finish()

    project = os.environ.get("CURSOR_PROJECT_DIR") or os.getcwd()
    if git(project, "rev-parse", "--is-inside-work-tree").returncode != 0:
        marker.unlink(missing_ok=True)
        finish()

    dirty = git(project, "status", "--porcelain").stdout.strip()
    if not dirty:
        marker.unlink(missing_ok=True)
        finish()

    if marker.read_text().strip() == "asked":
        finish()

    marker.write_text("asked\n")
    finish({"followup_message": FOLLOWUP})


if __name__ == "__main__":
    try:
        main()
    except Exception:
        print("{}")
        sys.exit(0)
