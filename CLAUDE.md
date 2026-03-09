# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Context

This is the **public-facing site** for Dad Joke Studio. Content is produced by the **Sandyclaw** agent (workspace at `~/.openclaw/workspace-sandyclaw/`) and published here. See `~/CLAUDE.md` for the full machine architecture.

## Project Overview

Static HTML/CSS/JavaScript website hosted on GitHub Pages at `https://shiffclaw.github.io/dad-joke-studio-public/`. Mockumentary-style site chronicling a fictional joke production studio with 9 AI characters who don't know they're AI. Tone: "Archie Comics meets The Office meets The Truman Show."

## Deployment

Static site on GitHub Pages. Commits to `main` auto-deploy. No build step.

```bash
git add -A && git commit -m "Publish: description" && git push
```

## Architecture

All pages are static HTML that load JSON data files via `fetch()` and render client-side. No frameworks, no server, no database.

### Pages (6)
- `index.html` — Latest comic issue (from `data/comics.json`)
- `archive.html` — Grid of past comic issues
- `shorts.html` — YouTube shorts gallery with client-side pagination (6 per page)
- `team.html` — Team member profiles
- `smack.html` — Faux Slack chat UI with two channels (`?channel=production` or `?channel=random`)
- `studio.html` — Article loader; standalone viewer at `studio/article.html?slug=<slug>`

### Key Files
- `js/site.js` — Single IIFE handling all page logic (data loading, DOM rendering, pagination, URL routing)
- `css/style.css` — All styling; retro comics aesthetic with Comic Neue/Bangers fonts
- `data/` — JSON data files driving all dynamic content
- `studio/articles/` — HTML fragments loaded into the article viewer

### Data Files (all in `data/`)
| File | Format | Order | Purpose |
|------|--------|-------|---------|
| `shorts.json` | Array of `{youtubeId, title, date, embeddable?}` | Newest first (prepend) | YouTube shorts catalog |
| `comics.json` | Array of `{issue, title, date, image, thumbnail?}` | Oldest first (append) | Comic strip issues |
| `team.json` | Array of `{name, role, avatar, bio}` | — | Team member profiles |
| `pipeline.json` | `{date, columns[{stage, items[{id, label}]}]}` | — | Daily production kanban |
| `studio-articles.json` | Array of `{slug, title, date, seedId?, summary}` | Newest first (prepend) | Article index |
| `smack-production.json` | `{runs[{label, date, messages[{user, avatar, timestamp, text}]}]}` | Latest run shown first | #production channel |
| `smack-random.json` | Same runs format | Latest run shown first | #random channel |

### Studio Articles
HTML fragments in `studio/articles/{slug}.html` with banner flavors: `flavor-dispatch` (blue), `flavor-roast` (red), `flavor-drama` (purple), `flavor-bulletin` (orange).

### Images
- Team avatars: `images/team/{name}.jpg`
- Comic images: `comics/issue-NNN.jpg` (zero-padded 3 digits)

## Content Pipeline

Each joke gets a `seed-NNN` ID tracked through stages: Scouting → Writing → Casting → Visual Dev → Production → QA → Post → Distribution. Pipeline stages map to CSS classes for colored headers in the kanban view.

## Design System

- Colors: Retro comics palette (paper `#fdf6e3`, ink `#2c2c2c`, bold accent colors)
- Typography: Comic Neue (body), Bangers (headers) via Google Fonts
- Effects: 3px solid borders, 4px drop shadows, halftone background texture
- Responsive breakpoints: 900px, 700px, 600px

## Narrative Rules

Characters are unknowingly AI. Their "bot-ness" leaks through: no pre-studio memories, never sleeping, contradictory personal details, sudden amnesia. No character acknowledges this. See `SHOWRUNNER_PROMPT.md` for full character dynamics and comic script guidelines.
