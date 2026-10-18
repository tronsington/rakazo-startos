# rakazo screen/control bridge — see bridge.sh header for the design.
# Local package image (no upstream equivalent exists); alpine base pinned
# by digest, multi-arch manifest list.
FROM alpine@sha256:d9e853e87e55526f6b2917df91a2115c36dd7c696a35be12163d44e6e2a4b6bc

# Client side of the Cloudflare-tunnel ssh path. Static binary, pinned by
# version and sha256 (recompute both hashes when bumping):
#   curl -sSfL -o cf https://github.com/cloudflare/cloudflared/releases/download/<v>/cloudflared-linux-<amd64|arm64> && sha256sum cf
# uname -m (not BuildKit's TARGETARCH) decides the arch so this builds under
# plain `docker build --platform` as well as buildx.
ARG CLOUDFLARED_VERSION=2026.10.1
ARG CLOUDFLARED_SHA256_AMD64=3bfc539f45d2620c71debb7a86be0efa737ed5ccbad9eb85c787116900e5c586
ARG CLOUDFLARED_SHA256_ARM64=2c65dfabf616c40efc7545d107d7a57ad5e21377e2964b7e88af19a238074a46

RUN apk add --no-cache openssh-client openssh-keygen jq ca-certificates \
  && adduser -D -u 1001 bridge

RUN set -e; \
  case "$(uname -m)" in \
    x86_64) CFARCH=amd64; SHA="$CLOUDFLARED_SHA256_AMD64" ;; \
    aarch64) CFARCH=arm64; SHA="$CLOUDFLARED_SHA256_ARM64" ;; \
    *) echo "unsupported arch: $(uname -m)" >&2; exit 1 ;; \
  esac; \
  wget -q -O /usr/local/bin/cloudflared \
    "https://github.com/cloudflare/cloudflared/releases/download/${CLOUDFLARED_VERSION}/cloudflared-linux-${CFARCH}"; \
  echo "${SHA}  /usr/local/bin/cloudflared" | sha256sum -c -; \
  chmod +x /usr/local/bin/cloudflared

COPY bridge.sh /usr/local/bin/bridge.sh
RUN chmod +x /usr/local/bin/bridge.sh

USER bridge
ENTRYPOINT ["/usr/local/bin/bridge.sh"]
