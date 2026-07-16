// Inspection Report Registry — nationwide US property inspection reports
// Express + SQLite (Node built-in, no native deps) + US Census Bureau geocoder (free, no API key)

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { DatabaseSync } = require('node:sqlite');

const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ---------- Database ----------
const db = new DatabaseSync(path.join(DATA_DIR, 'registry.db'));
db.exec('PRAGMA journal_mode = WAL');
db.exec(`
  CREATE TABLE IF NOT EXISTS properties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    normalized_address TEXT NOT NULL UNIQUE,   -- canonical key for matching
    display_address TEXT NOT NULL,             -- pretty version shown to users
    city TEXT, state TEXT, zip TEXT,
    lat REAL, lon REAL,
    verified INTEGER NOT NULL DEFAULT 0,       -- 1 = matched by Census geocoder
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER NOT NULL REFERENCES properties(id),
    title TEXT NOT NULL,
    inspection_date TEXT NOT NULL,             -- ISO date of the inspection
    inspector_name TEXT,
    report_type TEXT,                          -- general/roof/pest/etc.
    notes TEXT,
    uploaded_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS report_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id INTEGER NOT NULL REFERENCES reports(id),
    stored_name TEXT NOT NULL,
    original_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size_bytes INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_reports_property
    ON reports(property_id, inspection_date DESC, uploaded_at DESC);
  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    street TEXT, unit TEXT, city TEXT NOT NULL, state TEXT NOT NULL, zip TEXT,
    property_type TEXT,                        -- single-family/condo/multi-family/commercial
    service_type TEXT,                         -- which inspection they want
    timeframe TEXT,                            -- ASAP / 2 weeks / flexible ...
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'new',        -- new/contacted/sold/closed
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_leads_state_city ON leads(state, city, created_at DESC);
`);

// ---------- Address normalization ----------
const STREET_ABBR = {
  street: 'ST', avenue: 'AVE', boulevard: 'BLVD', drive: 'DR', lane: 'LN',
  road: 'RD', court: 'CT', circle: 'CIR', place: 'PL', terrace: 'TER',
  parkway: 'PKWY', highway: 'HWY', trail: 'TRL', way: 'WAY', square: 'SQ',
  north: 'N', south: 'S', east: 'E', west: 'W',
  northeast: 'NE', northwest: 'NW', southeast: 'SE', southwest: 'SW',
  apartment: 'APT', suite: 'STE', unit: 'UNIT', building: 'BLDG', floor: 'FL'
};

function normalizeLocal(raw) {
  return raw
    .toUpperCase()
    .replace(/[.,#]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map(w => STREET_ABBR[w.toLowerCase()] || w)
    .join(' ');
}

// US Census Bureau geocoder — free, nationwide, no key required.
async function censusGeocode(oneLine) {
  const url = 'https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?' +
    new URLSearchParams({ address: oneLine, benchmark: 'Public_AR_Current', format: 'json' });
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 6000);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) return null;
    const json = await res.json();
    const m = json?.result?.addressMatches?.[0];
    if (!m) return null;
    return {
      matched: m.matchedAddress,                       // e.g. "123 MAIN ST, SPRINGFIELD, IL, 62701"
      city: m.addressComponents?.city || null,
      state: m.addressComponents?.state || null,
      zip: m.addressComponents?.zip || null,
      lat: m.coordinates?.y ?? null,
      lon: m.coordinates?.x ?? null
    };
  } catch {
    return null; // network failure or timeout → fall back to local normalization
  } finally {
    clearTimeout(t);
  }
}

// Resolve raw user input to a canonical property record (creating it if new).
async function resolveProperty({ street, unit, city, state, zip }) {
  const oneLine = [street, city, state, zip].filter(Boolean).join(', ');
  const geo = await censusGeocode(oneLine);
  const unitPart = unit ? ' ' + normalizeLocal(unit) : '';

  // Matching key deliberately EXCLUDES zip so "123 Main St, X, CA" and
  // "123 Main St, X, CA 90210" resolve to the same property.
  let normalized, display, meta;
  if (geo) {
    // matchedAddress format: "STREET, CITY, STATE, ZIP" — drop the zip for the key
    const parts = geo.matched.split(',').map(s => s.trim());
    const keyParts = parts.length >= 4 ? parts.slice(0, 3) : parts;
    normalized = normalizeLocal(keyParts.join(' ')) + unitPart;
    display = geo.matched + (unit ? ` ${unit.toUpperCase()}` : '');
    meta = { city: geo.city, state: geo.state, zip: geo.zip, lat: geo.lat, lon: geo.lon, verified: 1 };
  } else {
    normalized = normalizeLocal([street, city, state].filter(Boolean).join(' ')) + unitPart;
    display = oneLine.toUpperCase() + (unit ? ` ${unit.toUpperCase()}` : '');
    meta = { city: (city || '').toUpperCase() || null, state: (state || '').toUpperCase() || null,
             zip: zip || null, lat: null, lon: null, verified: 0 };
  }

  const existing = db.prepare('SELECT * FROM properties WHERE normalized_address = ?').get(normalized);
  if (existing) {
    // Upgrade to verified if the geocoder succeeded this time
    if (geo && !existing.verified) {
      db.prepare(`UPDATE properties SET verified=1, city=?, state=?, zip=?, lat=?, lon=?, display_address=? WHERE id=?`)
        .run(meta.city, meta.state, meta.zip, meta.lat, meta.lon, display, existing.id);
    }
    return db.prepare('SELECT * FROM properties WHERE id = ?').get(existing.id);
  }
  const info = db.prepare(`
    INSERT INTO properties (normalized_address, display_address, city, state, zip, lat, lon, verified)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(normalized, display, meta.city, meta.state, meta.zip, meta.lat, meta.lon, meta.verified);
  return db.prepare('SELECT * FROM properties WHERE id = ?').get(info.lastInsertRowid);
}

// ---------- Uploads ----------
const ALLOWED = { 'application/pdf': '.pdf', 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };
const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (req, file, cb) =>
      cb(null, crypto.randomUUID() + (ALLOWED[file.mimetype] || ''))
  }),
  limits: { fileSize: 25 * 1024 * 1024, files: 10 }, // 25 MB per file
  fileFilter: (req, file, cb) =>
    ALLOWED[file.mimetype] ? cb(null, true) : cb(new Error('Only PDF, JPG, PNG, or WebP files are allowed'))
});

// ---------- App ----------
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const US_STATES = new Set(['AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY']);

// Search properties by address text
app.get('/api/properties', (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.json([]);
  const like = '%' + normalizeLocal(q).replace(/\s+/g, '%') + '%';
  const rows = db.prepare(`
    SELECT p.*, COUNT(r.id) AS report_count,
           MAX(r.inspection_date) AS latest_inspection
    FROM properties p LEFT JOIN reports r ON r.property_id = p.id
    WHERE p.normalized_address LIKE ?
    GROUP BY p.id ORDER BY report_count DESC LIMIT 25`).all(like);
  res.json(rows);
});

// Reports for a property — ALWAYS newest to oldest
app.get('/api/properties/:id/reports', (req, res) => {
  const prop = db.prepare('SELECT * FROM properties WHERE id = ?').get(req.params.id);
  if (!prop) return res.status(404).json({ error: 'Property not found' });
  const reports = db.prepare(`
    SELECT * FROM reports WHERE property_id = ?
    ORDER BY inspection_date DESC, uploaded_at DESC`).all(prop.id);
  const filesStmt = db.prepare('SELECT id, original_name, mime_type, size_bytes FROM report_files WHERE report_id = ?');
  res.json({ property: prop, reports: reports.map(r => ({ ...r, files: filesStmt.all(r.id) })) });
});

// Upload a report (multipart): address fields + metadata + files
app.post('/api/reports', upload.array('files', 10), async (req, res) => {
  try {
    const { street, unit, city, state, zip, title, inspection_date, inspector_name, report_type, notes } = req.body;
    if (!street || !city || !state) return res.status(400).json({ error: 'Street, city, and state are required' });
    if (!US_STATES.has((state || '').toUpperCase())) return res.status(400).json({ error: 'State must be a valid US state abbreviation' });
    if (!inspection_date || !/^\d{4}-\d{2}-\d{2}$/.test(inspection_date)) return res.status(400).json({ error: 'Inspection date is required (YYYY-MM-DD)' });
    if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'At least one file is required' });

    const prop = await resolveProperty({ street, unit, city, state, zip });
    const info = db.prepare(`
      INSERT INTO reports (property_id, title, inspection_date, inspector_name, report_type, notes)
      VALUES (?, ?, ?, ?, ?, ?)`)
      .run(prop.id, title || 'Inspection Report', inspection_date, inspector_name || null, report_type || null, notes || null);

    const fileStmt = db.prepare(`
      INSERT INTO report_files (report_id, stored_name, original_name, mime_type, size_bytes)
      VALUES (?, ?, ?, ?, ?)`);
    for (const f of req.files) fileStmt.run(info.lastInsertRowid, f.filename, f.originalname, f.mimetype, f.size);

    res.status(201).json({ ok: true, property_id: prop.id, report_id: info.lastInsertRowid, verified: !!prop.verified });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---------- Lead generation ----------
// Tiny in-memory per-IP rate limiter (no extra deps). Good enough for a single
// instance; swap for express-rate-limit + a store if we ever scale out.
const rateBuckets = new Map();
function rateLimit(max, windowMs) {
  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip + ':' + req.path;
    const b = rateBuckets.get(key);
    if (!b || now - b.start > windowMs) {
      rateBuckets.set(key, { start: now, count: 1 });
      return next();
    }
    if (++b.count > max) return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    next();
  };
}
setInterval(() => { // prevent unbounded growth
  const cutoff = Date.now() - 60 * 60 * 1000;
  for (const [k, b] of rateBuckets) if (b.start < cutoff) rateBuckets.delete(k);
}, 10 * 60 * 1000).unref();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[\d\s()+.\-]{7,20}$/;
const cap = (s, n) => (typeof s === 'string' ? s.trim().slice(0, n) : '');

// Public: request an inspection quote
app.post('/api/leads', rateLimit(5, 15 * 60 * 1000), (req, res) => {
  const b = req.body || {};
  // Honeypot: hidden "website" field — bots fill it, humans don't.
  if (b.website) return res.status(201).json({ ok: true });

  const name = cap(b.name, 120);
  const email = cap(b.email, 200);
  const phone = cap(b.phone, 30);
  const city = cap(b.city, 100);
  const state = cap(b.state, 2).toUpperCase();
  if (!name) return res.status(400).json({ error: 'Name is required' });
  if (!email && !phone) return res.status(400).json({ error: 'Provide an email or phone number so an inspector can reach you' });
  if (email && !EMAIL_RE.test(email)) return res.status(400).json({ error: 'Invalid email address' });
  if (phone && !PHONE_RE.test(phone)) return res.status(400).json({ error: 'Invalid phone number' });
  if (!city || !US_STATES.has(state)) return res.status(400).json({ error: 'City and a valid US state are required' });

  const info = db.prepare(`
    INSERT INTO leads (name, email, phone, street, unit, city, state, zip,
                       property_type, service_type, timeframe, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(name, email || null, phone || null,
         cap(b.street, 200) || null, cap(b.unit, 50) || null, city, state, cap(b.zip, 10) || null,
         cap(b.property_type, 50) || null, cap(b.service_type, 80) || null,
         cap(b.timeframe, 50) || null, cap(b.notes, 2000) || null);
  res.status(201).json({ ok: true, lead_id: info.lastInsertRowid });
});

// Admin: export leads. Requires ADMIN_TOKEN env var (Bearer header or ?token=).
function requireAdmin(req, res, next) {
  const token = process.env.ADMIN_TOKEN;
  if (!token) return res.status(503).json({ error: 'Admin export disabled: set the ADMIN_TOKEN environment variable' });
  const supplied = (req.headers.authorization || '').replace(/^Bearer\s+/i, '') || req.query.token;
  if (!supplied || supplied.length !== token.length ||
      !crypto.timingSafeEqual(Buffer.from(supplied), Buffer.from(token))) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

const LEAD_COLS = ['id','created_at','status','name','email','phone','street','unit','city','state','zip','property_type','service_type','timeframe','notes'];

app.get('/api/admin/leads', requireAdmin, (req, res) => {
  res.json(db.prepare('SELECT * FROM leads ORDER BY created_at DESC, id DESC').all());
});

app.get('/api/admin/leads.csv', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT * FROM leads ORDER BY created_at DESC, id DESC').all();
  const csvCell = v => { const s = String(v ?? ''); return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  const csv = [LEAD_COLS.join(',')]
    .concat(rows.map(r => LEAD_COLS.map(c => csvCell(r[c])).join(',')))
    .join('\r\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="leads.csv"');
  res.send(csv);
});

// Serve a stored file
app.get('/api/files/:id', (req, res) => {
  const f = db.prepare('SELECT * FROM report_files WHERE id = ?').get(req.params.id);
  if (!f) return res.status(404).json({ error: 'File not found' });
  res.setHeader('Content-Type', f.mime_type);
  res.setHeader('Content-Disposition', `inline; filename="${f.original_name.replace(/"/g, '')}"`);
  res.sendFile(path.join(UPLOAD_DIR, f.stored_name));
});

// ---------- SEO: server-rendered property pages, sitemap, robots ----------
const BASE_URL = (process.env.BASE_URL || 'https://inspection-report-registry.onrender.com').replace(/\/+$/, '');
const escHtml = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const slugify = s => String(s ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'property';

const PAGE_CSS = `
  :root { --brand:#1a5f4a; --brand-light:#2d8a6e; --bg:#f7f8f7; --card:#fff; --text:#1f2937; --muted:#6b7280; --border:#e5e7eb; }
  * { box-sizing:border-box; margin:0; }
  body { font-family:-apple-system,"Segoe UI",Roboto,sans-serif; background:var(--bg); color:var(--text); }
  header { background:var(--brand); color:#fff; padding:18px 24px; }
  header a { color:#fff; text-decoration:none; font-size:1.25rem; font-weight:700; }
  main { max-width:860px; margin:0 auto; padding:24px 16px 64px; }
  .card { background:var(--card); border:1px solid var(--border); border-radius:12px; padding:20px; margin-bottom:16px; }
  .report { border-left:4px solid var(--brand); padding:12px 16px; margin:12px 0; background:#fafbfa; border-radius:0 8px 8px 0; }
  .report h3 { font-size:1rem; }
  .report .meta { color:var(--muted); font-size:.85rem; margin:4px 0; }
  .report .files a { display:inline-block; margin:4px 8px 0 0; font-size:.85rem; color:var(--brand); text-decoration:none; border:1px solid var(--border); border-radius:6px; padding:4px 10px; background:#fff; }
  .badge { font-size:.72rem; padding:2px 8px; border-radius:999px; font-weight:600; }
  .badge.ok { background:#d1f0e2; color:#14532d; }
  .badge.warn { background:#fef3c7; color:#92400e; }
  .muted { color:var(--muted); font-size:.9rem; }
  .btn { display:inline-block; margin-top:16px; padding:12px 24px; background:var(--brand); color:#fff; border-radius:8px; font-weight:600; text-decoration:none; }
  .btn:hover { background:var(--brand-light); }
`;

function propertyPageHtml(prop, reports) {
  const addr = prop.display_address;
  const url = `${BASE_URL}/property/${prop.id}/${slugify(addr)}`;
  const n = reports.length;
  const latest = reports[0]?.inspection_date;
  const types = [...new Set(reports.map(r => r.report_type).filter(Boolean))];
  const desc = n
    ? `${n} inspection report${n === 1 ? '' : 's'} on file for ${addr}${latest ? `, most recent ${latest}` : ''}${types.length ? ` — ${types.slice(0, 4).join(', ')}` : ''}. View the inspection history or request a quote from a local inspector.`
    : `Inspection history page for ${addr}. No reports uploaded yet — be the first to upload one, or request an inspection quote from a local inspector.`;
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Place', name: addr, url,
    ...(prop.lat != null && prop.lon != null ? { geo: { '@type': 'GeoCoordinates', latitude: prop.lat, longitude: prop.lon } } : {}),
    address: { '@type': 'PostalAddress',
      ...(prop.city ? { addressLocality: prop.city } : {}),
      ...(prop.state ? { addressRegion: prop.state } : {}),
      ...(prop.zip ? { postalCode: prop.zip } : {}),
      addressCountry: 'US' }
  };
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escHtml(addr)} — Inspection Reports | Inspection Report Registry</title>
<meta name="description" content="${escHtml(desc)}">
<link rel="canonical" href="${escHtml(url)}">
<meta property="og:type" content="website">
<meta property="og:title" content="${escHtml(addr)} — Inspection Reports">
<meta property="og:description" content="${escHtml(desc)}">
<meta property="og:url" content="${escHtml(url)}">
<meta property="og:site_name" content="Inspection Report Registry">
<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>
<style>${PAGE_CSS}</style>
</head>
<body>
<header><a href="/">🏠 Inspection Report Registry</a></header>
<main>
  <div class="card">
    <h1 style="font-size:1.2rem;">${escHtml(addr)}
      ${prop.verified ? '<span class="badge ok">✓ verified address</span>' : '<span class="badge warn">unverified</span>'}
    </h1>
    <p class="muted" style="margin-top:6px;">${n} inspection report${n === 1 ? '' : 's'} on file, newest first.</p>
    ${reports.map(r => `
    <div class="report">
      <h3>${escHtml(r.title)} <span class="muted">— ${escHtml(r.report_type || 'Inspection')}</span></h3>
      <div class="meta">Inspected ${escHtml(r.inspection_date)}${r.inspector_name ? ' · ' + escHtml(r.inspector_name) : ''} · uploaded ${escHtml(r.uploaded_at)} UTC</div>
      ${r.notes ? '<div class="meta">' + escHtml(r.notes) + '</div>' : ''}
      <div class="files">${r.files.map(f =>
        `<a href="/api/files/${f.id}" target="_blank" rel="nofollow">📄 ${escHtml(f.original_name)} (${(f.size_bytes / 1024 / 1024).toFixed(1)} MB)</a>`).join('')}</div>
    </div>`).join('') || '<p class="muted">No reports uploaded yet for this address. <a href="/#upload">Upload the first one</a>.</p>'}
  </div>
  <div class="card">
    <h2 style="font-size:1.05rem;">Need an inspection at this property?</h2>
    <p class="muted" style="margin-top:6px;">A licensed local inspector will contact you with pricing. Free, no obligation.</p>
    <a class="btn" href="/#quote">Request a quote</a>
  </div>
  <p class="muted"><a href="/">← Search other addresses</a></p>
</main>
</body>
</html>`;
}

app.get(['/property/:id', '/property/:id/:slug'], (req, res) => {
  const id = Number(req.params.id);
  const prop = Number.isInteger(id) && id > 0
    ? db.prepare('SELECT * FROM properties WHERE id = ?').get(id) : null;
  if (!prop) {
    return res.status(404).send(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Property not found</title><meta name="robots" content="noindex"></head><body><h1>Property not found</h1><p><a href="/">Search the registry</a></p></body></html>`);
  }
  const slug = slugify(prop.display_address);
  if (req.params.slug !== slug) return res.redirect(301, `/property/${id}/${slug}`);
  const reports = db.prepare(`
    SELECT * FROM reports WHERE property_id = ?
    ORDER BY inspection_date DESC, uploaded_at DESC`).all(id);
  const filesStmt = db.prepare('SELECT id, original_name, mime_type, size_bytes FROM report_files WHERE report_id = ?');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(propertyPageHtml(prop, reports.map(r => ({ ...r, files: filesStmt.all(r.id) }))));
});

app.get('/sitemap.xml', (req, res) => {
  const rows = db.prepare(`
    SELECT p.id, p.display_address, p.created_at, MAX(r.uploaded_at) AS last_upload
    FROM properties p LEFT JOIN reports r ON r.property_id = p.id
    GROUP BY p.id ORDER BY p.id LIMIT 45000`).all();
  const day = s => (s || '').slice(0, 10);
  const urls = [
    `  <url><loc>${BASE_URL}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`
  ].concat(rows.map(p => {
    const lastmod = day(p.last_upload || p.created_at);
    return `  <url><loc>${escHtml(`${BASE_URL}/property/${p.id}/${slugify(p.display_address)}`)}</loc>` +
      (lastmod ? `<lastmod>${lastmod}</lastmod>` : '') +
      `<changefreq>weekly</changefreq><priority>0.7</priority></url>`;
  }));
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`);
});

app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(`User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${BASE_URL}/sitemap.xml\n`);
});

// Multer / generic error handler
app.use((err, req, res, next) => res.status(400).json({ error: err.message }));

app.listen(PORT, () => console.log(`Inspection Report Registry running on http://localhost:${PORT}`));
