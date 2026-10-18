import { i18n } from '../i18n'
import { bridgePubkey } from '../fileModels/bridgeKey'
import { sdk } from '../sdk'

// Displays the bridge ssh public key as a locked-down authorized_keys line
// plus the sandbox-side setup checklist. With Docker-remote computers, the
// bridge is what makes the desktop view (and click/type control) work from
// here — without it bots run but their screens stay unreachable.

const LOCKDOWN_PREFIX =
  'restrict,no-pty,no-agent-forwarding,no-X11-forwarding,permitopen="127.0.0.1:*"'

export const bridgeSetup = sdk.Action.withoutInput(
  'bridge-setup',
  async () => ({
    name: i18n('Screen Bridge Setup'),
    description: i18n(
      'Show the ssh public key to enroll on your computer host (Docker-remote). The bridge sidecar is what makes desktop view & control reach the StartOS box.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),
  async ({ effects }) => {
    const pub = (await bridgePubkey.read().once())?.trim() ?? ''
    if (!pub) {
      return {
        version: '1' as const,
        title: i18n('Screen bridge setup'),
        message: i18n(
          'The bridge key has not been generated yet. Start the Rakazo service once (any state works), then reopen this action.',
        ),
        result: null,
      }
    }
    return {
      version: '1' as const,
      title: i18n('Screen bridge setup'),
      message: i18n(
        'On your computer host (sandbox), once:\n\n1. Append the line below to `~/.ssh/authorized_keys` of the ssh user — one single line, no wrapping.\n2. Give that user Docker access (`sudo usermod -aG docker <user>`, then re-login).\n3. In the supervisor compose file set `network_mode: host` on the supervisor service and recreate it (lets its checks/control reach the desktops it starts).\n4. If the host is only reachable through Cloudflare: add a dedicated ssh route to your tunnel ingress (`service: ssh://localhost:22`) and an Access service token allowed on it, then fill the Cloudflare fields in the Bot Computers action (ssh user too). Directly reachable hosts need only ssh user + host there.',
      ),
      result: {
        type: 'single' as const,
        value: `${LOCKDOWN_PREFIX} ${pub}`,
        copyable: true,
        qr: false,
        masked: false,
        launchable: false,
      },
    }
  },
)
