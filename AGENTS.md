# AGENTS.md — rakazo-startos

StartOS service-package repository for [Rakazo](https://github.com/elie222/rakazo)
(persistent AI teammates), wrapping upstream's published GHCR app image
(digest-pinned; see README's pin table) with a postgres sidecar. Built 2026-10-17
from PLANS/RAKAZO_START9_PACKAGE.md in the agent workspace. **Start every task at
the SDK recipe index** — same discipline as the sibling packages.

## Design decisions not to re-litigate

- **Screen bridge (v0.2.0:3) — the shared-netns fact is load-bearing.** All
  daemons in this package share ONE network namespace (proven in prod by the
  web→api `127.0.0.1:3100` proxy). That is why the bridge sidecar works with
  ZERO app-side changes: its ssh -L 0.0.0.0:<port> forwards land on the same
  loopback the web service dials for sealed screen URLs. Do not add a
  hostname-rewrite preload "for safety" — it is unnecessary here and was
  deliberately dropped (Claude's screen-rewrite.cjs survived review but not
  the netns insight).
- **Bridge connection config lives in store.json (`bridge*`), fed to the
  bridge daemon as env.** CF fields → cloudflared access tcp mode; sshHost →
  direct. Neither ⇒ bridge execs `sleep infinity` BY DESIGN (no crash loop;
  health check treats sleep as healthy). The bridge ssh keypair is generated
  by bridge.sh itself on the `bridge` volume iff absent, before the mode
  check, so the Screen Bridge Setup action can always print it. Key rotation
  = manual (delete bridge_key* on the volume, re-enroll).
- **bridge volume is mounted ONLY into the bridge sub** (and its chown
  oneshot), RW. Never mount it into api/web/worker.
- **assets/shims/strip-foreign-dispatcher.cjs** mounts RO into api+worker,
  loaded via NODE_OPTIONS=--require. Works around the openai@6.40/undici
  UND_ERR_INVALID_ARG pairing bug on openai-compatible gateways (source
  trace in the workspace RESEARCH). Tradeoff: drops upstream's SSRF DNS
  host-pinning on that lane — noted in release notes. Remove when upstream
  fixes the pairing (verify by unmounting + re-testing a gateway endpoint).
- **Bridge known limitation:** a refused `ssh -O cancel` forfeits that local
  port until the ssh mux bounces (mux bounce = full rebuild, next scan
  retries refused forwards). Accepted for v1.
- **Building the aarch64 lane on the sandbox**: binfmt is IMPOSSIBLE there
  (LXC — the host kernel owns binfmt_misc; tonistiigi/binfmt fails with
  EACCES even privileged). The qemu-free path used for v0.2.0-3 lives in
  ~/builds/build-bridge-rootfs-arm64.sh on the sandbox: export the arm64
  alpine rootfs (pull by TAG — docker 20.10 digest refs deadlock on
  arch-flips; stop/rmi amd64 digest holders incl. the running supervisor's
  image, then restore it after), apk cross-install from an x86 alpine
  container (seed /arm/etc/apk/keys, --no-scripts), CA bundle copied from the
  native x86 bridge image, sha-pinned cloudflared, ELF-aarch64 verified, then
  swap Dockerfile to a RUN-free `FROM scratch / ADD rootfs` variant for
  `make arm` (arm s9pk manifest shows gitHash "-modified" — accepted,
  disclosed; x86_64 packs clean from the committed Dockerfile). Pack also
  needs a docker-container buildx builder (`docker buildx create
  --driver docker-container --name s9pk --use --bootstrap`) — the default
  docker driver cannot export local builds.
- **SANDBOX_PROVIDER=none means bots CANNOT converse** (verified live by
  Dylan 2026-10-18, source @f10b4ffd): createBot always attaches a computer
  (team-scope by default) and every run provisions it first; the none
  provider fails every provision. "none" boots the UI, models and
  credentials only. Bots created under none self-heal when a provider is
  later set — the computer row's kind/providerRef are rewritten at the first
  successful provision. Docs and the Bot Computers action say this.

- **SANDBOX_PROVIDER=none in v1.** Bot computers need the host docker.sock
  (upstream's supervisor model); StartOS containers can't get one. Upstream's
  `packages/adapters/src/none-sandbox.ts` boots fine without computers.
  **v0.2.0:2 adds the third path**: the Configure Computers action accepts
  provider=docker pointed at a REMOTE supervisor (SANDBOX_SUPERVISOR_URL +
  TOKEN) — the supervisor runs from upstream's app image on any Docker host
  the box can reach; it spawns rakazo's own computer image there. Hosted/self-
  served remote providers (e2b/daytona/box/createos) are in the same action.
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

- ~~api/worker behavior under provider=none end-to-end~~ RESOLVED
  2026-10-18 (live log + source read): runs fail at setup with "Computers
  unavailable"; bots need a provider. See the top design-decisions bullet.
- Vite preview `--host 0.0.0.0` neighborly to the StartOS interface binding.
- Whether anything calls the absent sandbox-supervisor URL at runtime anyway.
