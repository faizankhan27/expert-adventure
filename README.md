# Finish It — Stair Set Tracker

A static web app (plain HTML, CSS and JavaScript, no build step) that tracks stair sets
(20 up + 20 down) and jump rope sets, estimates calories burned, keeps a 7-day history,
a daily streak, and a countdown to your goal date. It works offline and can be installed
on your phone like an app.

## Files

| File | What it does |
| --- | --- |
| `index.html` | Page structure |
| `style.css` | Crimson theme and animations |
| `app.js` | Tracking, calories, streak, confetti, goal countdown, saving |
| `manifest.json` | Makes it installable ("Add to Home Screen") |
| `sw.js` | Service worker for offline use |
| `assets/hero.jpg` | Banner image |
| `icons/` | App icons |
| `package.json` | Optional, only has a `start` script for local testing |
| `.nojekyll` | Tells GitHub Pages to serve files as they are |

## Run it locally

A service worker needs `http://`, so don't just double-click `index.html`.
From this folder, run either:

    python3 -m http.server 8000      # then open http://localhost:8000
    npx serve .                      # or: npm start

## Put it online with GitHub Pages (free)

1. Create a new repository on GitHub (for example `stair-tracker`).
2. Upload **all** files and folders from this directory (keep `assets/` and `icons/`).
   With git:

       git init
       git add .
       git commit -m "Stair tracker"
       git branch -M main
       git remote add origin https://github.com/<your-username>/stair-tracker.git
       git push -u origin main

3. In the repository go to **Settings → Pages → Build and deployment**, choose
   **Deploy from a branch**, select `main` and `/ (root)`, then **Save**.
4. After a minute the app is live at `https://<your-username>.github.io/stair-tracker/`.
5. On your phone, open that link, then use **Add to Home Screen** (Share menu on iPhone,
   browser menu on Android).

## Good to know

- Your history is saved in the browser's local storage on that device. It does not sync
  between devices, and clearing site data erases it.
- Calories are estimates: about 2.4 kcal per stair set and 12.8 kcal per 100 jumps at 85 kg,
  scaled by weight, stair height and pace (edit them under "Your numbers").
- Streak: a day counts when you reach your stair-set goal (30 by default, editable).
- Goal date defaults to 25 December 2026 and can be changed in "Your numbers".
- After you edit files and push them, the app picks up changes on the next load while
  online. If you ever see old files, change `CACHE` in `sw.js` (for example to `finish-it-v2`).
