# Ogod — Trips & Tours Marketplace (Phase 1 / MVP)

A two-sided marketplace connecting **Trip Posters** (travel companies, organizers, solo
travelers) with **Prospective Travelers** through a lead-generation and inquiry flow.
Destination-agnostic by design — pilgrimages, treks, weekend getaways, adventure trips,
family holidays, group tours and corporate outings.

> Phase 1 is about market validation. **No online payment or booking** — travelers submit an
> inquiry and connect with the poster via WhatsApp/phone; bookings are finalized offline.

## Monorepo layout

| Folder          | Component        | Stack                              |
| --------------- | ---------------- | ---------------------------------- |
| [`backend/`](backend/)      | Backend API      | Node.js + Express + MongoDB (Atlas)|
| [`admin-panel/`](admin-panel/) | Web Admin Panel  | React + Vite                       |
| [`android/`](android/)      | Android App      | Android Studio (Kotlin)            |

The backend is the single REST API that serves both the Android app and the admin panel.

## Quick start

```bash
# 1. Backend
cd backend
cp .env.example .env        # fill in MongoDB URI, JWT secret, OTP + AWS creds
npm install
npm run seed                # seed default trip categories
npm run dev                 # http://localhost:5000

# 2. Admin panel
cd ../admin-panel
cp .env.example .env        # point VITE_API_BASE_URL at the backend
npm install
npm run dev                 # http://localhost:5173

# 3. Android app
# Open the android/ folder in Android Studio, set API_BASE_URL in
# local.properties or gradle.properties, then Run.
```

## User roles

- **Trip Poster** — registers with mobile + OTP (no KYC in Phase 1), creates/manages listings,
  receives leads via WhatsApp/call.
- **Traveler** — browses and searches trips without registration friction, submits inquiries.
- **Admin** — views all leads and listings in the web panel; filters by
  date/destination/category; exports lead data.

## Design language

Dark-first, content-forward, media-rich (modeled on modern audio-streaming apps). Full token
set and layout patterns are documented in [`docs/DESIGN.md`](docs/DESIGN.md).

## Data model

See [`docs/DATA-MODEL.md`](docs/DATA-MODEL.md). `category` and `destination` are always **open
values** (backed by a reference collection / config) — never hard-coded — which is what keeps
Ogod generic across every trip type.

## Excluded from Phase 1

Firebase FCM, Socket.io, payment gateway, Python microservices, third-party travel
integrations, iOS app, in-app chat, ratings/reviews. See the project brief for the full
deferred-features roadmap.
