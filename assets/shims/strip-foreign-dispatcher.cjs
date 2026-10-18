'use strict';

// Preload shim for rakazo (NODE_OPTIONS="--require .../strip-foreign-dispatcher.cjs").
//
// Root cause (traced against rakazo @f10b4ffd3e4cc240742758932b74d511121bc641):
// pi-usage.ts wraps every openai-* transport in a usage-reporting closure that calls
// globalThis.fetch directly. pi-openai-compatible-provider.ts attaches a pinned-DNS
// undici Agent (its own SSRF guard) to `init.dispatcher` for any hostname-based base
// URL. undici-fetch.ts's pairing helper only recognizes the package's own fetch by
// identity, so the usage closure is treated as "unpaired" and the Agent gets handed to
// Node's built-in fetch, which rejects a dispatcher built by a different undici
// instance (UND_ERR_INVALID_ARG: invalid onRequestStart method). Net effect: every bot
// run against a hostname-based OpenAI-compatible endpoint fails at run time even though
// the credential save/probe path (which never attaches a dispatcher) works fine.
//
// Fix: strip `dispatcher` from `init` before it reaches Node's real fetch. This is safe
// for endpoints we control, but note the tradeoff: it also removes the SSRF guard's
// DNS-rebinding protection for the openai-compatible lane. Do not keep this patch once
// upstream pairs the usage-reporting closure correctly.

if (!globalThis.__RAKAZO_STRIP_FOREIGN_DISPATCHER__) {
  globalThis.__RAKAZO_STRIP_FOREIGN_DISPATCHER__ = true;

  const originalFetch = globalThis.fetch;

  if (typeof originalFetch === 'function') {
    const strippedFetch = function fetch(input, init) {
      if (init && Object.prototype.hasOwnProperty.call(init, 'dispatcher')) {
        const rest = Object.assign({}, init);
        delete rest.dispatcher;
        init = rest;
      }
      return originalFetch.call(this, input, init);
    };

    Object.setPrototypeOf(strippedFetch, Object.getPrototypeOf(originalFetch));
    Object.defineProperty(strippedFetch, 'name', { value: originalFetch.name, configurable: true });
    globalThis.fetch = strippedFetch;
  }
}
