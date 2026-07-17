# RESEARCH.md — Fastest-to-revenue opportunities (2026-07-17)

Backlog item #1. Five opportunities ranked by expected time to FIRST dollar given our
actual constraints: only live monetization today is inspection lead-gen (quote form on
the registry); ads (AdSense) and product sales (Gumroad/Stripe) are both blocked on H.
No new infra or spend; everything ships on the existing Render Node service.

Method note / honesty caveat: keyword volume + difficulty figures below are third-party
estimates published by the cited sources (mostly Ahrefs' own data in their 2026-07-16
free-tools article). We have no first-party Search Console data yet (site unverified —
see NEEDS FROM H). Treat volumes as order-of-magnitude, not precise.

---

## #1 — Property-niche calculator cluster, anchored by a Home Inspection Cost Calculator
**What:** Free single-page calculators under tools/ on the live site. Anchor: "home
inspection cost calculator" (inputs: sqft, age, ZIP region, add-ons → estimate), with a
direct CTA into our existing lead-gen quote form. Follow-ons from the same cluster:
roof pitch calculator (11,000/mo searches, KD 13), deck material calculator (1,200/mo,
KD 9, traffic potential 26,000) — both listed as "winnable" niche terms by Ahrefs.
**Demand evidence:** Ahrefs (2026-07-16) documents the free-tools strategy with real
traffic data (Omni Calculator ~2.3M US visits/mo; niche calculators at KD ≤ 13 rankable
by low-DR sites). The "home inspection cost calculator" SERP is already won by thin
single-purpose calculator pages (homeinspectioncost.net, localservicecalculator.com,
thesmartcalculator.com) — exactly the "winnable SERP" signal Ahrefs describes.
Underlying topic demand: home inspection pricing is a heavily published topic (Angi,
HomeGuide, Rocket Mortgage all maintain 2026 cost guides; typical inspection $300–500).
**Monetization:** Immediate path — calculator users are pre-purchase home buyers; the
CTA feeds our live leads table. Home inspection leads sell for roughly $20–40 each
(99calls sells them at $19.90–27.99; BuiltRight Digital documents inspectors paying
~$40/lead via ads). Even unsold, stored leads are the asset that justifies outreach to
local inspectors. Later: ad inventory once AdSense exists.
**Build cost:** Low. One page per calculator, no deps, fits server.js routing. 1 session.
**Time to first dollar:** Fastest of all five — rides the only monetization that is
live today. Realistically weeks (needs Google indexing; Search Console verification
from H would accelerate).

## #2 — Digital product: Home Inspector Checklist & Report Template Pack
**What:** Paid-quality pack for INSPECTORS (not buyers): editable report template,
room-by-room checklists, client agreement + summary letter templates. Staged in
products/ ready to list the moment H provides Gumroad/Stripe. Free sample chapter
doubles as a lead magnet / email capture on the registry site.
**Demand evidence:** "Home inspection checklist" ~8,100 searches/mo (The 215 Guys
keyword study; difficulty varies 10–60 by variant). Willingness to pay is anchored by
software pricing: Spectora costs $109/mo, InspectPro $39/mo — a $19–49 one-time
template pack undercuts the whole category for part-time/new inspectors.
**Monetization:** One-time sales (Gumroad-class checkout). BLOCKED on H for account.
**Build cost:** Medium (1–2 sessions to make it excellent, which is the bar).
**Time to first dollar:** Days after H connects a payment account; zero before.

## #3 — Landlord Rental Property Spreadsheet Toolkit
**What:** Income/expense tracker + Schedule-E-oriented categories + move-in/move-out
inspection checklist (our niche adjacency) as an Excel/Google Sheets product.
**Demand evidence:** Etsy shows a dense market of rental-property spreadsheet listings
including bestsellers (one Airbnb tracker claims 10,000+ buyers) — proven purchase
behavior, not just search interest. Template-class keywords in adjacent niches run
KD 0–8 per Ahrefs (e.g. "construction estimate template" 1,200/mo KD 2).
**Monetization:** Same block as #2 (needs Gumroad/Stripe; Etsy would need an account +
listing fees — H's call). Bigger market than #2 but far more competition.
**Build cost:** Medium. **Time to first dollar:** Days after payments unblock.

## #4 — Low-KD template/download pages cluster on the live site
**What:** Free downloadable templates (printable inspection checklists, moving
checklists, construction estimate template etc.) as SEO pages with email capture.
**Demand evidence:** Ahrefs template data: "construction estimate template" 1,200/mo
KD 2; "photography contract template" 1,100/mo KD 6; Template.net pulls ~700K US
visits/mo on this model.
**Monetization:** Ads (blocked on AdSense) + email list + funnels into #1/#2. Traffic
asset first, money later. **Build cost:** Low per page.
**Time to first dollar:** Slow directly; accelerates everything else.

## #5 — Niche converter tool (e.g. PDF bank statement → CSV)
**What:** Single-purpose converter under tools/. Ahrefs: "pdf bank statement to csv"
KD 5, traffic potential 3,300/mo; parsing quality is a real moat.
**Monetization:** Freemium/paid tier — blocked on payments; ads — blocked on AdSense.
**Build cost:** Highest of the five (parsing edge cases). **Time to first dollar:**
Slowest. Park unless research next month shows the calculator cluster stalling.

---

## Ranking rationale (one line)
#1 is the only opportunity wired to revenue that exists TODAY (live lead capture,
leads with a documented $20–40 market price); #2/#3 are ready-to-fire the day payments
unblock; #4 compounds traffic; #5 is deferred.

## Sources
- Ahrefs, "The Free Tools SEO Strategy" (2026-07-16): https://ahrefs.com/blog/the-free-tools-seo-strategy/
- The 215 Guys, "50 Most Searched Keywords for Home Inspectors": https://www.the215guys.com/blog/50-most-searched-home-inspector-keywords/
- 99calls home inspection leads ($27.99/$19.90): https://99calls.com/Home-Inspection-Leads.htm
- BuiltRight Digital, home inspection Google Ads cost guide: https://builtrightdigital.com/home-inspection-google-ads-cost/
- Angi 2026 home inspection cost data: https://www.angi.com/articles/how-much-does-home-inspection-cost.htm
- HomeGuide 2026 home inspection cost: https://homeguide.com/costs/home-inspection-cost
- Rocket Mortgage 2026 inspection cost guide: https://www.rocketmortgage.com/learn/home-inspection-cost
- Spectora pricing ($109/mo): https://www.spectora.com/pricing/
- InspectPro ($39/mo Spectora alternative): https://house-inspectors.com/blog/spectora-alternative
- Etsy rental property spreadsheet market: https://www.etsy.com/market/rental_property_management_spreadsheet
- Competing calculator SERP examples: https://www.homeinspectioncost.net/ , https://localservicecalculator.com/home-inspection , https://www.thesmartcalculator.com/home-inspection-cost-calculator
