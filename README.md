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

| Command          | What it does                         |
| ---------------- | ------------------------------------ |
| `pnpm install`   | Install all workspace dependencies   |
| `pnpm dev`       | Run the web app at http://localhost:3000 |
| `pnpm test`      | Run unit tests (core)                |
| `pnpm typecheck` | Type-check every package             |
| `pnpm lint`      | Lint                                 |
| `pnpm build`     | Production build of the web app      |

## Notes

- v1 stores data in the browser only; no database is needed to run it. The Postgres /
  Drizzle setup from T3 is kept for later (e.g. syncing across web and mobile).
- Browser notifications fire only while the browser is running. Background reminders
  will come with the mobile app (local notifications) or a PWA with push.
