# Portfolio State — updated 2026-07-15 (v3: open portfolio, any profitable niche)

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

## Backlog (priority order — one item per session, finish before starting next)
1. Registry: lead-gen quote form + leads table + admin export (makes the live site sellable).
2. Registry: SEO per-property pages + sitemap.xml + meta tags (makes the live site findable).
3. RESEARCH.md: identify 5 fastest-to-revenue opportunities in ANY niche. For each:
   search demand evidence, competition, monetization path, build cost, time to first
   dollar. Rank them. Sources cited, no guesswork presented as data.
4. Build the #1 ranked opportunity from RESEARCH.md (MVP, shipped to the live service
   under tools/<name>/ or as static pages).
5. Digital product #1: produce a genuinely excellent paid-quality asset (e.g. template
   pack or spreadsheet toolkit) in whatever niche research supports; stage it in
   products/ ready to list the moment H provides Gumroad/Stripe.
6. Build the #2 ranked opportunity from RESEARCH.md.
7. Ad slots across all pages, ready for AdSense activation.
8. Registry: rate limiting + abuse protection.
9. Ongoing: re-rank backlog each session based on results; append new pitches to RESEARCH.md.

## NEEDS FROM H
- Custom domain(s) (~$10/yr each) — biggest SEO/credibility lever for any of these.
- Gumroad or Stripe account — unblocks selling digital products (backlog #5).
- AdSense account once traffic justifies it (will flag when).
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
