export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts
  'Starting Rakazo': 0,
  'PostgreSQL is ready': 1,
  'Waiting for PostgreSQL to be ready': 2,
  API: 3,
  'API is ready': 4,
  'API is not ready': 5,
  'Worker is running': 6,
  'Worker is not running': 7,
  'Web Interface': 8,
  'The web interface is ready': 9,
  'The web interface is not ready': 10,
  // interfaces.ts
  Rakazo: 11,
  'Rakazo web app — chat with and manage your AI teammates': 12,
  // actions/setOrigin.ts
  'Set App Address': 13,
  'Choose the address Rakazo serves its web app on.': 14,
  'App Address/URL': 15,
  'The address your browser will use to reach Rakazo. Cookies and CORS bind to it, so existing logins are invalidated if you change it later.': 16,
  'No domain is switched on for the Rakazo interface yet. Add one under Interfaces and switch it on there first.': 17,
  'Cookies and CORS bind to this address. Changing it later invalidates every existing login. A public domain makes the app reachable from the internet (with TLS handled for you); a private domain keeps it on your LAN/VPN.': 18,
  // actions/registrationSettings.ts
  Registration: 19,
  'Open or close new account registration.': 20,
  'Allow new registrations': 21,
  'Leave on only until your owner account exists — the FIRST registered account becomes the owner. Turn off once you have signed up.': 22,
  'Signup allowlist (emails, comma-separated)': 23,
  'Only these addresses may register while set. Empty keeps the list already stored. Requires registrations to stay enabled to matter.': 24,
  // actions/configureComputers.ts
  'Bot Computers': 26,
  'Choose where bot computers run. Bots cannot reply until one is set — every conversation provisions a computer first. StartOS packages cannot run the local Docker supervisor (no host Docker socket), so pick a remote provider.': 27,
  Provider: 28,
  'None runs Rakazo without bot computers. Docker expects your own supervisor on a separate Docker host; Createos/Box/Daytona accept a self-hosted control-plane URL; E2B is hosted only.': 29,
  'API Key': 30,
  'Your provider API key. Required when switching away from None; re-enter only when rotating it.': 31,
  'Control-plane URL (optional)': 32,
  'Self-hosters only: your own Daytona (DAYTONA_API_URL), Box (BOX_API_URL) or CreateOs (CREATEOS_SANDBOX_BASE_URL) endpoint. Leave empty for the hosted default.': 33,
  'Daytona target (optional)': 34,
  'A Daytona target/region name. Leave empty for the provider default.': 35,
  'Daytona snapshot (optional)': 36,
  'A Daytona snapshot name for the computer image. Leave empty for the provider default.': 37,
  'A provider needs its API key.': 38,
  // actions/allowPublicEndpoints.ts
  'Model Providers': 39,
  'Upstream blocks public model endpoints by default. Toggle only if you use a hosted provider.': 40,
  'Allow public model endpoints': 41,
  'Enable only if you add a hosted provider (OpenAI, OpenRouter, …). Everything an agent sends goes to the configured endpoint. Private endpoints on localhost or your LAN always work with this off.': 42,
  'Supervisor URL (Docker-remote only)': 43,
  'The sandbox supervisor running on your remote Docker host, e.g. http://192.168.x.x:7091. Access to it is equivalent to control of that Docker host — keep it on your LAN.': 44,
  'Supervisor token (Docker-remote only)': 45,
  'The shared bearer token the supervisor on your remote host was started with (32+ characters). Re-enter only when rotating it.': 46,
  'Docker-remote needs the supervisor URL.': 47,
  'Docker-remote needs the supervisor token.': 48,
  // actions/configureComputers.ts — screen bridge fields
  'Bridge SSH user (desktop view/control)': 49,
  'Docker-remote only: the ssh login on your Docker host the screen bridge connects as. Enables desktop view and click/type control. Pair with the Cloudflare fields or a directly reachable host below.': 50,
  'Bridge SSH host (direct)': 51,
  'A hostname or IP for the Docker host that this server can reach directly (LAN/VPN), sshd on port 22. Leave empty when connecting through Cloudflare instead. Changing it re-accepts host keys.': 52,
  'Cloudflare SSH hostname': 53,
  'A dedicated cloudflared ingress hostname that routes to sshd on the Docker host (service: ssh://localhost:22). Setting the three Cloudflare fields together selects the tunnel path.': 54,
  'Cloudflare service token ID': 55,
  'The Access service token client ID allowed to reach the SSH hostname.': 56,
  'Cloudflare service token secret': 57,
  'The matching service token secret. Leave empty to keep the stored one; re-enter when rotating it.': 58,
  'A bridge connection needs the SSH user.': 59,
  'Cloudflare also needs the token ID and secret.': 60,
  'Choose one bridge path: Cloudflare fields or a direct host — not both.': 61,
  // actions/bridgeSetup.ts
  'Screen Bridge Setup': 62,
  'Show the ssh public key to enroll on your computer host (Docker-remote). The bridge sidecar is what makes desktop view & control reach the StartOS box.': 63,
  'Screen bridge setup': 64,
  'The bridge key has not been generated yet. Start the Rakazo service once (any state works), then reopen this action.': 65,
  'On your computer host (sandbox), once:\n\n1. Append the line below to `~/.ssh/authorized_keys` of the ssh user — one single line, no wrapping.\n2. Give that user Docker access (`sudo usermod -aG docker <user>`, then re-login).\n3. In the supervisor compose file set `network_mode: host` on the supervisor service and recreate it (lets its checks/control reach the desktops it starts).\n4. If the host is only reachable through Cloudflare: add a dedicated ssh route to your tunnel ingress (`service: ssh://localhost:22`) and an Access service token allowed on it, then fill the Cloudflare fields in the Bot Computers action (ssh user too). Directly reachable hosts need only ssh user + host there.': 66,
  // main.ts — bridge daemon health
  'Screen bridge is running': 67,
  'Screen bridge is not running': 68,
  // init/seedFiles.ts
  'Choose the address Rakazo serves its web app on': 25,
} as const

export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
