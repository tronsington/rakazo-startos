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
  'Choose where bot computers run. StartOS packages cannot run the local Docker supervisor (no host Docker socket), so pick a remote provider — or leave at None to run without computers.': 27,
  Provider: 28,
  'None runs Rakazo without bot computers. Createos/Box/Daytona accept a self-hosted control-plane URL; E2B is hosted only.': 29,
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
  // init/seedFiles.ts
  'Choose the address Rakazo serves its web app on': 25,
} as const

export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
