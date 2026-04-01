# Finance Backend

NestJS backend for a finance dashboard with:

- Role-based access control (viewer, analyst, admin)
- User management with active/inactive status
- Financial records CRUD with filtering and pagination
- Dashboard summary analytics endpoints
- Validation, consistent error handling, and tests

## Role Model

- viewer: can only view dashboard summary
- analyst: can view records and dashboard summary
- admin: full access to users and records management

## Authentication Model

This backend supports token-based auth with token versioning:

- `POST /auth/signup` creates a new account (default role: `viewer`) and returns an access token
- `POST /auth/login` returns an access token for an active user
- `POST /auth/logout` invalidates existing tokens by incrementing user token version

Protected endpoints accept:

- `Authorization: Bearer <accessToken>` (primary)

Compatibility fallback (still supported):

- Send `x-user-id` in requests to protected endpoints.
- The backend resolves the user and enforces role permissions.

Seeded default admin user:

- id: `1`
- email: `admin@finance.local`
- role: `admin`

## Persistence

Data is persisted in Postgres (Neon) using Drizzle ORM.

Required environment variable:

- `DATABASE_URL` (Neon connection string)

Optional:

- `AUTH_SECRET` (token signing secret for login/logout flow)

On startup, the backend ensures required tables exist and seeds a default admin user if missing.

## API Endpoints

Public:

- `GET /health`
- `POST /auth/signup`
- `POST /auth/login`

Authenticated:

- `POST /auth/logout` (viewer, analyst, admin)

Users (admin only):

- `POST /users`
- `GET /users`
- `GET /users/:id`
- `PATCH /users/:id`
- `DELETE /users/:id`

Records:

- `POST /records` (admin)
- `GET /records` (analyst, admin)
- `GET /records/:id` (analyst, admin)
- `PATCH /records/:id` (admin)
- `DELETE /records/:id` (admin)

Record filters:

- `type` (`income` or `expense`)
- `category`
- `startDate`
- `endDate`
- `search` (matches notes/category)
- `page`, `limit`

Dashboard:

- `GET /dashboard/summary` (viewer, analyst, admin)

Summary includes:

- totalIncome
- totalExpenses
- netBalance
- categoryTotals
- recentActivity
- monthlyTrends

## Run Project

Install dependencies:

```bash
pnpm install
```

Start dev server:

```bash
pnpm start:dev
```

Set environment variables before running:

```bash
export DATABASE_URL='postgresql://...'
export AUTH_SECRET='replace-in-production'
```

## API Docs (Swagger)

Interactive API documentation is available at:

- `GET /docs`

Use the `Authorize` button with your bearer token from signup/login for protected endpoints.

## Validation and Errors

- Global validation pipe with whitelist/transform/forbid unknown fields
- Structured error response via global exception filter

## Tests

Unit tests:

```bash
pnpm test
```

E2E tests:

```bash
pnpm test:e2e
```

Lint:

```bash
pnpm lint
```
# findash
