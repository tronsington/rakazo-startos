import { FileHelper } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

// The screen bridge's ssh keypair lives on the bridge volume (RW there,
// nowhere else). The bridge daemon generates it at first start; the Screen
// Bridge Setup action reads the .pub half to display the authorized_keys
// line. Read of a not-yet-generated file resolves null.
export const bridgePubkey = FileHelper.string({
  base: sdk.volumes.bridge,
  subpath: 'bridge_key.pub',
})
