import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.2.0:1',
  releaseNotes: {
    en_US:
      'Adds the Bot Computers action: connect a remote computer provider (E2B, Daytona, Box or CreateOs) with its API key — and a self-hosted control-plane URL for Daytona/Box/CreateOs — without reinstalling. Upstream reads these from server-side environment only. Default stays "no computers". Also corrects the initial release notes, which wrongly said remote providers were set inside the app.',
    es_ES:
      'Añade la acción «Computadores bot»: conecta un proveedor remoto de computadores (E2B, Daytona, Box o CreateOs) con su clave de API — y una URL de plano de control autoalojada para Daytona/Box/CreateOs — sin reinstalar. Upstream los lee solo desde variables de entorno del servidor. El valor por defecto sigue siendo «sin computadores». También corrige las notas de la versión inicial, que decían erróneamente que los proveedores remotos se configuraban dentro de la app.',
    de_DE:
      'Fügt die Aktion „Bot-Computer“ hinzu: verbinde einen Remote-Computer-Provider (E2B, Daytona, Box oder CreateOs) mit seinem API-Schlüssel — und für Daytona/Box/CreateOs einer selbst gehosteten Control-Plane-URL — ohne Neuinstallation. Upstream liest diese ausschließlich aus Server-Umgebungsvariablen. Standard bleibt „keine Computer“. Korrigiert außerdem die ursprünglichen Versionshinweise, die fälschlich behaupteten, Remote-Provider würden in der App eingestellt.',
    pl_PL:
      'Dodaje akcję „Komputery botów”: połącz zdalnego dostawcę komputerów (E2B, Daytona, Box lub CreateOs) z jego kluczem API — a dla Daytona/Box/CreateOs także samohostowany URL warstwy sterowania — bez reinstalacji. Upstream odczytuje te wartości wyłącznie ze zmiennych środowiskowych serwera. Domyślnie nadal „bez komputerów”. Poprawia też notatki pierwszej wersji, które błędnie twierdziły, że zdalnych dostawców ustawia się w aplikacji.',
    fr_FR:
      'Ajoute l’action « Ordinateurs bot » : connectez un fournisseur distant d’ordinateurs (E2B, Daytona, Box ou CreateOs) avec sa clé API — et une URL de plan de contrôle auto-hébergée pour Daytona/Box/CreateOs — sans réinstaller. Upstream lit ces valeurs uniquement depuis l’environnement côté serveur. Le défaut reste « sans ordinateurs ». Corrige aussi les notes de la version initiale, qui indiquaient à tort que les fournisseurs distants se réglaient dans l’app.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
