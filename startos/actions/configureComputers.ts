import { i18n } from '../i18n'
import { storeJson } from '../fileModels/store.json'
import { sdk } from '../sdk'

const { InputSpec, Value } = sdk

// Bot-computer provider wiring. Upstream reads provider + credentials from
// server-side env ONLY (packages/adapters/src/sandbox-provider-env.ts —
// verified at the pinned commit): there is no in-app settings route, so this
// action is the package's interface to it. A remote provider with a missing
// key silently falls back to 'none' upstream, so we hard-require the key here
// instead of surfacing that as a confusing no-op.
const inputSpec = InputSpec.of({
  provider: Value.select({
    name: i18n('Provider'),
    description: i18n(
      'None runs Rakazo without bot computers. Docker expects your own supervisor on a separate Docker host; Createos/Box/Daytona accept a self-hosted control-plane URL; E2B is hosted only.',
    ),
    default: 'none',
    values: {
      none: 'None (no bot computers)',
      docker: 'Docker — remote host (via sandbox supervisor)',
      e2b: 'E2B (hosted)',
      daytona: 'Daytona (hosted or self-hosted)',
      box: 'Box (hosted or self-hosted)',
      createos: 'CreateOs (hosted or self-hosted)',
    },
  }),
  supervisorUrl: Value.text({
    name: i18n('Supervisor URL (Docker-remote only)'),
    description: i18n(
      'The sandbox supervisor running on your remote Docker host, e.g. http://192.168.x.x:7091. Access to it is equivalent to control of that Docker host — keep it on your LAN.',
    ),
    required: false,
    default: null,
    masked: false,
    placeholder: 'http://192.168.50.2:7091',
  }),
  supervisorToken: Value.text({
    name: i18n('Supervisor token (Docker-remote only)'),
    description: i18n(
      'The shared bearer token the supervisor on your remote host was started with (32+ characters). Re-enter only when rotating it.',
    ),
    required: false,
    default: null,
    masked: true,
    placeholder: null,
  }),
  apiKey: Value.text({
    name: i18n('API Key'),
    description: i18n(
      'Your provider API key. Required when switching away from None; re-enter only when rotating it.',
    ),
    required: false,
    default: null,
    masked: true,
    placeholder: null,
  }),
  apiUrl: Value.text({
    name: i18n('Control-plane URL (optional)'),
    description: i18n(
      'Self-hosters only: your own Daytona (DAYTONA_API_URL), Box (BOX_API_URL) or CreateOs (CREATEOS_SANDBOX_BASE_URL) endpoint. Leave empty for the hosted default.',
    ),
    required: false,
    default: null,
    masked: false,
    placeholder: 'https://daytona.example.com',
  }),
  daytonaTarget: Value.text({
    name: i18n('Daytona target (optional)'),
    description: i18n(
      'A Daytona target/region name. Leave empty for the provider default.',
    ),
    required: false,
    default: null,
    masked: false,
    placeholder: null,
  }),
  daytonaSnapshot: Value.text({
    name: i18n('Daytona snapshot (optional)'),
    description: i18n(
      'A Daytona snapshot name for the computer image. Leave empty for the provider default.',
    ),
    required: false,
    default: null,
    masked: false,
    placeholder: null,
  }),
})

export const configureComputers = sdk.Action.withInput(
  'configure-computers',
  async () => ({
    name: i18n('Bot Computers'),
    description: i18n(
      'Choose where bot computers run. Bots cannot reply until one is set — every conversation provisions a computer first. StartOS packages cannot run the local Docker supervisor (no host Docker socket), so pick a remote provider.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),
  inputSpec,
  async ({ effects }) => {
    const current = await storeJson.read((s) => s).once()
    return {
      provider: (current?.sandboxProvider ?? 'none') as
        | 'none'
        | 'docker'
        | 'e2b'
        | 'daytona'
        | 'box'
        | 'createos',
      apiKey: '',
      supervisorUrl: current?.sandboxSupervisorUrl ?? '',
      supervisorToken: '',
      apiUrl: current?.sandboxApiUrl ?? '',
      daytonaTarget: current?.daytonaTarget ?? '',
      daytonaSnapshot: current?.daytonaSnapshot ?? '',
    }
  },
  async ({ effects, input }) => {
    if (input.provider === 'none') {
      await storeJson.merge(effects, {
        sandboxProvider: 'none',
        sandboxApiKey: '',
        sandboxApiUrl: '',
        sandboxSupervisorUrl: '',
        sandboxSupervisorToken: '',
        daytonaTarget: '',
        daytonaSnapshot: '',
      })
      return
    }
    if (input.provider === 'docker') {
      // Remote-supervisor mode: URL + token, no provider API key. Upstream
      // silently downgrades to 'none' without the token, so require it.
      if (!input.supervisorUrl) {
        throw new Error(i18n('Docker-remote needs the supervisor URL.'))
      }
      const keepSecret = !input.supervisorToken
      const current = keepSecret
        ? await storeJson.read((s) => s.sandboxSupervisorToken).once()
        : null
      if (keepSecret && !current) {
        throw new Error(i18n('Docker-remote needs the supervisor token.'))
      }
      await storeJson.merge(effects, {
        sandboxProvider: 'docker',
        sandboxApiKey: '',
        sandboxApiUrl: '',
        sandboxSupervisorUrl: (input.supervisorUrl || '').replace(/\/+$/, ''),
        ...(keepSecret
          ? {}
          : { sandboxSupervisorToken: input.supervisorToken ?? '' }),
        daytonaTarget: '',
        daytonaSnapshot: '',
      })
      return
    }
    // Switching to (or re-keying) a real provider needs a key — upstream
    // silently boots 'none' without one, which reads as a broken package.
    const keepSecret = !input.apiKey
    const current = keepSecret
      ? await storeJson.read((s) => s.sandboxApiKey).once()
      : null
    if (keepSecret && !current) {
      throw new Error(i18n('A provider needs its API key.'))
    }
    // Empty string = unset (main.ts gates on truthy). Never pass an explicit
    // undefined through merge — DeepPartial reads it as "no change".
    await storeJson.merge(effects, {
      sandboxProvider: input.provider,
      ...(keepSecret ? {} : { sandboxApiKey: input.apiKey ?? '' }),
      sandboxApiUrl: input.apiUrl || '',
      sandboxSupervisorUrl: '',
      sandboxSupervisorToken: '',
      daytonaTarget: input.daytonaTarget || '',
      daytonaSnapshot: input.daytonaSnapshot || '',
    })
  },
)
