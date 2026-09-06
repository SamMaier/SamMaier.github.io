# SamMaier.github.io
Tres Fute scoresheet

## Current implementation target

The active score-sheet project is **Clever 4ever** in `clever4ever/`. Its implementation guide is `clever4ever/README.md`, its visual reference is `clever4ever/clever4ever.jpg`, and the root `iteration.md` contains the working visual and functional checklist. Clever Cubed remains available as an earlier app and a source of established UI patterns, but it is not the current target.

## Offline mobile use

The site is an installable Progressive Web App. Open the GitHub Pages site once while online, then use **Add to Home Screen** in Safari on iPhone or **Install app / Add to Home screen** in Chrome on Android. The service worker precaches all six tools—including Clever 4ever—and their local HTML, CSS, and JavaScript, so they remain available without a connection.

The site intentionally has no backend or runtime network requirement. The original Google Fonts dependency was removed so the pages remain self-contained after installation.

## Git commits from Codex

This repository uses the `origin` remote and the `master` branch. Before committing, check the working tree and review the changes:

```powershell
git status --short --branch
git diff
```

Then commit it.

```powershell
git add -A
git -c user.name="Sam Maier" -c user.email="sam@maierweb.ca" commit -m "Describe the changes"
```

Verify the result with `git log -1 --format="%h %an <%ae> %s"`. A commit is local; push it separately with `git push origin master` when publishing to GitHub is intended.
