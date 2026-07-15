# Portfolio State — updated 2026-07-15

Goal: maximize legitimate profit by ~2026-10-13 (90-day window; GitHub PAT expires then).
Owner: H <hunter@anthuriumservices.com>. GitHub: hcvjohnston.

## Projects

### 1. Inspection Report Registry (this repo) — BUILT, not yet deployed
Node 22 app: express + node:sqlite + multer. Public upload/search of US property
inspection reports; addresses standardized via US Census geocoder; reports newest-first.
- Status: pushed to GitHub; awaiting H connecting repo to Render (render.yaml ready).
- Revenue model chosen by H: ads + lead-gen.

## Backlog (priority order)
1. Lead-gen: "Request an inspection quote" form + leads table + admin export.
   Leads are sellable to local inspectors later.
2. SEO: server-rendered per-property pages (/property/:state/:city/:address) with
   meta tags + sitemap.xml, so address searches rank.
3. Ad slots: layout placeholders ready for AdSense (H must create account once traffic exists).
4. Rate limiting + basic abuse protection on uploads (express-rate-limit).
5. Product research: pitch 3-5 fast-to-revenue small product ideas with market reasoning.
   Write up as RESEARCH.md here. H decides which to build.

## NEEDS FROM H
- Connect this repo to Render (Blueprint deploy; starter instance for persistent disk).
- Longer term: AdSense account (needs traffic first), Stripe (when anything paid ships),
  a private "portfolio-hq" repo if roadmap should move out of this repo.

## Conventions for automated work sessions
- Keep app deployable: `npm install && npm start` must work on Node 22+. No native deps.
- Test before pushing. Commit as H <hunter@anthuriumservices.com>, push to main.
- Never commit secrets. Money/accounts/legal → NEEDS FROM H, never unilateral.
- Update this file every session: done / next / needs.
