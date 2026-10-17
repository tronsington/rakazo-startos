import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'rakazo',
  title: 'Rakazo',
  license: 'Apache-2.0', // matches upstream elie222/rakazo
  packageRepo: 'https://github.com/tronsington/rakazo-startos',
  upstreamRepo: 'https://github.com/elie222/rakazo',
  marketingUrl: 'https://rakazo.com',
  donationUrl: null,
  description: { short, long },
  // pgdata = Postgres cluster; data = app uploads/workspace (upstream
  // appdata); main = this package's own store.json (secrets). Do not
  // co-locate: backups.ts dumps pgdata logically via withPgDump.
  volumes: ['pgdata', 'data', 'main'],
  images: {
    // ghcr.io/elie222/rakazo/app v0.2.0 (commit f10b4ffd), pinned by digest.
    // Upstream publishes no semver image tags yet — per-commit sha-* tags only;
    // a digest survives even a re-pushed tag. Verified amd64+arm64 (index).
    rakazo: {
      source: {
        dockerTag:
          'ghcr.io/elie222/rakazo/app@sha256:8b4fd589bc42d435dae95fe7235910db381bade197c8e8bd20fc5a4e3f54c49b',
      },
      arch: ['x86_64', 'aarch64'],
    },
    // Same postgres:16 digest upstream's compose pins (docker-compose.images.yml).
    postgres: {
      source: {
        dockerTag:
          'postgres:16@sha256:e17e86066e5ef83e0952a9347f5c792b7ece00972e2aa787a6986f471b3dd3d5',
      },
      arch: ['x86_64', 'aarch64'],
    },
    // chown oneshot only. busybox:1's index digest, resolved 2026-10-17.
    busybox: {
      source: {
        dockerTag:
          'busybox:1@sha256:fd7dc98638c8e305f4dc34e979f1c0fdfdcaeb0fbf8fcff77ae834b6da3d7e6e',
      },
      arch: ['x86_64', 'aarch64'],
    },
    // Deliberately NOT packaged in v1: ghcr.io/elie222/rakazo/computer (bot
    // desktops need host docker.sock, impossible in a StartOS container) and
    // ghcr.io/elie222/rakazo/updater (StartOS owns updates).
  },
  // Compose ceiling is ~6 GB (pg 2g + api 1.5g + worker 2g + web .5g); real
  // steady state is far lower and limits are not reservations. 4 GiB minimum.
  hardwareRequirements: {
    ram: 4 * 1024 ** 3,
  },
})
