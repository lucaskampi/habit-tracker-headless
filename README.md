Habit Tracker Backend (NestJS + Prisma)

Overview
 - This repository is a headless NestJS backend (Prisma + PostgreSQL) that exposes a small REST API for a habit-tracking React+TypeScript frontend. The backend stores users, habits, and daily completion records and provides a heatmap-style aggregate used by the frontend dashboard.

Quick start
1. Create a Postgres database and set `DATABASE_URL` environment variable.
2. Install dependencies:

```bash
npm install
```

3. Generate Prisma client and run migrations (after configuring `DATABASE_URL`):

```bash
npx prisma generate
npx prisma migrate dev --name init
```

4. Seed dev data (optional):

```bash
npm run prisma:seed
```

5. Start dev server:

```bash
npm run start:dev
```

Environment
 - `DATABASE_URL` — Postgres connection string (required)
 - `JWT_SECRET` — secret used for signing JWTs (planned)

Where things live
 - Prisma schema: `prisma/schema.prisma`
 - Seed script: `prisma/seed.ts`
 - Main NestJS entry: `src/main.ts`
 - Habits module: `src/habits` (controller, service, DTOs)

Auth (how frontend should authenticate)
 - Planned: JWT short-lived access token + refresh token flow.
 - Endpoints (planned):
	 - `POST /auth/register` — body: `{ email, password, name? }`
	 - `POST /auth/login` — body: `{ email, password }` -> returns `{ accessToken, refreshToken }`
	 - `POST /auth/refresh` — body/cookie: refresh token -> returns new tokens
	 - `POST /auth/logout` — revoke refresh token
 - Use the `Authorization: Bearer <accessToken>` header for protected API calls. For now the scaffold uses `:userId` path parameter; once auth is implemented the frontend will use the authenticated user's id on requests.

API contract for frontend integration

1) List habits
 - GET /users/:userId/habits
 - Response: array of habit objects

Habit object (key fields)
 - `id` — string
 - `title` — string
 - `description` — string | null
 - `frequencyType` — enum: `DAILY` | `WEEKLY` | `CUSTOM`
 - `frequencySpec` — JSON object (format described below)
 - `goal` — int (times per period)

Example habit JSON

```json
{
	"id": "ckxyz...",
	"title": "Drink water",
	"description": "10 glasses daily",
	"frequencyType": "DAILY",
	"frequencySpec": { "interval": 1 },
	"goal": 10
}
```

2) Create habit
 - POST /users/:userId/habits
 - Body: `CreateHabitDto` — see `src/habits/dto/create-habit.dto.ts` (title, frequencyType, frequencySpec, goal, description)

3) Mark/unmark completion
 - POST /users/:userId/habits/:habitId/complete
	 - Body: `{ date?: ISODateString }` — default to today UTC if omitted
	 - Increments a completion counter for the habit on that day (supports `count` if a habit needs multiple hits per day)
 - POST /users/:userId/habits/:habitId/uncomplete
	 - Body: `{ date?: ISODateString }` — removes the completion record for that day

4) Heatmap / dashboard
 - GET /users/:userId/habits/dashboard/heatmap?start=YYYY-MM-DD&end=YYYY-MM-DD
 - Response: object mapping `YYYY-MM-DD` -> number (total completions across all habits for that user on that date)

Example heatmap response

```json
{
	"2026-01-01": 3,
	"2026-01-02": 2,
	"2026-01-03": 0
}
```

Frontend should map those counts to visually stronger colors (higher count -> more intense color), similar to GitHub contribution graphs. The frontend can normalize counts to the user's maximum or a fixed scale.

Frequency specification examples (`frequencySpec`)
 - Daily simple: `{ "interval": 1 }` — every day
 - Weekly: `{ "daysOfWeek": [1,3,5] }` — Monday/Wednesday/Friday (use 0=Sunday..6=Saturday or define consistently)
 - Custom: store any JSON your UI needs — the backend treats `frequencySpec` as JSON and the recurrence evaluator will interpret it.

Date handling
 - Completions are stored as UTC dates with time normalized to start-of-day on write. Frontend should send ISO dates (e.g., `2026-01-28T00:00:00.000Z`) or just `YYYY-MM-DD` and backend will parse to UTC day.

Suggestions for frontend work
 - Implement an API client that injects `Authorization` header when available.
 - Create a `Dashboard` component that requests the heatmap range (recommend showing last 3 months by default) and renders a calendar/heatmap.
 - Per-habit page: request habit details and completion history. Suggested API (not yet implemented):
	 - `GET /users/:userId/habits/:habitId` — habit metadata
	 - `GET /users/:userId/habits/:habitId/history?start=&end=` — list of completion entries
 - Visual mapping: map daily completion count relative to habit `goal` for per-habit views; for global heatmap, map to total completed habits or absolute counts depending on UX.

Developer notes
 - The Prisma models are defined in `prisma/schema.prisma` (User, Habit, HabitCompletion).
 - You can seed a demo user with `npm run prisma:seed`.
 - The current scaffold exposes the habits routes under `users/:userId/habits`. When auth is available, the frontend should call endpoints using the authenticated user's id (or the backend will switch to using the token to derive the user id).

Next steps for backend (so frontend expectations are clear)
 - Implement `AuthModule` (JWT access + refresh tokens).
 - Add `GET /users/:userId/habits/:habitId/history` to support per-habit calendar/graph.
 - Add OpenAPI (Swagger) and a Postman collection to speed frontend integration.

If you paste this into the frontend Copilot prompt it should have enough context to scaffold API client functions, mocked responses, and UI components for dashboard and per-habit pages. Tell me if you want me to also generate an example Postman collection or OpenAPI spec next.
# habit-tracker-headless
