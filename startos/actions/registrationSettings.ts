import { i18n } from '../i18n'
import { storeJson } from '../fileModels/store.json'
import { sdk } from '../sdk'

const { InputSpec, Value } = sdk

const inputSpec = InputSpec.of({
  signupsEnabled: Value.toggle({
    name: i18n('Allow new registrations'),
    description: i18n(
      'Leave on only until your owner account exists — the FIRST registered account becomes the owner. Turn off once you have signed up.',
    ),
    default: false as boolean,
  }),
  signupAllowlist: Value.text({
    name: i18n('Signup allowlist (emails, comma-separated)'),
    description: i18n(
      'Only these addresses may register while set. Empty keeps the list already stored. Requires registrations to stay enabled to matter.',
    ),
    placeholder: 'you@example.com, teammate@example.com',
    required: false,
    default: '',
  }),
})

export const registrationSettings = sdk.Action.withInput(
  'registration-settings',
  async () => ({
    name: i18n('Registration'),
    description: i18n('Open or close new account registration.'),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),
  inputSpec,
  async ({ effects }) => {
    const store = await storeJson
      .read((s) => ({
        signupsEnabled: s.signupsEnabled,
        signupAllowlist: s.signupAllowlist,
      }))
      .once()
    return {
      signupsEnabled: store?.signupsEnabled ?? false,
      signupAllowlist: store?.signupAllowlist ?? '',
    }
  },
  async ({ effects, input }) => {
    await storeJson.merge(effects, {
      signupsEnabled: Boolean(input.signupsEnabled),
      signupAllowlist: (input.signupAllowlist ?? '').trim(),
    })
  },
)
