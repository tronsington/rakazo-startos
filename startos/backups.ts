import { storeJson } from './fileModels/store.json'
import { sdk } from './sdk'
import { POSTGRES_DB, POSTGRES_PATH, POSTGRES_USER } from './utils'

// Logical pg_dump over the pgdata volume (survives Postgres minor bumps) +
// raw copies of the app data volume, the package's own main volume (the
// store.json with the auth/encryption secrets — losing main on restore would
// rotate ENCRYPTION_KEY out from under the credential store), and the tiny
// bridge volume (its ssh keypair — losing it means re-enrolling a fresh key
// on the computer host after every restore).
export const { createBackup, restoreInit } = sdk.setupBackups(async () =>
  sdk.Backups.withPgDump({
    imageId: 'postgres',
    dbVolume: 'pgdata',
    mountpoint: POSTGRES_PATH,
    pgdataPath: '/data',
    database: POSTGRES_DB,
    user: POSTGRES_USER,
    password: async () => {
      const password = await storeJson.read((s) => s.pgPassword).once()
      if (!password) throw new Error('No pgPassword found in store.json')
      return password
    },
  })
    .addVolume('data')
    .addVolume('main')
    .addVolume('bridge'),
)
