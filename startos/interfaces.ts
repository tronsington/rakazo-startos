import { T } from '@start9labs/start-sdk'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { WEB_PORT } from './utils'

// One host, one binding, one interface — the web app on WEB_PORT, which
// same-origin proxies /api and /rpc to the API daemon. Adding a second
// binding would trip StartOS's public-domain isolation (a public domain is
// auto-disabled on every sibling of the binding it was added to).
export const hostId = 'rakazo'
export const webInterfaceId = 'web'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  const multi = sdk.MultiHost.of(effects, hostId)
  const origin = await multi.bindPort(WEB_PORT, {
    protocol: 'http',
    preferredExternalPort: WEB_PORT,
  })

  const web = sdk.createInterface(effects, {
    name: i18n('Rakazo'),
    id: webInterfaceId,
    description: i18n('Rakazo web app — chat with and manage your AI teammates'),
    type: 'ui',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
  })

  return [await origin.export([web])]
})

// Domains (public or private) PLUS plugin-provided hostnames — the
// Cloudflare-Tunnel-fronted case that bit the relay package (kind 'plugin',
// fixed 2026-10-16). buzz desktop binds cookies/CORS to the chosen origin, so
// the choice matters at first start; the selection list never shows an
// address the interface isn't serving (switched-off domains excluded).
export function getRakazoOrigins(effects: T.Effects): Promise<string[]> {
  return sdk.host
    .getOwn(effects, hostId, (host) => {
      const iface =
        host &&
        Object.values(host.bindings)
          .flatMap((b) => Object.values(b.interfaces))
          .find((i) => i.id === webInterfaceId)
      return iface
        ? iface.addressInfo
            .matchesAny([{ kind: 'domain' }, { kind: 'plugin' }])
            .format()
        : []
    })
    .once()
}
