# Backend API

Express API using PostgreSQL (pg) for persistence.

## Local setup

1. Install Node.js 22 or later and PostgreSQL.
2. Create a PostgreSQL database, for example its_db.
3. Copy .env.example to .env.development.
4. Set DB_URI to your PostgreSQL connection string. Replace all placeholder JWT secrets and set ENC_KEY to a random 32-byte key.
5. Install dependencies and run the API:

   npm install
   npm run start:dev

The application initializes src/db/schema.sql at startup. Existing user tables are not dropped.

## Authentication endpoints

- POST /auth/signup
- POST /auth/signup-with-gmail
- POST /auth/login
- GET /user with a Bearer access token
- PATCH /user with a Bearer access token
- POST /user/rotate-token with a Bearer refresh token

Never commit .env.development or .env.production. Use .env.example as a template only.
