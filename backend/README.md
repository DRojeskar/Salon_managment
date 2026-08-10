# Salon Management Backend

A simple Express backend for the Salon Management frontend.

## Setup

1. Open a terminal in `e:/salon_managment/backend`
2. Run `npm install`
3. Start the server:
   - `npm start` for production
   - `npm run dev` if you add `nodemon` globally or install it locally

## API Endpoints

Auth:
- `POST /api/auth/register`
- `POST /api/auth/login`

Protected resources (require `Authorization: Bearer <token>`):
- `GET /api/staff`
- `POST /api/staff`
- `PUT /api/staff/:id`
- `DELETE /api/staff/:id`

- `GET /api/services`
- `POST /api/services`
- `PUT /api/services/:id`
- `DELETE /api/services/:id`

- `GET /api/slots`
- `POST /api/slots`
- `PUT /api/slots/:id`
- `DELETE /api/slots/:id`

- `GET /api/appointments`
- `POST /api/appointments`
- `PUT /api/appointments/:id`
- `DELETE /api/appointments/:id`

- `GET /api/bookings`
- `POST /api/bookings`
- `PUT /api/bookings/:id`
- `DELETE /api/bookings/:id`

- `GET /api/clients`

## Notes

- The backend stores data in `db.json` by default.
- You can override the database location using `DB_URL` or `DB_PATH` in `.env`.
- Example local DB URL values:
  - `DB_URL=./db.json`
  - `DB_URL=file://./db.json`

- Auth tokens are JWTs signed with `JWT_SECRET` in environment variables, or a default secret.
- The backend loads `.env` automatically via `dotenv`.
- The frontend can use `http://localhost:5000/api` as the base URL.

## Models

- `backend/models/userModel.js` contains the user model layer.
- `backend/models/resourceModel.js` contains generic CRUD model methods.
- `backend/controllers/` now uses these models to keep the app in MVC style.
