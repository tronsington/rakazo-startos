import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.2.0:4',
  releaseNotes: {
    en_US:
      'Fixes the screen bridge container exiting seconds after start in Cloudflare-tunnel mode (an uninitialized variable crashed the daemon on its first scan, before any forward could be established). No configuration changes — if v0.2.0-3 was installed, simply update and restart; the same enrolled ssh key keeps working.',
    es_ES:
      'Corrige el cierre del contenedor del puente de pantalla segundos después de iniciar en modo túnel Cloudflare (una variable sin inicializar hacía fallar el daemon en su primer escaneo, antes de establecer cualquier reenvío). Sin cambios de configuración: si se instaló v0.2.0-3, basta actualizar y reiniciar; la misma clave ssh enrolada sigue funcionando.',
    de_DE:
      'Behebt, dass der Screen-Bridge-Container im Cloudflare-Tunnel-Modus Sekunden nach dem Start abbrach (eine nicht initialisierte Variable ließ den Daemon beim ersten Scan abstürzen, noch bevor ein Forward aufgebaut werden konnte). Keine Konfigurationsänderungen — wenn v0.2.0-3 installiert war, genügen Update und Neustart; der bereits eingetragene ssh-Schlüssel bleibt gültig.',
    pl_PL:
      'Naprawia wyłączanie się kontenera mostka ekranowego kilka sekund po starcie w trybie tunelu Cloudflare (niezainicjowana zmienna powodowała awarię daemona przy pierwszym skanie, zanim powstało jakiekolwiek przekierowanie). Bez zmian konfiguracji — jeśli zainstalowano v0.2.0-3, wystarczy aktualizacja i restart; ta sama zapisana klucza ssh pozostaje ważna.',
    fr_FR:
      'Corrige l’arrêt du conteneur du pont d’écran quelques secondes après le démarrage en mode tunnel Cloudflare (une variable non initialisée faisait planter le daemon dès son premier balayage, avant tout établissement de redirection). Aucun changement de configuration — si v0.2.0-3 était installé, il suffit de mettre à jour et redémarrer ; la même clé ssh enrôlée reste valide.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
