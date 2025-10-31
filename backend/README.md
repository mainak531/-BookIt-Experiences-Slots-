# Travel Experiences Backend (Express + PostgreSQL)

This is the backend API for the Travel Experiences app. It provides endpoints to list experiences, view details with slot availability, create bookings with double-booking prevention, and validate promo codes.

The server supports two modes:
- DB mode (default): Uses PostgreSQL for persistent storage.
- Mock mode: If `DATABASE_URL` is not set, endpoints return in-memory mock data so you can run the full flow without a database.

---

## Quick Start

### 1) Install
```bash
cd backend
npm install
```

### 2) Choose a mode
- Mock mode: Do nothing (leave `DATABASE_URL` unset) and start the server.
- DB mode: Provide a valid PostgreSQL connection string in `.env` (see below), apply the schema, then start the server.

### 3) Run
```bash
npm run dev
```

Server starts on `http://localhost:4000`.

Check health:
- `GET /` → `{ message: 'Backend running', mode: 'mock' | 'db' }`
- `GET /health/db` → `{ ok: true }` in DB mode, or `{ ok: true, mode: 'mock' }` in mock mode

---

## Environment Variables
Create `backend/.env` (DB mode):
```
DATABASE_URL=postgresql://USER:PASS@localhost:5432/DBNAME
PORT=4000
```
- `DATABASE_URL` is required for DB mode.
- If `DATABASE_URL` is missing, the API runs in mock mode automatically.

---

## Database Setup (DB mode)

1. Create a database/user in PostgreSQL.
2. Apply schema and seed data:
```bash
psql -U USER -d DBNAME -f backend/db.sql
```
This creates:
- `experiences` – base experience catalog
- `slots` – dated time slots with `slots_left`
- `bookings` – user bookings
- `promocodes` – supported promo codes (e.g., SAVE10, FLAT100)

> Note: The seed data creates 5 days × 4 time slots per day for each experience.

---

## API

Base URL: `http://localhost:4000`

### GET /experiences
Returns the list of experiences.

Response (200):
```json
[
  {
    "id": 1,
    "title": "Kayaking",
    "location": "Udupi",
    "description": "...",
    "price": 999,
    "image": "https://...",
    "alt_text": "Kayaking experience in Udupi"
  }
]
```

### GET /experiences/:id
Returns an experience with upcoming (next 5 days) slot availability.

Response (200):
```json
{
  "id": 1,
  "title": "Kayaking",
  "location": "Udupi",
  "description": "...",
  "price": 999,
  "image": "https://...",
  "alt_text": "Kayaking experience in Udupi",
  "slots": [
    { "id": 110, "date": "2025-10-30", "time": "07:00 am", "slots_left": 5 }
  ]
}
```

### POST /bookings
Creates a booking and decrements `slots_left` atomically (DB mode). In mock mode, returns a generated `bookingId`.

Request:
```json
{
  "experienceId": 1,
  "slotId": 110,
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "quantity": 2,
  "promoCode": "SAVE10",
  "price": 999,
  "subtotal": 1998,
  "taxes": 120,
  "total": 2118
}
```

Response (200):
```json
{ "bookingId": 42, "createdAt": "2025-10-30T18:17:00.000Z" }
```

Errors (e.g. insufficient availability):
```json
{ "error": "Not enough slots left." }
```

### POST /promo/validate
Validates a promo code.

Request:
```json
{ "promoCode": "SAVE10" }
```

Response (valid):
```json
{ "valid": true, "code": "SAVE10", "discount_type": "percent", "discount_value": 10, "is_active": true }
```

Response (invalid):
```json
{ "valid": false, "message": "Invalid promo code." }
```

---

## Frontend Integration Notes
The frontend is configured to call:
- `GET /experiences` on the Home page
- `GET /experiences/:id` on the Details page
- `POST /promo/validate` and `POST /bookings` on the Checkout page

Make sure the backend runs on `http://localhost:4000` (or adjust the frontend fetch URLs accordingly).

---

## Troubleshooting

- "Failed to fetch" on frontend
  - Ensure backend is running: `npm run dev`
  - Visit `http://localhost:4000/experiences` in the browser to confirm it returns JSON
  - If using DB mode, verify `.env` and DB connectivity (`/health/db`)
  - CORS is enabled globally via `app.use(cors())`

- DB migration errors
  - Confirm the DB user and database exist
  - Run the schema again: `psql -U USER -d DBNAME -f backend/db.sql`

- Ports / Conflicts
  - Change `PORT` in `.env` and update frontend URLs if needed

---

## Scripts
- `npm run dev` – start the server

---

## Tech
- Node.js + Express
- PostgreSQL (via `pg`)
- Tailwind/React frontend (separate project)

Mock mode makes it easy to validate the end-to-end flow before provisioning a database. Switch to DB mode by setting `DATABASE_URL` and applying the schema.
