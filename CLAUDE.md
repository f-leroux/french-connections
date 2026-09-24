# French Connections

French clone of NYT Connections, live at https://www.frenchconnections.fr.

- `client/` — React app (create-react-app). Deployed to GitHub Pages (`gh-pages` branch) by
  `.github/workflows/deploy.yml` on every push to `main` that touches `client/`.
- `client/public/puzzles-fr.json` — **the single source of truth**: every puzzle ever published,
  sorted by date. The app shows the puzzle whose `date` equals the player's local date.
- `scripts/validate_puzzles.py` — validates that file (structure + no reused words/categories).
- `puzzle_creation/` — old, unused automation (gitignored). Ignore it.

## Puzzle format

```json
{
    "date": "2026-09-24",
    "groups": [
        {"name": "Boissons chaudes", "emoji": "☕", "words": ["CAFÉ", "TISANE", "CHOCOLAT", "GROG"]},
        ...
    ]
}
```

Groups are listed **easiest first**: index 0 = 🟨 yellow, 1 = 🟩 green, 2 = 🔵 blue, 3 = 🟣 purple.
The UI shuffles the words, so their order in the file doesn't matter.

## Writing a puzzle

Everything is in French, for a French-speaking audience.

- 4 groups of 4 words, 16 distinct words, all UPPERCASE with proper accents (É, È, Ç, Ê…).
- Prefer single words; keep words under 12 characters when possible (longer ones get a small font).
- Difficulty ramps up:
  - 🟨 yellow: an obvious category (fromages, pièces d'échecs…).
  - 🟩 green: still straightforward, a bit more specific.
  - 🔵 blue: needs some culture or a less obvious link.
  - 🟣 purple: wordplay — homophones, hidden words, words that precede/follow a common word,
    anagrams, "se prononcent comme…", etc.
- **Red herrings are what make it fun**: several words should plausibly fit a second group
  (e.g. FOU fits both birds and chess pieces). But the solution must be **unique**: once all the
  constraints are considered, each word fits exactly one group. Check this explicitly.
- Every word must genuinely belong to its category — no stretches, no factual errors.
- Category names are short and clear, as revealed to the player after solving.
- Each group has a fitting emoji.
- Never reuse a word or a category name that already appears in the history (the validator
  enforces this), and avoid themes too close to recent puzzles.

## Daily routine (automated)

A scheduled Claude routine adds tomorrow's puzzle every evening:

1. Tomorrow's date is `TZ=Europe/Paris date -d tomorrow +%F`. If a puzzle for that date already
   exists in `client/public/puzzles-fr.json`, stop — there is nothing to do.
2. Read the whole history in `client/public/puzzles-fr.json` to avoid repeats.
3. Write the puzzle following the rules above; append it at the end of the file (keep the file's
   4-space JSON indentation, `ensure_ascii=False` style — accents written as-is).
4. Run `python3 scripts/validate_puzzles.py --expect-date <tomorrow>` and fix any error.
5. Commit on `main` with message `Puzzle du <tomorrow>` and `git push origin HEAD:main`.
   The deploy workflow publishes it.
