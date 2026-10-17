import { utils } from '@start9labs/start-sdk'
import { setOrigin } from '../actions/setOrigin'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

export const seedFiles = sdk.setupOnInit(async (effects, kind) => {
  if (kind !== 'install') return

  await storeJson.merge(effects, {
    pgPassword: utils.getDefaultString({ charset: 'a-z,A-Z,0-9', len: 22 }),
    betterAuthSecret: utils.getDefaultString({ charset: 'a-z,A-Z,0-9', len: 40 }),
    // 32 random bytes as hex, what upstream's env example expects.
    encryptionKey: utils.getDefaultString({ charset: '0-9,a-f', len: 64 }),
    screenProxySecret: utils.getDefaultString({ charset: 'a-z,A-Z,0-9', len: 40 }),
    signupsEnabled: true,
  })

  // Head of the setup chain: the api/web/auth env vars all derive from this
  // one answer, so the service cannot start meaningfully before it.
  await sdk.action.createOwnTask(effects, setOrigin, 'critical', {
    reason: i18n('Choose the address Rakazo serves its web app on'),
  })
})
