# rakazo-startos

A [StartOS](https://start9.com) service package for
[Rakazo](https://rakazo.com) (`ghcr.io/elie222/rakazo`) — persistent AI
teammates with memory, schedules and credentials, self-hosted. Web UI +
API + worker, with an internal PostgreSQL.

```bash
git clone https://github.com/tronsington/rakazo-startos
cd rakazo-startos
npm ci
make x86        # rakazo_x86_64.s9pk
make arm        # rakazo_aarch64.s9pk (upstream publishes both)
```

## What this package is

|              |                                                                                                                            |
| ------------ | -------------------------------------------------------------------------------------------------------------------------- |
| Upstream pin | `ghcr.io/elie222/rakazo/app` = **v0.2.0** / commit `f10b4ffd`, digest `sha256:8b4fd589…` (index, amd64+arm64)              |
| Sidecars     | `postgres:16@sha256:e17e8606…` (upstream's own compose pin), `busybox:1@sha256:fd7dc986…` for the one chown oneshot        |
| Interface    | one HTTP interface on port 5173 (web UI; same-origin proxies `/api`, `/rpc`)                                               |
| Secrets      | `POSTGRES_PASSWORD`, `BETTER_AUTH_SECRET`, `ENCRYPTION_KEY`, `SCREEN_PROXY_SECRET` — generated at install, never re-rolled |
| Daemons      | postgres → (chown-data oneshot) → api (migrate deploy → serve) → worker, web                                               |

## v1 scope: no bot computers

Upstream's default `SANDBOX_PROVIDER=docker` boots local Chromium "computers"
through an in-stack supervisor mounting the host Docker socket. StartOS
service containers cannot get that socket, so the default ships
`SANDBOX_PROVIDER=none` — upstream's own `NoneSandboxProvider` keeps the UI,
chat, memory, credentials and schedules working with no computer host.
Remote providers (E2B / Daytona / Box / CreateOs) are set server-side by
environment variables only (verified in upstream's
`packages/adapters/src/sandbox-provider-env.ts`), so they are configured
through the package's **Bot Computers** action, which writes
`SANDBOX_PROVIDER` + the provider key (and Daytona/Box's optional
control-plane URL) into the api/worker daemon env. Local computers = revisit
only if StartOS ever exposes a socket capability.

## Onboarding flow

Install → answer the **Set App Address** critical task (the address cookies
and CORS bind to) → start → register the first account (it becomes owner) →
use the **Registration** action to close signups and/or set an email
allowlist.

## Repo layout

- `startos/manifest/index.ts` — three digest-pinned images, arch table, RAM floor
- `startos/main.ts` — postgres + chown-data oneshot + api/worker/web daemons
- `startos/actions/` — Set App Address (origin), Registration (gate/allowlist)
- `startos/backups.ts` — logical pg_dump + raw volume copies
- `UPDATING.md` — pin/tag procedure
- `instructions.md` — end-user docs
