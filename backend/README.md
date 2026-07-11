# Ogod Backend API

Node.js + Express + MongoDB (Mongoose) REST API serving both the Android app and the web admin
panel.

## Setup

```bash
cp .env.example .env      # fill in MONGODB_URI + JWT_SECRET at minimum
npm install
npm run seed              # seed default categories + bootstrap admin
npm run dev               # nodemon, http://localhost:5000
```

Health check: `GET http://localhost:5000/api/health`

If seed/dev fails with a `MONGODB_URI still contains placeholder tokens` message, replace the
example URI in `.env` with your real MongoDB Atlas connection string. For local development with
a local MongoDB server, this is enough:

```env
MONGODB_URI=mongodb://localhost:27017/ogod
```

## Auth flow (OTP + JWT)

1. `POST /api/auth/request-otp` `{ mobile }` → sends an OTP. In dev (`OTP_DEV_MODE=true`)
   the code is returned as `data.devCode` and logged — no SMS provider needed.
2. `POST /api/auth/verify-otp` `{ mobile, code, name?, organizationName? }` → creates the
   poster on first login and returns `{ token, user }`. Pass the token as
   `Authorization: Bearer <token>` on protected routes.

## Endpoints

| Method | Path                     | Access        | Purpose                                   |
| ------ | ------------------------ | ------------- | ----------------------------------------- |
| POST   | `/api/auth/request-otp`  | public        | Send OTP                                  |
| POST   | `/api/auth/verify-otp`   | public        | Verify + sign in, returns JWT             |
| GET    | `/api/auth/me`           | auth          | Current user                              |
| PATCH  | `/api/auth/me`           | auth          | Update profile                            |
| GET    | `/api/trips`             | public        | Browse/search (`q`,`category`,`near`,…)   |
| GET    | `/api/trips/shelves`     | public        | Home feed shelves                         |
| GET    | `/api/trips/mine`        | poster        | Poster's listing dashboard                |
| GET    | `/api/trips/:id`         | public        | Trip detail                               |
| POST   | `/api/trips`             | poster        | Create listing                            |
| PATCH  | `/api/trips/:id`         | owner/admin   | Edit listing                              |
| POST   | `/api/trips/:id/pause`   | owner/admin   | Pause listing                             |
| POST   | `/api/trips/:id/resume`  | owner/admin   | Resume listing                            |
| DELETE | `/api/trips/:id`         | owner/admin   | Soft-delete listing                       |
| POST   | `/api/leads`             | public        | Submit inquiry, returns WhatsApp/call     |
| GET    | `/api/leads/mine`        | poster        | Leads for own trips                       |
| GET    | `/api/leads`             | admin         | Lead dashboard (filters + pagination)     |
| GET    | `/api/leads/export`      | admin         | CSV export                                |
| GET    | `/api/categories`        | public        | Active categories                         |
| POST   | `/api/categories`        | admin         | Add category                              |
| PATCH  | `/api/categories/:slug`  | admin         | Edit category                             |
| POST   | `/api/uploads/image`     | poster        | Upload+compress one image → S3            |
| POST   | `/api/uploads/images`    | poster        | Upload+compress gallery → S3              |

## Response envelope

Success: `{ "success": true, "data": {…}, "meta"?: {…} }`
Error:   `{ "success": false, "error": { "message": "…", "details"?: [...] } }`
Lists are paginated: `meta = { page, limit, total, totalPages }`.

## Notes

- **Categories & destinations are open values.** New trip types are added to the `categories`
  collection via the admin panel — never a code change. Trip creation validates the category
  slug against that collection.
- **Images are compressed/resized** with `sharp` before upload and served via CloudFront when
  `CDN_BASE_URL` is set (deployment guideline: cut storage + bandwidth).
- **OTPs auto-expire** via a MongoDB TTL index; codes are stored hashed.
- Excluded from Phase 1: FCM, Socket.io, payments, in-app chat.

## Folder structure

```
src/
  config/       env + db connection
  models/       User, Otp, Category, Trip, Lead
  services/     otp, sms, token (JWT), s3 (media)
  middleware/   auth, requireRole, validate, upload, error
  validators/   Zod request schemas
  controllers/  auth, trip, lead, category, upload
  routes/       route definitions (mounted under /api)
  utils/        logger, ApiError, asyncHandler, apiResponse
  seed/         seedCategories.js
  app.js        express app (middleware + routes)
  server.js     bootstrap (db connect + listen + graceful shutdown)
```
