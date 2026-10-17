# AGENTS.md — rakazo-startos

StartOS service-package repository for [Rakazo](https://github.com/elie222/rakazo)
(persistent AI teammates), wrapping upstream's published GHCR app image
(digest-pinned; see README's pin table) with a postgres sidecar. Built 2026-10-17
from PLANS/RAKAZO_START9_PACKAGE.md in the agent workspace. **Start every task at
the SDK recipe index** — same discipline as the sibling packages.

## Design decisions not to re-litigate

- **SANDBOX_PROVIDER=none in v1.** Bot computers need the host docker.sock
  (upstream's supervisor model); StartOS containers can't get one. Upstream's
  `packages/adapters/src/none-sandbox.ts` boots fine without computers.
  Remote providers (e2b/daytona/box) stay in-app, per user.
- **Neither browserless nor webtop substitutes for bot computers.** Upstream's
  own computer image already IS a desktop-in-container (Xvfb+fluxbox+noVNC+
  Chromium, infra/sandboxes/computer/Dockerfile) driven via rakazo's supervisor
  control-plane; browser automation is CDP to that computer's own Chrome
  (BROWSER_PROVIDER accepts only computer|fake|emulator — no external-browser
  seam). Asked 2026-10-17, answered with source reads; don't re-explore.
- **No supervisor daemon** — only meaningful for provider=docker.
- **worker env deliberately blanks** `BETTER_AUTH_SECRET`/`SCREEN_PROXY_SECRET`:
  that mirrors upstream compose (environment overrides env_file), not a bug.
- **Secrets generate once at install and never re-roll.** ENCRYPTION_KEY
  rotation renders the credential store unreadable; treat as user data loss.
- **First registered user = owner** (upstream's auth rule). seedFiles leaves
  SIGNUPS_ENABLED true for exactly that reason; the Registration action closes
  it after.
- **store.json lives on the 'main' volume, never mounted into services.**
  pgdata + data + main are three separate volumes; backups does pg_dump +
  raw copies.
- The api daemon's command is `prisma migrate deploy && pnpm … api start` —
  the migration gate IS the upgrade safety. Don't split it.

## Known-untested on purpose (verify on first real install)

- api/worker behavior under provider=none end-to-end beyond the source read.
- Vite preview `--host 0.0.0.0` neighborly to the StartOS interface binding.
- Whether anything calls the absent sandbox-supervisor URL at runtime anyway.
