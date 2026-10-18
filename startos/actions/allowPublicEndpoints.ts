import { i18n } from '../i18n'
import { storeJson } from '../fileModels/store.json'
import { sdk } from '../sdk'

const { InputSpec, Value } = sdk

// Upstream refuses to add OpenAI-compatible model endpoints that resolve to
// public IPs unless RAKAZO_OPENAI_COMPAT_ALLOW_PUBLIC=1 is in the server env
// (data-leak protection: agent context goes to whatever endpoint is added).
// There is no in-app route for it, so this toggle is the package's interface.
// Private endpoints (localhost / RFC1918, e.g. an Ollama on the LAN) are
// never gated — users reaching for this should first check they don't simply
// need the private address.
const inputSpec = InputSpec.of({
  allowPublic: Value.toggle({
    name: i18n('Allow public model endpoints'),
    description: i18n(
      'Enable only if you add a hosted provider (OpenAI, OpenRouter, …). Everything an agent sends goes to the configured endpoint. Private endpoints on localhost or your LAN always work with this off.',
    ),
    default: false as boolean,
  }),
})

export const allowPublicEndpoints = sdk.Action.withInput(
  'allow-public-model-endpoints',
  async () => ({
    name: i18n('Model Providers'),
    description: i18n(
      'Upstream blocks public model endpoints by default. Toggle only if you use a hosted provider.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),
  inputSpec,
  async ({ effects }) => {
    const current = await storeJson
      .read((s) => s.allowPublicModelEndpoints)
      .once()
    return { allowPublic: current ?? false }
  },
  async ({ effects, input }) => {
    await storeJson.merge(effects, {
      allowPublicModelEndpoints: Boolean(input.allowPublic),
    })
  },
)
