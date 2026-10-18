import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.2.0:2',
  releaseNotes: {
    en_US:
      'Adds a Model Providers action: a toggle for upstream’s public-endpoint gate (RAKAZO_OPENAI_COMPAT_ALLOW_PUBLIC). Enable only when adding a hosted provider — endpoints on localhost or your LAN have never needed it. Default stays blocked. The Bot Computers action gains a Docker-remote option: point it at the sandbox supervisor (upstream’s supervisor service) running on a separate Docker host, via URL + shared token. Also corrects the install instructions and Bot Computers action text: bots cannot converse until a computer provider is connected (the earlier wording wrongly implied chat worked without one); bots already created self-heal once a provider is set.',
    es_ES:
      'Añade la acción «Proveedores de modelos»: un conmutador para el bloqueo upstream de endpoints públicos (RAKAZO_OPENAI_COMPAT_ALLOW_PUBLIC). Actívalo solo al añadir un proveedor alojado — los endpoints en localhost o en tu LAN nunca lo han necesitado. El valor por defecto sigue bloqueado. La acción Computadores bot gana la opción Docker-remoto: apunta al supervisor de sandbox (el servicio supervisor de upstream) ejecutándose en un host Docker aparte, con URL + token compartido. Además corrige las instrucciones de instalación y el texto de la acción Computadores bot: los bots no pueden conversar hasta conectar un proveedor de computadores (el texto anterior insinuaba erróneamente que el chat funcionaba sin él); los bots ya creados se recuperan solos una vez configurado un proveedor.',
    de_DE:
      'Fügt die Aktion „Modell-Anbieter" hinzu: ein Schalter für Upstreams Sperre öffentlicher Endpunkte (RAKAZO_OPENAI_COMPAT_ALLOW_PUBLIC). Nur aktivieren, wenn ein gehosteter Anbieter hinzugefügt wird — Endpunkte auf localhost oder im LAN brauchten das nie. Standard bleibt gesperrt. Die Aktion „Bot-Computer" bekommt die Option Docker-Remote: zeige auf den Sandbox-Supervisor (Upstreams Supervisor-Dienst) auf einem separaten Docker-Host, mit URL + geteiltem Token. Korrigiert außerdem die Installationsanleitung und den Text der Aktion „Bot-Computer": Bots können erst nach dem Verbinden eines Computer-Providers antworten (der alte Text suggerierte fälschlich, Chat funktioniere auch ohne); bereits erstellte Bots heilen selbst, sobald ein Provider gesetzt ist.',
    pl_PL:
      'Dodaje akcję „Dostawcy modeli”: przełącznik blokady upstream publicznych punktów końcowych (RAKAZO_OPENAI_COMPAT_ALLOW_PUBLIC). Włącz tylko przy dodawaniu dostawcy hostowanego — punkty końcowe na localhost lub w LAN nigdy tego nie wymagały. Domyślnie nadal zablokowane. Akcja „Komputery botów” zyskuje opcję Docker-zdalny: wskaż nadzorcę sandboxów (usługę supervisor upstream) działającą na osobnym hoście Docker, z URL + współdzielonym tokenem. Poprawia też instrukcje instalacji i tekst akcji „Komputery botów”: boty nie mogą rozmawiać, dopóki nie podłączysz dostawcy komputerów (wcześniejszy tekst błędnie sugerował, że czat działa bez niego); istniejące boty naprawią się same po ustawieniu dostawcy.',
    fr_FR:
      'Ajoute l’action « Fournisseurs de modèles » : un interrupteur pour le blocage upstream des points de terminaison publics (RAKAZO_OPENAI_COMPAT_ALLOW_PUBLIC). À activer uniquement pour ajouter un fournisseur hébergé — les points de terminaison sur localhost ou votre LAN n’en ont jamais eu besoin. Le défaut reste bloqué. L’action « Ordinateurs bot » gagne l’option Docker distant : pointez vers le superviseur de sandbox (service superviseur upstream) tournant sur un hôte Docker distinct, avec URL + jeton partagé. Corrige aussi les instructions d’installation et le texte de l’action « Ordinateurs bot » : les bots ne peuvent pas converser tant qu’aucun fournisseur d’ordinateurs n’est connecté (le texte précédent laissait croire à tort que le chat fonctionnait sans) ; les bots déjà créés se réparent d’eux-mêmes une fois un fournisseur défini.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
