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
      'None runs Rakazo without bot computers. Createos/Box/Daytona accept a self-hosted control-plane URL; E2B is hosted only.',
    ),
    default: 'none',
    values: {
      none: 'None (no bot computers)',
      e2b: 'E2B (hosted)',
      daytona: 'Daytona (hosted or self-hosted)',
      box: 'Box (hosted or self-hosted)',
      createos: 'CreateOs (hosted or self-hosted)',
    },
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
        | 'e2b'
        | 'daytona'
        | 'box'
        | 'createos',
      apiKey: '',
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
      daytonaTarget: input.daytonaTarget || '',
      daytonaSnapshot: input.daytonaSnapshot || '',
    })
  },
)
