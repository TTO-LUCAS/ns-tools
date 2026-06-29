# NAV1 — Invoice Maker

A single-page invoice tool. The client fills in the form, watches the
NAV1-styled invoice update live, and exports a print-ready A4 PDF named
`NS_Invoice_<number>`. No design software, no accounts, no backend.

Built to live behind a password on a non-indexed page.

## Run locally
```bash
npm install
npm run dev          # http://localhost:5173 — export works here
```

## Deploy to Vercel (recommended: GitHub)
1. Push this folder to a new GitHub repo.
2. vercel.com → Add New → Project → import the repo.
3. Framework preset is auto-detected as **Vite**. Click Deploy.

Or via CLI:
```bash
npm i -g vercel
vercel               # follow prompts; accept Vite defaults
vercel --prod        # promote to the production URL
```

## Keep it out of Google (already configured)
Three layers ship with the project, no action needed:
- `<meta name="robots" content="noindex, nofollow">` in `index.html`
- `public/robots.txt` disallowing all crawlers
- `X-Robots-Tag: noindex` response header in `vercel.json`

## Turn on the password (free, Hobby plan)
The gate is HTTP Basic Auth via `middleware.js`. It's OFF until you set a password:
1. Vercel → your project → **Settings → Environment Variables**.
2. Add `AUTH_PASSWORD` = your chosen password. (Optionally `AUTH_USER`, default `navaal`.)
3. Redeploy (Deployments → ⋯ → Redeploy, or push any commit).

Visitors now get a username/password prompt before anything loads. To change
the password, edit the env var and redeploy. To disable, delete `AUTH_PASSWORD`
and redeploy.

## Editing the fixed details (top of `src/InvoiceTool.jsx`)
- `FROM`     — sender name, email, phone, ABN
- `ACCOUNT`  — bank name, BSB, account number  ← replace placeholders when the
              client's banking info arrives, then redeploy
- `GST_RATE` — `0.10` (10%)
- `MUST`     — mustard accent hex, if you want to match the site exactly

## Notes
- Fonts (Neue Haas Unica W1G Medium, EB Garamond) load from the web and render
  once deployed. Helvetica is the fallback.
- Invoice number is a random 5-digit number, regenerated each load and after each
  export; the field is editable if one ever clashes.
- Export opens the invoice in its own A4 window and triggers Save-as-PDF.
