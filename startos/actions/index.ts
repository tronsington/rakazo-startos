import { sdk } from '../sdk'
import { setOrigin } from './setOrigin'
import { registrationSettings } from './registrationSettings'

export const actions = sdk.Actions.of()
  .addAction(setOrigin)
  .addAction(registrationSettings)
