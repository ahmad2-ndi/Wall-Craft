# Wall Crafter Backend

Node.js + Express API with PostgreSQL, bcrypt password hashing, and JWT authentication.

## Setup

1. Copy `.env.example` to `.env` and set a long `JWT_SECRET`.
2. Start PostgreSQL with Docker: `docker compose up -d`.
3. Apply the schema and seed the admin account: `npm run db:init`.
4. Install and start:

```powershell
cd backend
npm install
npm start
```

The API runs on `http://localhost:3000` by default.

## Main endpoints

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/products`
- `POST/PATCH/DELETE /api/products` (admin JWT required)
- `POST /api/orders` (authenticated customer JWT required)

The current static frontend still uses its localStorage compatibility layer. The API is ready for frontend wiring after the database is configured.
