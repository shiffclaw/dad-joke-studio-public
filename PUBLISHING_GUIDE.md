# Publishing Guide

Instructions for publishing content to the Dad Joke Studio public site.
This guide is for Tasha (Distribution & Feedback) and anyone else who
needs to update the public site.

## Repository

The public site lives at:
- Repo: `git@github.com:shiffclaw/dad-joke-studio-public.git`
- Live URL: `https://shiffclaw.github.io/dad-joke-studio-public/`

The site is static HTML served by GitHub Pages. To publish changes,
commit and push to the `main` branch. Updates go live within ~60 seconds.

## Publishing a New Short

When a dad joke video is uploaded to YouTube, add it to the public site:

1. Open `data/shorts.json`
2. Add a new entry at the **top** of the array (newest first):
   ```json
   {
     "youtubeId": "THE_YOUTUBE_VIDEO_ID",
     "title": "The joke setup or title ...",
     "date": "YYYY-MM-DD"
   }
   ```
3. The `youtubeId` is the part after `v=` in a YouTube URL, or after
   `youtu.be/`. For example:
   - `https://www.youtube.com/watch?v=abc123` → `"youtubeId": "abc123"`
   - `https://youtu.be/abc123` → `"youtubeId": "abc123"`
   - `https://youtube.com/shorts/abc123` → `"youtubeId": "abc123"`
4. Commit and push.

The shorts page displays 6 videos per page in reverse chronological order
(newest first) with pagination.

## Publishing a Comic Strip

When the show-runner produces a weekly comic strip:

1. Save the full-page comic image to `comics/issue-NNN.jpg`
   (use zero-padded 3-digit issue numbers: `issue-001.jpg`, `issue-002.jpg`, etc.)
2. Open `data/comics.json` and append a new entry:
   ```json
   {
     "issue": 1,
     "title": "The title of this issue",
     "date": "YYYY-MM-DD",
     "image": "comics/issue-001.jpg",
     "thumbnail": "comics/issue-001.jpg"
   }
   ```
3. Commit and push.

The homepage automatically shows the latest issue. The archive page shows
all issues in reverse order as a browsable grid.

## Updating the Pipeline Board

After each work day, publish a snapshot of the joke pipeline:

1. Open `data/pipeline.json`
2. Replace the contents with the current day's status:
   ```json
   {
     "date": "YYYY-MM-DD",
     "columns": [
       {
         "stage": "Scouting",
         "items": [
           {"id": "seed-030", "label": "New batch from Zoe"}
         ]
       },
       {
         "stage": "Writing",
         "items": [
           {"id": "seed-028", "label": "Milo rewriting punchline"}
         ]
       },
       {
         "stage": "Casting",
         "items": []
       },
       {
         "stage": "Visual Dev",
         "items": [
           {"id": "seed-025", "label": "Iris concept A/B ready"}
         ]
       },
       {
         "stage": "Production",
         "items": [
           {"id": "seed-020", "label": "Vince assembling first cut"}
         ]
       }
     ]
   }
   ```
3. Valid stage names: `Scouting`, `Writing`, `Casting`, `Visual Dev`, `Production`
4. Each item needs an `id` (the seed ID) and a short `label` (what's happening).
5. Commit and push.

## Updating Team Bios

Team bios are in `data/team.json`. Each entry has:
```json
{
  "name": "Full Name",
  "role": "Their Role",
  "avatar": "images/team/firstname.jpg",
  "bio": "A short paragraph about them."
}
```

To update a bio, edit the `bio` field. To update an avatar, replace the
image file in `images/team/` and keep the same filename.

## Git Workflow

Every publish follows the same pattern:

```bash
cd /home/shiffclaw/dad-joke-studio-public
# make your changes to data files / images
git add -A
git commit -m "Publish: brief description of what changed"
git push
```

The site updates automatically via GitHub Pages.

## File Reference

| File | Purpose |
|------|---------|
| `data/shorts.json` | YouTube shorts catalog (newest first) |
| `data/comics.json` | Comic strip issues |
| `data/pipeline.json` | Daily pipeline snapshot |
| `data/team.json` | Team bios and avatars |
| `comics/` | Comic strip images |
| `images/team/` | Team avatar photos |
