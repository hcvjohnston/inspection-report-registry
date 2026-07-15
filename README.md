# Inspection Report Registry

A nationwide (US) website where anyone can upload property inspection reports and look up the report history for any address. Reports for the same address are cataloged newest to oldest.

## Features

- **Upload reports** — PDF, JPG, PNG, or WebP (up to 10 files, 25 MB each) with inspection date, type, inspector, and notes.
- **Address matching** — addresses are standardized via the free US Census Bureau geocoder (no API key), so "1600 Pennsylvania Avenue Northwest" and "1600 pennsylvania ave nw" land on the same property. If the geocoder is unreachable or can't match, a local normalizer takes over and the address is flagged "unverified."
- **Unit-aware** — Apt/Suite/Unit numbers create separate property records; "Apt 2" and "Apartment 2" match each other.
- **Newest-first history** — reports sort by inspection date (then upload time) descending, always.
- **Search** — partial address search across all properties with report counts.

## Run locally

Requires Node.js 22+ (uses the built-in `node:sqlite` — no native builds needed).

```bash
npm install
npm start
# open http://localhost:3000
```

Data (SQLite DB + uploaded files) lives in `./data/` by default. Override with the `DATA_DIR` env var. `PORT` is also configurable.

## Launch to production

Any Node host with a persistent disk works. Easiest options:

**Railway / Render / Fly.io**
1. Push this folder to a GitHub repo.
2. Create a new web service from the repo (start command: `npm start`).
3. Attach a persistent volume and set `DATA_DIR` to its mount path (e.g. `/data`) — otherwise uploads are lost on redeploy.
4. Point your domain at the service.

**A plain VPS**
```bash
npm install --omit=dev
DATA_DIR=/var/lib/inspection-registry PORT=3000 node server.js
# put nginx/Caddy in front for HTTPS
```

## Before public launch — recommended hardening

- **Rate limiting** on `POST /api/reports` (e.g. `express-rate-limit`) to deter spam.
- **Malware scanning** of uploads (e.g. ClamAV) since files are publicly served.
- **CAPTCHA** on the upload form if abuse appears.
- **Backups** of the `DATA_DIR` volume.
- **Moderation/takedown path** — public property data can draw disputes; a simple contact email in the footer is a good start.
- At larger scale, move file storage to S3-compatible object storage and the DB to Postgres; the schema translates directly.

## API

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/properties?q=` | Search properties by address text |
| GET | `/api/properties/:id/reports` | Property + its reports, newest → oldest |
| POST | `/api/reports` | Multipart upload: address fields + metadata + files |
| GET | `/api/files/:id` | Download/view a stored report file |
