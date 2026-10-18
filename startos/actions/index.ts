import { sdk } from '../sdk'
import { setOrigin } from './setOrigin'
import { registrationSettings } from './registrationSettings'
import { configureComputers } from './configureComputers'
import { allowPublicEndpoints } from './allowPublicEndpoints'

export const actions = sdk.Actions.of()
  .addAction(setOrigin)
  .addAction(registrationSettings)
  .addAction(configureComputers)
  .addAction(allowPublicEndpoints)
