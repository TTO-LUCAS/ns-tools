# NAV1 — Tools

One app, three tools behind a landing page:
- **Invoice Maker**
- **Cold Cover Letter**
- **Known Cover Letter**

Built to sit behind a password on a non-indexed page. Desktop-only (a block
shows on phones, with a "continue anyway" option).

## Run locally
```bash
npm install
npm run dev          # http://localhost:5173 — fonts + export work here
```

## Structure
- `src/App.jsx`             — landing/router + mobile block
- `src/Landing.jsx`         — animated landing (labels route to each tool)
- `src/InvoiceTool.jsx`     — invoice maker
- `src/CoverLetterTool.jsx` — shared Cold + Known cover letter tool

## Deploy to Vercel
Push to GitHub → import on vercel.com (auto-detects Vite). Or `vercel` via CLI.

## Non-indexing (already configured)
`noindex` meta tag (`index.html`), `public/robots.txt`, and an `X-Robots-Tag`
header (`vercel.json`).

## Password (free, Hobby plan)
`middleware.js` gates the whole app with HTTP Basic Auth — OFF until you set an
`AUTH_PASSWORD` environment variable in Vercel (Settings → Environment Variables),
then redeploy. Optional `AUTH_USER` (default `navaal`).

## Editing the fixed details
- Invoice sender/bank: `FROM` and `ACCOUNT` at the top of `src/InvoiceTool.jsx`
- Cover letter sender: `FROM` at the top of `src/CoverLetterTool.jsx`
- Brand yellow: `#F8C14C` (constant `YELLOW`)
- GST rate: `GST_RATE` in `src/InvoiceTool.jsx`

## Signature
The cover letters show a magenta placeholder box where the signature PNG will go
(component `Sig` in `src/CoverLetterTool.jsx`). Swap the box for an `<img>` at the
same size/position when the PNG arrives.

## Notes
- Fonts (Neue Haas Unica W1G Medium, EB Garamond) load from the web; Helvetica is
  the fallback.
- Cover letter messages are capped to keep each letter on a single A4 page; the
  caps live in `COLD_MAX_MSG` / `KNOWN_MAX_MSG` and may want a small tweak once
  you see them rendered in the real font.
- Cover letter exports are named `NS_C_CoverLetter_<company>` /
  `NS_K_CoverLetter_<company>`; invoices `NS_Invoice_<number>`.
