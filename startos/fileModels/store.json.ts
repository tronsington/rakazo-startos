import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

const shape = z.looseObject({
  // Internal secrets, auto-generated at install (init/seedFiles.ts). Never
  // re-rolled after creation: ENCRYPTION_KEY encrypts the credential store, so
  // rotating it = wiping saved provider keys; BETTER_AUTH_SECRET re-roll
  // invalidates all sessions.
  pgPassword: z.string().catch(''),
  betterAuthSecret: z.string().catch(''),
  encryptionKey: z.string().catch(''),
  screenProxySecret: z.string().catch(''),
  // The public origin the browser talks to (e.g. https://rakazo.example.com
  // or http://<box>.local:5173), chosen via the Set App Address action. Feeds
  // BETTER_AUTH_URL / WEB_ORIGIN / API_URL / RAKAZO_HOST — upstream binds
  // cookies and CORS to it, so changing it invalidates existing logins.
  chosenOrigin: z.string().optional().catch(undefined),
  // Whether brand-new accounts may register. Ships true at install so the
  // FIRST registered user can claim the owner seat (upstream's rule); flip
  // it off via the Registration action once the owner exists.
  signupsEnabled: z.boolean().catch(true),
  // Comma-separated email allowlist, applied by the API on every start when
  // non-empty (upstream behavior). Empty keeps the stored list.
  signupAllowlist: z.string().catch(''),
})

export const storeJson = FileHelper.json(
  { base: sdk.volumes.main, subpath: 'store.json' },
  shape,
)
