import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.2.0:2',
  releaseNotes: {
    en_US:
      'Adds a Model Providers action: a toggle for upstream’s public-endpoint gate (RAKAZO_OPENAI_COMPAT_ALLOW_PUBLIC). Enable only when adding a hosted provider — endpoints on localhost or your LAN have never needed it. Default stays blocked.',
    es_ES:
      'Añade la acción «Proveedores de modelos»: un conmutador para el bloqueo upstream de endpoints públicos (RAKAZO_OPENAI_COMPAT_ALLOW_PUBLIC). Actívalo solo al añadir un proveedor alojado — los endpoints en localhost o en tu LAN nunca lo han necesitado. El valor por defecto sigue bloqueado.',
    de_DE:
      'Fügt die Aktion „Modell-Anbieter" hinzu: ein Schalter für Upstreams Sperre öffentlicher Endpunkte (RAKAZO_OPENAI_COMPAT_ALLOW_PUBLIC). Nur aktivieren, wenn ein gehosteter Anbieter hinzugefügt wird — Endpunkte auf localhost oder im LAN brauchten das nie. Standard bleibt gesperrt.',
    pl_PL:
      'Dodaje akcję „Dostawcy modeli”: przełącznik blokady upstream publicznych punktów końcowych (RAKAZO_OPENAI_COMPAT_ALLOW_PUBLIC). Włącz tylko przy dodawaniu dostawcy hostowanego — punkty końcowe na localhost lub w LAN nigdy tego nie wymagały. Domyślnie nadal zablokowane.',
    fr_FR:
      'Ajoute l’action « Fournisseurs de modèles » : un interrupteur pour le blocage upstream des points de terminaison publics (RAKAZO_OPENAI_COMPAT_ALLOW_PUBLIC). À activer uniquement pour ajouter un fournisseur hébergé — les points de terminaison sur localhost ou votre LAN n’en ont jamais eu besoin. Le défaut reste bloqué.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
