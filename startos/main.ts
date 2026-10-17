import { i18n } from './i18n'
import { sdk } from './sdk'
import { storeJson } from './fileModels/store.json'
import {
  API_PORT,
  POSTGRES_DB,
  POSTGRES_PATH,
  POSTGRES_USER,
  WEB_PORT,
} from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting Rakazo'))

  // Mapped read: only the fields feeding daemon env, so any unrelated store
  // change never bounces the daemon graph (relay package precedent).
  const store = await storeJson
    .read((s) => ({
      pgPassword: s.pgPassword,
      betterAuthSecret: s.betterAuthSecret,
      encryptionKey: s.encryptionKey,
      screenProxySecret: s.screenProxySecret,
      chosenOrigin: s.chosenOrigin,
      signupsEnabled: s.signupsEnabled,
      signupAllowlist: s.signupAllowlist,
    }))
    .const(effects)

  const pgPassword = store?.pgPassword ?? ''
  const betterAuthSecret = store?.betterAuthSecret ?? ''
  const encryptionKey = store?.encryptionKey ?? ''
  const screenProxySecret = store?.screenProxySecret ?? ''
  const signupsEnabled = store?.signupsEnabled ?? true
  const signupAllowlist = store?.signupAllowlist ?? ''

  // Every origin-bound env var derives from the one answer in Set App
  // Address. Empty while unset: the critical task raised at install drives
  // the user there before first start.
  const origin = store?.chosenOrigin ?? ''
  const originHost = origin ? new URL(origin).hostname : ''

  const databaseUrl = `postgres://${POSTGRES_USER}:${pgPassword}@127.0.0.1:5432/${POSTGRES_DB}`

  /**
   * ======================== PostgreSQL sidecar ========================
   * Dedicated to this package; loopback only. pg 16 digest-pinned in the
   * manifest to the same sha upstream's compose uses.
   */
  const postgresSub = sdk.SubContainer.of(
    effects,
    { imageId: 'postgres' },
    sdk.Mounts.of().mountVolume({
      volumeId: 'pgdata',
      subpath: null,
      mountpoint: POSTGRES_PATH,
      readonly: false,
    }),
    'postgres',
  )

  /**
   * ======================== Rakazo app image subcontainers ========================
   * api / worker / web each run their own pnpm target from the one app image
   * (upstream's docker-compose.images.yml split), against the shared DATA_DIR.
   */
  const apiSub = sdk.SubContainer.of(
    effects,
    { imageId: 'rakazo' },
    sdk.Mounts.of().mountVolume({
      volumeId: 'data',
      subpath: null,
      mountpoint: '/data',
      readonly: false,
    }),
    'rakazo-api',
  )
  const workerSub = sdk.SubContainer.of(
    effects,
    { imageId: 'rakazo' },
    sdk.Mounts.of().mountVolume({
      volumeId: 'data',
      subpath: null,
      mountpoint: '/data',
      readonly: false,
    }),
    'rakazo-worker',
  )
  const webSub = sdk.SubContainer.of(
    effects,
    { imageId: 'rakazo' },
    sdk.Mounts.of(),
    'rakazo-web',
  )
  // The oneshot runs chown as root inside its own subcontainer of the
  // busybox image — same "explicit chown, no idmap" shape as relay's
  // chown-git (an idmap mount was tried there and did not work).
  const chownDataSub = sdk.SubContainer.of(
    effects,
    { imageId: 'busybox' },
    sdk.Mounts.of().mountVolume({
      volumeId: 'data',
      subpath: null,
      mountpoint: '/data',
      readonly: false,
    }),
    'chown-data',
  )

  return (
    sdk.Daemons.of(effects)
      // Upstream pattern: StartOS volume storage shadows baked-in ownership,
      // so /data gets chowned to the image's node user (uid 1000) once, before
      // any app daemon touches it.
      .addOneshot('chown-data', {
        subcontainer: chownDataSub,
        exec: {
          command: ['chown', '-R', '1000:1000', '/data'],
          user: 'root',
        },
        requires: [],
      })
      .addDaemon('postgres', {
        subcontainer: postgresSub,
        exec: {
          command: sdk.useEntrypoint(['-c', 'listen_addresses=127.0.0.1']),
          env: {
            POSTGRES_DB,
            POSTGRES_USER,
            POSTGRES_PASSWORD: pgPassword,
          },
        },
        ready: {
          display: null, // internal sidecar
          fn: async () => {
            const result = await postgresSub.exec([
              'pg_isready',
              '-q',
              '-h',
              '127.0.0.1',
              '-U',
              POSTGRES_USER,
              '-d',
              POSTGRES_DB,
            ])
            return result.exitCode === 0
              ? { result: 'success', message: i18n('PostgreSQL is ready') }
              : {
                  result: 'starting',
                  message: i18n('Waiting for PostgreSQL to be ready'),
                }
          },
          gracePeriod: 30_000,
        },
        requires: [],
      })
      .addDaemon('api', {
        subcontainer: apiSub,
        exec: {
          // Upstream start chain: migrations are the upgrade gate — a failed
          // prisma migrate deploy keeps this daemon (and thus everything
          // downstream) unhealthy instead of half-migrating the schema.
          command: [
            'bash',
            '-lc',
            'pnpm --filter @rakazo/db exec prisma migrate deploy && pnpm --filter @rakazo/api start',
          ],
          env: {
            NODE_ENV: 'production',
            API_HOST: '0.0.0.0',
            SECRET_STORE: 'encrypted',
            BETTER_AUTH_SECRET: betterAuthSecret,
            ENCRYPTION_KEY: encryptionKey,
            SCREEN_PROXY_SECRET: screenProxySecret,
            POSTGRES_USER,
            POSTGRES_PASSWORD: pgPassword,
            POSTGRES_DB,
            DATABASE_URL: databaseUrl,
            DATA_DIR: '/data',
            // v1: no bot computers. Upstream's NoneSandboxProvider boots the
            // product without a computer host (packages/adapters/src/
            // none-sandbox.ts); remote providers come through the UI/API
            // keys, not this env.
            SANDBOX_PROVIDER: 'none',
            CLOUD_AGENT_PROVIDER: 'none',
            WAKEUP_DRIVER: 'graphile',
            AGENT_RUNTIME: 'pi',
            AUTH_PASSWORD_ENABLED: 'true',
            BETTER_AUTH_URL: origin,
            WEB_ORIGIN: origin,
            API_URL: origin,
            RAKAZO_HOST: originHost,
            SIGNUPS_ENABLED: signupsEnabled ? 'true' : 'false',
            SIGNUP_ALLOWLIST: signupAllowlist,
            LOG_LEVEL: 'info',
          },
        },
        ready: {
          display: i18n('API'),
          fn: () =>
            sdk.healthCheck.checkWebUrl(
              effects,
              `http://127.0.0.1:${API_PORT}/health`,
              {
                successMessage: i18n('API is ready'),
                errorMessage: i18n('API is not ready'),
              },
            ),
          // First boot runs prisma migrate deploy before it serves.
          gracePeriod: 120_000,
        },
        requires: ['postgres', 'chown-data'],
      })
      .addDaemon('worker', {
        subcontainer: workerSub,
        exec: {
          command: ['pnpm', '--filter', '@rakazo/worker', 'start'],
          env: {
            NODE_ENV: 'production',
            SECRET_STORE: 'encrypted',
            // Upstream compose deliberately blanks these two in the worker
            // (environment block overrides env_file) — mirrored, not a typo.
            BETTER_AUTH_SECRET: '',
            SCREEN_PROXY_SECRET: '',
            ENCRYPTION_KEY: encryptionKey,
            AUTH_PASSWORD_ENABLED: 'true',
            DATABASE_URL: databaseUrl,
            DATA_DIR: '/data',
            SANDBOX_PROVIDER: 'none',
            CLOUD_AGENT_PROVIDER: 'none',
            WAKEUP_DRIVER: 'graphile',
            AGENT_RUNTIME: 'pi',
            LOG_LEVEL: 'info',
          },
        },
        ready: {
          display: null, // internal worker, no port of its own
          fn: async () => {
            const result = await workerSub.exec([
              'pgrep',
              '-f',
              '@rakazo/worker',
            ])
            return result.exitCode === 0
              ? { result: 'success', message: i18n('Worker is running') }
              : { result: 'failure', message: i18n('Worker is not running') }
          },
          gracePeriod: 30_000,
        },
        requires: ['api', 'chown-data'],
      })
      .addDaemon('web', {
        subcontainer: webSub,
        exec: {
          command: [
            'pnpm',
            '--filter',
            '@rakazo/web',
            'preview',
            '--host',
            '0.0.0.0',
            '--port',
            String(WEB_PORT),
          ],
          env: {
            NODE_ENV: 'production',
            API_PROXY_TARGET: `http://127.0.0.1:${API_PORT}`,
            RAKAZO_HOST: originHost,
            SCREEN_PROXY_SECRET: screenProxySecret,
          },
        },
        ready: {
          display: i18n('Web Interface'),
          fn: () =>
            sdk.healthCheck.checkPortListening(effects, WEB_PORT, {
              successMessage: i18n('The web interface is ready'),
              errorMessage: i18n('The web interface is not ready'),
            }),
          gracePeriod: 30_000,
        },
        requires: ['api'],
      })
  )
})
