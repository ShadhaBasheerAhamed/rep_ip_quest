# Python Quest

Python Quest is a progressive, XP-based coding game that trains Grade XI Informatics Practices students for their Python Term-I examination.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/python-quest/src/pages/home.tsx` — student name selection and quest start/resume flow.
- `artifacts/python-quest/src/pages/play.tsx` — 10-mission student game, teaching notes, coding checks, XP/lives, and focus-change detection.
- `artifacts/python-quest/src/pages/teacher.tsx` — responsive classroom progress dashboard.
- `lib/api-spec/openapi.yaml` — source-of-truth API contract for levels, student progress, attempts, and teacher dashboard data.
- `lib/db/src/schema/` — PostgreSQL tables for students, per-level progress, and attempts.
- `artifacts/api-server/src/routes/game.ts` — game API and dashboard aggregation.

## Architecture decisions

- Students enter a roster name or custom name without creating an account; the name resumes the same classroom progress record.
- Each mission starts with 30 lives, while XP and completed mission history persist to PostgreSQL.
- The game records browser visibility changes as focus checks instead of claiming to provide secure proctoring; the teacher can review those events.
- The level map follows the attached Term-I paper from syntax and operators through full dictionary/list programs.

## Product

- 10 progressive missions from Python foundations to a Term-I “boss” mission.
- Short concept lesson and example before each coding challenge.
- In-browser code entry with immediate objective feedback, XP, level progression, 30 lives per mission, and mission locking.
- Teacher dashboard with live roster, active-today count, average XP, mission completion, lives, focus checks, and recent activity.

## User preferences

- Students should have no login flow; they select a name from the provided roster or enter a custom name.
- The teacher needs a responsive dashboard for classroom monitoring.

## Gotchas

- Run `pnpm --filter @workspace/api-spec run codegen` after changing `lib/api-spec/openapi.yaml`.
- Artifact build commands require workflow-provided `PORT` and `BASE_PATH`; use the artifact workflow for the normal preview.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
