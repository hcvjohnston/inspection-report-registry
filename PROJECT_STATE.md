# Portfolio State — updated 2026-07-15 (session 2)

Goal: maximize legitimate profit by ~2026-10-13 (90-day window; GitHub PAT expires then).
Owner: H <hunter@anthuriumservices.com>. GitHub: hcvjohnston.

## Projects

### 1. Inspection Report Registry (this repo) — LIVE at https://inspection-report-registry.onrender.com (Render starter + 1GB disk, $7.25/mo, deployed 2026-07-15)
Node 22 app: express + node:sqlite + multer. Public upload/search of US property
inspection reports; addresses standardized via US Census geocoder; reports newest-first.
- Status: deployed and verified. Pushes to main auto-deploy via Render.
- Revenue model chosen by H: ads + lead-gen.
- Lead-gen shipped (2026-07-15): "Get a Quote" tab → `POST /api/leads` (validated,
  honeypot + per-IP rate limit 5/15min, no new deps) → `leads` table → admin export at
  `/api/admin/leads` (JSON) and `/api/admin/leads.csv`, gated by `ADMIN_TOKEN` env var.

## Backlog (priority order)
1. ~~Lead-gen: quote form + leads table + admin export~~ DONE 2026-07-15.
2. SEO: server-rendered per-property pages (/property/:state/:city/:address) with
   meta tags + sitemap.xml, so address searches rank. ← NEXT
3. Ad slots: layout placeholders ready for AdSense (H must create account once traffic exists).
4. Rate limiting + basic abuse protection on uploads. Note: a dependency-free per-IP
   limiter now exists in server.js (`rateLimit()`); apply it to POST /api/reports and
   consider per-file hash dedupe.
5. Product research: pitch 3-5 fast-to-revenue small product ideas with market reasoning.
   Write up as RESEARCH.md here. H decides which to build.
6. (new, low) Lead admin niceties: status updates (new/contacted/sold), simple admin page.

## NEEDS FROM H
- ADMIN_TOKEN: the service was deployed before render.yaml added this env var. Check
  Render dashboard → Environment; if ADMIN_TOKEN is missing after this deploy, add one
  manually (any long random string). Without it, lead export returns 503 (leads are
  still stored). You need it to download leads: /api/admin/leads.csv?token=...
- Decide lead pricing/buyers when leads start arriving (selling leads to inspectors may
  have state-specific rules — worth a quick legal check before first sale).
- Longer term: AdSense account (needs traffic first), Stripe (when anything paid ships),
  a private "portfolio-hq" repo if roadmap should move out of this repo.

## Conventions for automated work sessions
- Keep app deployable: `npm install && npm start` must work on Node 22+. No native deps.
- Test before pushing. Commit as H <hunter@anthuriumservices.com>, push to main.
- Never commit secrets. Money/accounts/legal → NEEDS FROM H, never unilateral.
- Update this file every session: done / next / needs.

## Session log
- 2026-07-15 (2): Lead-gen shipped (form, API, rate limit, honeypot, token-gated
  CSV/JSON export). 14/14 local endpoint checks passed. Next: SEO property pages.
- 2026-07-15 (1): Initial state file, Render config. H connected Render; site live.
