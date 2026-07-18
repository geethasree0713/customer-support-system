# Support Ticket Hub

A customer support ticketing system — customer portal, agent dashboard, analytics, and a knowledge base. Plain HTML/CSS/JS, no build step required.

- `index.html` — Customer portal (create + track tickets)
- `agent.html` — Agent dashboard (filters, assignment, status, internal notes, SLA countdowns)
- `analytics.html` — Analytics (Chart.js charts, resolution time, CSAT)
- `knowledge.html` — Knowledge base + DB/EmailJS config drawer
- `js/firebase.js` — Data layer. Uses Firebase Firestore/Storage if you configure it, otherwise **automatically falls back to localStorage** so the app is fully usable with zero setup.
- `js/email.js` — Sends real email via EmailJS if you configure keys, otherwise logs a "virtual email" to the in-app Notification Center so you can demo the flow without any account.

## Run locally

No build step. Just serve the folder statically, e.g.:

```bash
npx serve .
# or
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

> Don't just double-click `index.html` (a `file://` URL) — the `type="module"` scripts won't load. Always serve it over http.

## Connect real Firebase / EmailJS (optional)

The app works out of the box with localStorage + a virtual email console. To go fully live:

1. Open any page → click the settings/bell icon (top right) to open the drawer.
2. Paste your Firebase config JSON (from Firebase Console -> Project Settings -> your web app) and click Save.
3. Paste your EmailJS Public Key / Service ID / Template ID and click Save Keys.

Both are stored in the browser's localStorage — no code changes or redeploy needed.

## Deploy to Vercel

This is a static site — no framework, no build command.

1. Push this folder to a GitHub repo.
2. In Vercel: New Project -> Import the repo.
3. Framework preset: Other (or "No Framework"). Leave Build Command / Output Directory blank.
4. Deploy.

## Notes

- Ticket data, config, and email logs live in the browser's localStorage by default — each browser/device has its own local data unless you connect real Firebase.
- Chart.js is loaded via CDN in `analytics.html`; Tailwind CSS is loaded via CDN (`cdn.tailwindcss.com`) in all four pages.
