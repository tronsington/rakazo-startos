# Updating the upstream version

Upstream (`elie222/rakazo`) publishes GHCR images on **every main build** under
`edge` and `sha-<full commit>` tags; `vX.Y.Z`/`latest` tags were planned but not
yet live as of v0.2.0. This package pins by **digest**, so the tag churn is
invisible to installs.

A bump is:

1. Pick the upstream release/commit.
2. Resolve the digest: `docker buildx imagetools inspect ghcr.io/elie222/rakazo/app:sha-<full-commit>` —
   take the top index `Digest:`, and confirm `Platform:` lists amd64+arm64.
3. Update `dockerTag` in `startos/manifest/index.ts`, the pin table in
   `README.md`, and `version` in `startos/versions/current.ts` (`A.B.C:0`).
4. Release notes: 5 locales in `current.ts`.
5. Check upstream's migrations for anything marked coordinated-cutover
   (there is one precedent, the 20260830 space-scope migration) and call it
   out loudly in the release notes before Dylan upgrades a live box.
6. Build + install on the test box; confirm prisma migrate deploy runs clean,
   health goes green, a fresh owner can register.
