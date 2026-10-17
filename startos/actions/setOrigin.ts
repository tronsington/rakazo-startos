import { getRakazoOrigins } from '../interfaces'
import { i18n } from '../i18n'
import { storeJson } from '../fileModels/store.json'
import { sdk } from '../sdk'

const { InputSpec, Value } = sdk

const inputSpec = InputSpec.of({
  origin: Value.dynamicSelect(async ({ effects }) => {
    const origins = await getRakazoOrigins(effects)
    return {
      name: i18n('App Address/URL'),
      description: origins.length
        ? i18n(
            'The address your browser will use to reach Rakazo. Cookies and CORS bind to it, so existing logins are invalidated if you change it later.',
          )
        : i18n(
            'No domain is switched on for the Rakazo interface yet. Add one under Interfaces and switch it on there first.',
          ),
      warning: null,
      values: origins.reduce(
        (obj: Record<string, string>, url: string) => ({ ...obj, [url]: url }),
        {},
      ),
      default: null,
    }
  }),
})

export const setOrigin = sdk.Action.withInput(
  'set-origin',
  async () => ({
    name: i18n('Set App Address'),
    description: i18n('Choose the address Rakazo serves its web app on.'),
    warning: i18n(
      'Cookies and CORS bind to this address. Changing it later invalidates every existing login. A public domain makes the app reachable from the internet (with TLS handled for you); a private domain keeps it on your LAN/VPN.',
    ),
    allowedStatuses: 'only-stopped',
    group: null,
    visibility: 'hidden',
  }),
  inputSpec,
  async () => ({}),
  async ({ effects, input }) => {
    await storeJson.merge(effects, { chosenOrigin: input.origin })
  },
)
