import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.2.0:0',
  releaseNotes: {
    en_US:
      'Initial StartOS package of Rakazo v0.2.0 (upstream commit f10b4ffd, digest-pinned). Runs the API, worker and web UI with an internal Postgres; bot computers are disabled in this version (SANDBOX_PROVIDER=none) since StartOS containers cannot reach the host Docker socket — remote providers (E2B/Daytona/Box) still work through in-app settings.',
    es_ES:
      'Paquete inicial para StartOS de Rakazo v0.2.0 (commit f10b4ffd, fijado por digest). Ejecuta la API, el worker y la interfaz web con un Postgres interno; los «ordenadores» bot están desactivados en esta versión (SANDBOX_PROVIDER=none) porque un contenedor de StartOS no puede alcanzar el socket Docker del host — los proveedores remotos (E2B/Daytona/Box) siguen disponibles desde la configuración de la app.',
    de_DE:
      'Erstes StartOS-Paket für Rakazo v0.2.0 (Upstream-Commit f10b4ffd, per Digest angepinnt). Startet API, Worker und Web-UI mit internem Postgres; Bot-Computer sind in dieser Version deaktiviert (SANDBOX_PROVIDER=none), da StartOS-Container den Docker-Socket des Hosts nicht erreichen können — Remote-Provider (E2B/Daytona/Box) funktionieren weiterhin über die App-Einstellungen.',
    pl_PL:
      'Pierwszy pakiet StartOS dla Rakazo v0.2.0 (commit upstream f10b4ffd, przypięty po digeście). Uruchamia API, workera i interfejs web z wewnętrznym Postgresem; bot-„komputery" są w tej wersji wyłączone (SANDBOX_PROVIDER=none), ponieważ kontener StartOS nie ma dostępu do gniazda Docker hosta — zdalni dostawcy (E2B/Daytona/Box) nadal działają przez ustawienia aplikacji.',
    fr_FR:
      "Premier paquet StartOS pour Rakazo v0.2.0 (commit amont f10b4ffd, épinglé par digest). Lance l'API, le worker et l'interface web avec un Postgres interne ; les « ordinateurs » bot sont désactivés dans cette version (SANDBOX_PROVIDER=none) car un conteneur StartOS ne peut pas atteindre le socket Docker de l'hôte — les fournisseurs distants (E2B/Daytona/Box) restent utilisables via les paramètres de l'app.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
