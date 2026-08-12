# SamMaier.github.io
Tres Fute scoresheet

## Offline mobile use

The site is an installable Progressive Web App. Open the GitHub Pages site once while online, then use **Add to Home Screen** in Safari on iPhone or **Install app / Add to Home screen** in Chrome on Android. The service worker precaches all five tools and their local HTML, CSS, and JavaScript, so they remain available without a connection.

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
