# rakazo-startos

A [StartOS](https://start9.com) service package for
[Rakazo](https://rakazo.com) (`ghcr.io/elie222/rakazo`) — persistent AI
teammates with memory, schedules and credentials, self-hosted. Web UI +
API + worker, with an internal PostgreSQL, a screen-bridge sidecar for
Docker-remote bot desktops, and a small model-client compatibility shim.

```bash
git clone https://github.com/tronsington/rakazo-startos
cd rakazo-startos
npm ci
make x86        # rakazo_x86_64.s9pk
make arm        # rakazo_aarch64.s9pk (source-builds the arm64 bridge image — needs binfmt)
```

## What this package is

|              |                                                                                                                            |
| ------------ | -------------------------------------------------------------------------------------------------------------------------- |
| Upstream pin | `ghcr.io/elie222/rakazo/app` = **v0.2.0** / commit `f10b4ffd`, digest `sha256:8b4fd589…` (index, amd64+arm64)              |
| Sidecars     | `postgres:16@sha256:e17e8606…` (upstream's own compose pin), `busybox:1@sha256:fd7dc986…` for chown oneshots               |
| Own image    | `bridge` — built from `docker-images/bridge/` at pack time (alpine digest-pinned; cloudflared version+sha256 pinned)       |
| Interface    | one HTTP interface on port 5173 (web UI; same-origin proxies `/api`, `/rpc`)                                               |
| Secrets      | `POSTGRES_PASSWORD`, `BETTER_AUTH_SECRET`, `ENCRYPTION_KEY`, `SCREEN_PROXY_SECRET` — generated at install, never re-rolled |
| Daemons      | postgres → (chown oneshots) → api (migrate deploy → serve) → worker, web, bridge (sleeps until configured)                  |

## Bot computers

StartOS service containers cannot get the host Docker socket, so upstream's
default local-computer supervisor is impossible here; the package boots with
`SANDBOX_PROVIDER=none` and the **Bot Computers** action wires remote
providers (upstream reads provider + keys from server-side env only — no
in-app route): Docker-remote (your own supervisor on another Docker host),
E2B, Daytona, Box, CreateOs. Bots cannot converse at all until a provider is
connected — every conversation provisions a computer first.

### Screen bridge (desktop view & control, Docker-remote)

The remote supervisor publishes bot desktops on its host's loopback at
ephemeral ports and hands the app sealed `127.0.0.1:<port>` URLs. The bridge
sidecar discovers bot containers over ssh (`docker ps` label scan) and
republishes the same ports inside this package's shared network namespace, so
the web service's sealed loops just work — no upstream patches. Reachability:
`cloudflared access tcp` with a dedicated ssh ingress hostname + Access
service token (tunnel-only hosts), or plain ssh to a LAN/VPN host. One-time
host prep is printed by the **Screen Bridge Setup** action; see
`docker-images/bridge/bridge.sh`'s header for the threat model and failure
modes.

### Model-client shim

`assets/shims/strip-foreign-dispatcher.cjs` is mounted into api+worker and
loaded via `NODE_OPTIONS=--require`. It works around an upstream bug
(openai@6.40.0 + undici dispatcher pairing → `UND_ERR_INVALID_ARG` on
openai-compatible endpoints). Tradeoff while present: that lane loses
upstream's SSRF DNS host-pinning. Removal condition: upstream fixes the
pairing; verify by dropping the env mount and re-testing a gateway endpoint.

## Onboarding flow

Install → answer the **Set App Address** critical task (the address cookies
and CORS bind to) → start → register the first account (it becomes owner) →
use the **Registration** action to close signups and/or set an email
allowlist. Bot computers + bridge come after, via their actions.

## Repo layout

- `startos/manifest/index.ts` — three digest-pinned upstream images + one local bridge build, arch table, RAM floor
- `startos/main.ts` — postgres + chown oneshots + api/worker/web/bridge daemons
- `startos/actions/` — Set App Address (origin), Registration (gate/allowlist), Bot Computers (providers + bridge connection), Model Providers, Screen Bridge Setup
- `assets/shims/` — the NODE_OPTIONS preload, mounted read-only into api+worker
- `docker-images/bridge/` — bridge sidecar source (built by pack)
- `startos/backups.ts` — logical pg_dump + raw volume copies (incl. bridge key)
- `UPDATING.md` — pin/tag procedure
- `instructions.md` — end-user docs
