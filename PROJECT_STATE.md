# Portfolio State — updated 2026-07-20 (v6: cost calculator live)

Goal: maximize legitimate profit by ~2026-10-13 (90-day window; GitHub PAT expires then).
Owner: H <hunter@anthuriumservices.com>. GitHub: hcvjohnston.

STRATEGY (per H): not limited to the property niche. Build whatever is fastest to
legitimate revenue. Portfolio mix: (a) finish monetizing the live registry site,
(b) free tools with search demand monetized by ads, (c) digital products sellable via
Stripe/Gumroad once H provides an account, (d) research-driven new bets in any niche.
Keep infra costs flat: everything ships on the existing Render service (monorepo,
tools mounted as routes) unless H approves new spend.

## Live assets
### Inspection Report Registry — LIVE at https://inspection-report-registry.onrender.com
Node 22: express + node:sqlite + multer, root of this repo. Auto-deploys from main.
Revenue: ads + inspection lead-gen.

## Done
- 2026-07-15: Lead-gen quote form + leads table + token-gated admin export (JSON + CSV),
  honeypot + per-IP rate limiting (commit fe62b5b).
- 2026-07-16: SEO layer — server-rendered /property/:id/:slug pages (canonical, meta
  description, OG tags, schema.org Place JSON-LD, 301 slug canonicalization, 404s),
  dynamic /sitemap.xml (lastmod from latest upload), /robots.txt, homepage meta/OG/
  JSON-LD, /#quote + /#upload deep links, permalinks from search results. Tested
  locally: upload, property page, redirects, sitemap, leads all green.
- 2026-07-20: Backlog #1 shipped — home inspection cost calculator at
  /tools/inspection-cost-calculator (tools/inspection-cost-calculator/index.html,
  mounted via TOOL_PAGES in server.js, added to sitemap, linked from homepage).
  Honest sourced pricing: HomeGuide 2026 (avg $340, $200-500 range, size tiers,
  50-state table, pre-1980 +$100-200, condo/mobile pricing) + HomeAdvisor via
  Rocket Mortgage Feb-2026 (avg $343, typical $296-424, add-on prices). Figures
  re-verified via live fetch 2026-07-20. Inputs: sqft/state/type/age/add-ons;
  breakdown shown per estimate; CTA into /#quote lead form; WebApplication +
  FAQPage JSON-LD, canonical, OG tags. Tested locally: route 200, sitemap entry,
  homepage link, leads API still green.
- 2026-07-17: RESEARCH.md — 5 opportunities ranked by time-to-first-dollar, sources
  cited (Ahrefs 2026-07-16 free-tools data, lead pricing $20-40 from 99calls/BuiltRight,
  Spectora $109/mo anchor, Etsy market evidence). #1: property calculator cluster
  anchored by a home inspection cost calculator feeding the live lead form.

## Backlog (priority order — one item per session, finish before starting next)
1. Follow-on calculators from RESEARCH.md #1 cluster: roof pitch calculator
   (11,000/mo, KD 13) then deck material calculator (1,200/mo, KD 9), each as
   tools/<name>/ pages cross-linked with the inspection cost calculator.
   (Anchor calculator shipped 2026-07-20.)
2. Digital product #1 (RESEARCH.md #2): Home Inspector Checklist & Report Template
   Pack, staged in products/ ready for the moment H provides Gumroad/Stripe; free
   sample as lead magnet on the site.
3. RESEARCH.md #3: Landlord Rental Property Spreadsheet Toolkit (also payment-blocked).
4. RESEARCH.md #4: low-KD template/download pages cluster with email capture.
5. Ad slots across all pages, ready for AdSense activation.
6. Registry: broaden rate limiting/abuse protection beyond /api/leads (uploads especially).
7. Ongoing: re-rank backlog each session based on results; append new pitches to RESEARCH.md.

## NEEDS FROM H
- Custom domain(s) (~$10/yr each) — biggest SEO/credibility lever for any of these.
- Gumroad/Stripe is now the single biggest revenue unblock: RESEARCH.md #2 and #3 are
  both product plays that can sell within days of an account existing.
- Gumroad or Stripe account — unblocks selling digital products (backlog #3).
- AdSense account once traffic justifies it (will flag when).
- Google Search Console: verify the site and submit https://inspection-report-registry.onrender.com/sitemap.xml
  (needs H's Google account; ~5 min; makes the new SEO pages actually get crawled).
- Set ADMIN_TOKEN env var on Render (Dashboard -> service -> Environment) to enable
  lead export at /api/admin/leads.csv?token=... — leads are being stored either way.
- Replace the full-access PAT with one scoped to this repo (security).

## Conventions for automated work sessions
- Monorepo: registry at root; new tools under tools/<name>/ mounted as routes in
  server.js; digital products under products/. Single Render service, no new infra
  or spend without H.
- Keep deployable: `npm install && npm start` works on Node 22+. No native deps.
- Test locally before pushing (server + curl in a single bash call — background
  processes die between calls). Commit as H <hunter@anthuriumservices.com>, push main.
- All content honest and sourced; no fabricated statistics, reviews, or data. No spam,
  SEO tricks that deceive, or scraped proprietary data.
- Never commit secrets. Money/accounts/legal/new services -> NEEDS FROM H, never unilateral.
- Update this file every session: mark done, set next, refresh NEEDS FROM H.
