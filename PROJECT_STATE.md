# Portfolio State — updated 2026-07-15 (v2: multi-project portfolio)

Goal: maximize legitimate profit by ~2026-10-13 (90-day window; GitHub PAT expires then).
Owner: H <hunter@anthuriumservices.com>. GitHub: hcvjohnston.

STRATEGY: one property-services cluster, not scattered bets. All projects share this
repo (monorepo), the existing Render service ($7.25/mo — keep costs flat), cross-link
for SEO, and feed one monetization pipeline: search traffic -> ads + inspection leads
-> later paid products. Rationale: compounding SEO beats cold-starting unrelated niches,
and infrastructure already exists.

## Projects

### 1. Inspection Report Registry — LIVE at https://inspection-report-registry.onrender.com
Node 22: express + node:sqlite + multer (no native deps). Root of this repo.
Pushes to main auto-deploy via Render. Revenue: ads + lead-gen.

### 2. Home Repair Cost Estimator — NOT STARTED (build in tools/repair-costs/, serve from main app)
Static calculator pages: "how much does X cost to fix/replace" (roof, HVAC, foundation,
water heater, etc.). High search volume, pure ad/lead inventory. Cost data researched
from public sources, cited, kept in a JSON data file. Each calculator = one SEO page.

### 3. Inspection Checklist Generator — NOT STARTED (tools/checklists/)
Free room-by-room inspection checklist builder with printable/PDF output by property
type and state. Lead-gen hook: "want a pro? request a quote" -> registry leads table.

### 4. Inspector Directory — NOT STARTED (tools/directory/)
Per-city inspector directory pages (data: public licensing lists where available).
This is what makes leads sellable: inspectors claim listings -> upsell featured
placement/subscriptions later (needs Stripe, see NEEDS FROM H).

## Backlog (priority order — one item per work session, finish before starting next)
1. Registry: lead-gen quote form + leads table + admin export (foundation for all revenue).
2. Registry: SEO per-property pages (/property/:state/:city/:address) + sitemap.xml + meta tags.
3. Repair Cost Estimator: first 5 calculators (roof, HVAC, water heater, foundation, electrical panel) with researched data + sources.
4. Registry: rate limiting + abuse protection (express-rate-limit).
5. Checklist Generator: MVP (builder UI + printable output + quote-form hook).
6. Repair Cost Estimator: next 10 calculators; cross-link all tools in shared nav/footer.
7. Inspector Directory: MVP for 5 big metros with public licensing data.
8. Ad slots across all pages, ready for AdSense activation.
9. Ongoing: pick highest-impact next step; propose NEW project ideas in RESEARCH.md only if cluster is saturated.

## NEEDS FROM H
- Custom domain (~$10/yr) — biggest SEO/credibility lever; point it at Render, tell Claude.
- AdSense account once there is real traffic (I'll flag when pages + traffic justify it).
- Stripe account when directory subscriptions or any paid product ships.
- Replace the full-access PAT with one scoped to this repo (security).

## Conventions for automated work sessions
- Monorepo: registry app at root; new tools live under tools/<name>/ and are mounted
  as routes in server.js (single Render service, no new infra without H).
- Keep deployable: `npm install && npm start` works on Node 22+. No native deps.
- Test locally before pushing (server + curl checks in a single bash call — background
  processes die between calls). Commit as H <hunter@anthuriumservices.com>, push main.
- All content must be honest and sourced; no fabricated statistics, reviews, or data.
- Never commit secrets. Money/accounts/legal/new services -> NEEDS FROM H, never unilateral.
- Update this file every session: mark done, set next, refresh NEEDS FROM H.
