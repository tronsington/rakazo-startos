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

## Bot computers (current limitation)

Rakazo's headline feature — each bot getting its own browser desktop — needs
host-level Docker access, which a StartOS package cannot have. Out of the box
this version runs with computers disabled; everything else (chat, memory,
schedules, credential store) works. To enable bot computers, open the
**Bot Computers** action and connect a remote provider (E2B, Daytona, Box, or
CreateOs) with your API key — upstream reads these from server-side
environment only, so the action is where they live. Daytona and Box also
accept a self-hosted control-plane URL if you run your own on another
Docker-capable machine.

## Notes

- Hardware: comfortable on 8 GB RAM; 6 GB allocated ceiling across daemons.
- There is no password-recovery email in this version (SMTP is not wired).
  Record your owner password.
- Backups include the database (logical dump), the app data volume, and this
  package's secrets store. Restoring a backup preserves your encryption key,
  so saved credentials survive.
- API and web run from the same upstream image at the pinned release; both
  update together on a package update.
