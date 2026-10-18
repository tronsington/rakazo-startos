# Rakazo on StartOS

Rakazo gives you persistent AI teammates that remember context, run scheduled
work, and hold their own credentials — all on your own server, under your
control.

## First start

1. Install and open the service. You'll be asked to **Set App Address** before
   it will start — pick the address your browser will use (a public domain if
   you want it reachable anywhere; your server's LAN name otherwise). You can
   change it later, but every login dies when you do.
2. Start the service. First boot runs database migrations and takes a couple
   of minutes; the health checks turn green when it's actually serving.
3. Open the web app and **register your account immediately — the first
   registered account becomes the owner.** Then run the **Registration**
   action to close open signups (or restrict them to specific emails).

## LLM keys

Model provider keys (OpenRouter, Anthropic, OpenAI-compatible endpoints, …)
are entered **inside the Rakazo app**, per user or per bot — Bot settings →
Providers. The package deliberately does not hold your model keys.

## Bot computers (required before bots can answer)

Rakazo's headline feature — each bot living on its own browser desktop — needs
host-level Docker access, which a StartOS package cannot have. **A bot cannot
answer a single message until you connect a computer provider**: every
conversation provisions its computer first. Out of the box the service runs
with no provider, so the account, models and credentials all configure fine,
but bots dead-end.

Open the **Bot Computers** action and connect a provider. Options:

- **Docker — remote host**: run upstream's sandbox supervisor on another
  Docker-capable machine of yours, then point the action at it (URL + shared
  token). This keeps bot computers on your own hardware.
- **E2B** (hosted, easiest): just its API key.
- **Daytona / Box / CreateOs**: hosted, or a self-hosted control plane on
  another Docker-capable machine (those accept your own URL).

Upstream reads these from server-side environment only, so the action is where
they live. Bots created before a provider was set recover on their own at
their next message — no reinstall needed.

## Notes

- Hardware: comfortable on 8 GB RAM; 6 GB allocated ceiling across daemons.
- There is no password-recovery email in this version (SMTP is not wired).
  Record your owner password.
- Backups include the database (logical dump), the app data volume, and this
  package's secrets store. Restoring a backup preserves your encryption key,
  so saved credentials survive.
- API and web run from the same upstream image at the pinned release; both
  update together on a package update.
