// Shared between main.ts (daemon env) and backups.ts (withPgDump) so the two
// never disagree, same split as buzz-relay.
export const POSTGRES_PATH = '/var/lib/postgresql'
export const POSTGRES_DB = 'rakazo'
export const POSTGRES_USER = 'rakazo'

// Upstream ports (docker-compose.images.yml). All daemons share this
// package's network namespace, so they reach each other on 127.0.0.1.
export const API_PORT = 3100
export const WEB_PORT = 5173
