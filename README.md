# Laziless

Beat laziness with tiny tasks, frequently: drink water, stretch, climb stairs, breathe.
A random small activity nudges you at a regular interval during your active hours.

## Monorepo layout

```
apps/
  web/          Next.js (T3: tRPC + Drizzle + Tailwind) — the web app
  mobile/       React Native / Expo app (coming next)
packages/
  core/         Shared, platform-free TypeScript: activities, scheduler,
                state reducer, streaks/stats, storage (de)serialization
```

All app logic lives in `@laziless/core` as a pure reducer (`lazilessReducer`), so the
web and mobile apps only provide UI, storage (localStorage / AsyncStorage), timers and
notifications.

## Commands (run from the repo root)

| Command            | What it does                                   |
| ------------------ | ---------------------------------------------- |
| `pnpm install`     | Install all workspace dependencies             |
| `pnpm dev`         | Run the web app at http://localhost:3000       |
| `pnpm test`        | Run unit tests (core)                          |
| `pnpm typecheck`   | Type-check every package                       |
| `pnpm lint`        | Lint                                           |
| `pnpm build`       | Production build of the web app                |
| `pnpm db:generate` | Write a SQL migration from `schema.ts`         |
| `pnpm db:migrate`  | Apply pending migrations to the database       |
| `pnpm db:studio`   | Browse the database                            |

## Data

- **Activity data stays on the device.** Settings and history live in the browser's
  localStorage (AsyncStorage on mobile). No account is needed.
- **Postgres (Supabase)** stores only what people choose to send: mobile-app waitlist
  emails (`laziless_waitlist`) and feedback messages (`laziless_feedback`).
- Every table has Row Level Security on with no policies, so Supabase's auto-generated
  REST API can't touch them. The server connects as the table owner and isn't affected.
  Keep `.enableRLS()` on every new table in `apps/web/src/server/db/schema.ts`.
- Schema changes: edit `schema.ts` → `pnpm db:generate` → review and commit the SQL in
  `apps/web/drizzle/` → `pnpm db:migrate`. Avoid `db:push` once there is real data.

## Deploying (Vercel)

1. Import the GitHub repo in Vercel and set **Root Directory** to `apps/web`.
   Vercel detects pnpm and the workspace automatically.
2. Environment variables:

   | Name                   | Value                                                                    |
   | ---------------------- | ------------------------------------------------------------------------ |
   | `DATABASE_URL`         | Supabase **Transaction pooler** string (Connect → Transaction pooler, port 6543). The direct host is IPv6-only and unreachable from Vercel. |
   | `NEXT_PUBLIC_SITE_URL` | Your real origin, e.g. `https://laziless.app` (no trailing slash). Without it, canonical URLs, the sitemap and OG tags point at localhost. |

3. Run migrations from your machine (`pnpm db:migrate`) before deploying a change that
   needs them. Your local `.env` should use the direct (or session pooler) string.
4. `apps/web/vercel.json` schedules a daily cron to `/api/health`, which runs `select 1`
   so a free Supabase project doesn't pause after a week without activity.

CI (`.github/workflows/ci.yml`) runs test, lint, build and typecheck on every push and
pull request, with placeholder env values. It never connects to the real database.

## Notes

- Browser notifications fire only while the browser is running. Background reminders
  will come with the mobile app (local notifications) or a PWA with push.
- Before launch, set `contactEmail` in `apps/web/src/content/site.ts`; the privacy page
  and footer use it.
