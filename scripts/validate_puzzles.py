#!/usr/bin/env python3
"""Validate client/public/puzzles-fr.json before publishing.

Usage:
    python3 scripts/validate_puzzles.py
    python3 scripts/validate_puzzles.py --expect-date 2026-09-25

Checks every puzzle's structure, and that no word or category name is reused
anywhere in the history. Exits non-zero if anything is wrong.
"""

from __future__ import annotations

import argparse
import json
import sys
import unicodedata
from datetime import datetime
from pathlib import Path

PUZZLES_PATH = Path(__file__).resolve().parent.parent / "client" / "public" / "puzzles-fr.json"
LONG_WORD = 12  # WordCard shrinks the font from this length on


def normalize(text: str) -> str:
    """Case- and accent-insensitive key, so THÉ and The count as the same word."""
    decomposed = unicodedata.normalize("NFD", text.strip().upper())
    return "".join(c for c in decomposed if unicodedata.category(c) != "Mn")


def validate(puzzles, expect_date: str | None) -> tuple[list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []

    if not isinstance(puzzles, list):
        return ["top-level JSON must be a list of puzzles"], warnings

    seen_dates: set[str] = set()
    seen_words: dict[str, str] = {}
    seen_names: dict[str, str] = {}
    previous_date = ""

    for i, puzzle in enumerate(puzzles):
        date = puzzle.get("date") if isinstance(puzzle, dict) else None
        where = f"puzzle {date or f'#{i}'}"
        try:
            datetime.strptime(date or "", "%Y-%m-%d")
        except ValueError:
            errors.append(f"{where}: invalid date {date!r}, expected YYYY-MM-DD")
            continue
        if date in seen_dates:
            errors.append(f"{where}: duplicate date")
        if date < previous_date:
            errors.append(f"{where}: puzzles must be sorted by date")
        seen_dates.add(date)
        previous_date = max(previous_date, date)

        groups = puzzle.get("groups")
        if not isinstance(groups, list) or len(groups) != 4:
            errors.append(f"{where}: must have exactly 4 groups")
            continue

        for group in groups:
            name = group.get("name")
            if not isinstance(name, str) or not name.strip():
                errors.append(f"{where}: group without a name")
                continue
            if not isinstance(group.get("emoji"), str) or not group["emoji"].strip():
                errors.append(f"{where}: group {name!r} has no emoji")
            key = normalize(name)
            if key in seen_names:
                errors.append(f"{where}: category {name!r} already used on {seen_names[key]}")
            seen_names[key] = date

            words = group.get("words")
            if not isinstance(words, list) or len(words) != 4:
                errors.append(f"{where}: group {name!r} must have exactly 4 words")
                continue
            for word in words:
                if not isinstance(word, str) or not word.strip():
                    errors.append(f"{where}: empty word in group {name!r}")
                    continue
                if word != word.strip().upper():
                    errors.append(f"{where}: {word!r} must be uppercase with no surrounding spaces")
                if len(word) >= LONG_WORD:
                    warnings.append(f"{where}: {word!r} is long and will be shown in a small font")
                key = normalize(word)
                if key in seen_words:
                    errors.append(f"{where}: word {word!r} already used on {seen_words[key]}")
                seen_words[key] = date

    if expect_date and expect_date not in seen_dates:
        errors.append(f"no puzzle for {expect_date}")

    return errors, warnings


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--expect-date", help="fail unless a puzzle exists for this YYYY-MM-DD date")
    parser.add_argument("--puzzles", type=Path, default=PUZZLES_PATH)
    args = parser.parse_args()

    try:
        puzzles = json.loads(args.puzzles.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        print(f"ERROR: cannot read {args.puzzles}: {exc}", file=sys.stderr)
        return 1

    errors, warnings = validate(puzzles, args.expect_date)
    for warning in warnings:
        print(f"WARNING: {warning}")
    for error in errors:
        print(f"ERROR: {error}", file=sys.stderr)
    if errors:
        return 1
    print(f"OK: {len(puzzles)} puzzle(s) valid")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
