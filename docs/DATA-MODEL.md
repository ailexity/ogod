# Data Model (MongoDB)

All collections use Mongoose schemas in [`backend/src/models`](../backend/src/models).
`category` and `destination` are **open values** — new categories are added via the
`categories` collection (admin/config), never by changing code.

## `users`

| Field              | Type     | Notes                                       |
| ------------------ | -------- | ------------------------------------------- |
| `_id`              | ObjectId |                                             |
| `name`             | String   | required                                    |
| `mobile`           | String   | unique, verified via OTP                    |
| `organizationName` | String   | optional                                    |
| `role`             | String   | `poster` \| `admin` (traveler is anonymous) |
| `createdAt`        | Date     |                                             |

## `trips`

| Field            | Type       | Notes                                         |
| ---------------- | ---------- | --------------------------------------------- |
| `_id`            | ObjectId   |                                               |
| `posterId`       | ObjectId   | ref `users`                                   |
| `title`          | String     | required                                      |
| `category`       | String     | open value (validated against `categories`)   |
| `destination`    | Object     | `{ name, geo: { type:'Point', coordinates }}` |
| `startDate`      | Date       |                                               |
| `endDate`        | Date       |                                               |
| `durationDays`   | Number     |                                               |
| `pricePerPerson` | Number     |                                               |
| `totalSeats`     | Number     |                                               |
| `seatsRemaining` | Number     | shown on cards                                |
| `description`    | String     |                                               |
| `itinerary`      | Array      | `[{ day, locations[], timings, inclusions[], packingList[] }]` |
| `coverPhotoUrl`  | String     | required                                      |
| `galleryUrls`    | [String]   | optional                                      |
| `status`         | String     | `live` \| `paused` \| `deleted` \| `past`     |
| `createdAt`      | Date       |                                               |

`destination.geo` is a GeoJSON Point with a `2dsphere` index for "popular near you".

## `leads`

| Field                 | Type     | Notes                       |
| --------------------- | -------- | --------------------------- |
| `_id`                 | ObjectId |                             |
| `tripId`              | ObjectId | ref `trips`                 |
| `posterId`            | ObjectId | ref `users` (denormalized)  |
| `travelerName`        | String   | required                    |
| `travelerMobile`      | String   | required                    |
| `destinationInterest` | String   |                             |
| `requirements`        | String   | optional                    |
| `createdAt`           | Date     |                             |

## `categories`

Open, admin-extendable list that keeps the platform generic.

| Field       | Type    | Notes                                   |
| ----------- | ------- | --------------------------------------- |
| `_id`       | ObjectId|                                         |
| `slug`      | String  | unique, e.g. `pilgrimage`, `trek`       |
| `label`     | String  | display name                            |
| `imageUrl`  | String  | category tile art (optional)            |
| `sortOrder` | Number  | controls chip / tile ordering           |
| `active`    | Boolean |                                         |

## `otps` (transient)

Stores hashed OTP codes for mobile verification with a TTL index so entries auto-expire.

| Field       | Type   | Notes                            |
| ----------- | ------ | -------------------------------- |
| `mobile`    | String | indexed                          |
| `codeHash`  | String | hashed OTP                       |
| `attempts`  | Number | brute-force guard                |
| `expiresAt` | Date   | TTL index (auto-delete)          |
