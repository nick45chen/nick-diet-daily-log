# Repository Guidelines

## Project Structure & Module Organization
This repository is a static GitHub Pages site. The UI lives in [index.html](/Users/knst/Documents/Nick/Project/nick-diet-daily-log/index.html), which contains the HTML, CSS, and JavaScript for rendering meal logs and InBody data.

- `data/YYYY-MM-DD.json`: daily meal records
- `data/inbody/YYYY-MM-DD.json`: body measurement records
- `data/manifest.json`: index of available dates and `lastUpdated`
- `data/goals.json`: nutrition targets
- `images/meals/`: meal photos, e.g. `2026-04-13-breakfast-1.jpg`
- `images/inbody/`: InBody report images

## Build, Test, and Development Commands
There is no build step or package manager in this project.

- `python3 -m http.server 8000`: run the site locally from the repo root
- `open http://localhost:8000`: view the site in a browser on macOS
- `git status --short`: confirm staged vs. unstaged changes before committing

For production, GitHub Pages serves directly from the `main` branch root.

## Coding Style & Naming Conventions
Use 2-space indentation in JSON, HTML, CSS, and JavaScript. Keep UI text and nutrition advice in Traditional Chinese. Use `YYYY-MM-DD` for all date-based filenames and JSON fields.

Meal image naming must follow the existing pattern:
- `images/meals/YYYY-MM-DD-breakfast-1.jpg`
- Meal keys in JSON use Chinese labels such as `早餐`, `午餐`, `晚餐`, `點心`, `消夜`

Prefer small, targeted edits in `index.html`; keep helper functions near the existing utilities section.

## Testing Guidelines
There is no formal automated test suite yet. Validate changes by:

- loading the site locally
- checking the current day, history view, and InBody view
- confirming new JSON paths resolve to the correct images
- verifying `data/manifest.json` includes the updated date list and timestamp

If you change caching or fetch behavior, also verify the deployed GitHub Pages site refreshes data as expected.

## Commit & Pull Request Guidelines
Recent history uses short conventional-style subjects such as `feat: ...` and `changed: ...`. Follow that format with a concise, specific title, for example `changed: update 2026-04-13 meal log`.

Pull requests should include:
- a short summary of user-visible changes
- affected data files or image renames
- screenshots for UI changes
- notes on any GitHub Pages caching behavior or deployment impact
