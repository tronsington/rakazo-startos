#!/bin/sh
# bridge.sh — rakazo screen/control bridge
#
# Why this exists: rakazo's sandbox supervisor publishes each bot computer's
# noVNC (6080) and control (7070) ports on the SANDBOX host's loopback at
# ephemeral ports (upstream computer-spec.ts: HostIp 127.0.0.1), and the app
# seals 127.0.0.1:<port> screen URLs for the web service to dial. On a StartOS
# box that loopback is unreachable. This daemon discovers bot containers on
# the sandbox over SSH (docker ps via the rakazo.botId label) and republishes
# those same ports here, forwarded over one ssh ControlMaster connection.
#
# Every daemon in this package shares one network namespace, so the web
# service's dial to 127.0.0.1:<port> lands on this bridge unchanged — no
# app-side rewrite needed. The sandbox-side supervisor runs with
# network_mode: host (one-line compose edit, see instructions.md) so its
# readiness probe and control dials hit the real sandbox loopback natively.
#
# Two connection modes:
#   cf     — SSH over a Cloudflare tunnel: this bridge runs `cloudflared
#            access tcp` to a dedicated ssh hostname with an Access service
#            token, then ssh to the local relay port. For hosts only reachable
#            through Cloudflare.
#   direct — ssh to a user@host this server can reach (LAN/VPN), port 22.
# Neither configured (or no ssh user) => key still generated, then idle.
set -u

BRIDGE_VOL="${BRIDGE_VOL:-/bridge}"
SSH_KEY="${SSH_KEY:-$BRIDGE_VOL/bridge_key}"
LABEL_FILTER="${LABEL_FILTER:-rakazo.botId}"
SCAN_SECS="${SCAN_SECS:-3}"
CF_LOCAL_PORT=6222
CTL="${SSH_CTL:-/tmp/bridge.ctl}"
STATE="/tmp/bridge.state"
CF_LOG="/tmp/cloudflared.log"
# Initialized here (set -u): proxy_alive runs before the first spawn, and the
# restart check in ensure_proxy reads it on every round.
CF_PID=""

# Keypair comes before the mode check so the Screen Bridge Setup action can
# always print a pubkey. Generated once, persisted on the bridge volume,
# never re-rolled — re-enrollment after rotation is the user's job.
if [ ! -r "$SSH_KEY" ]; then
  if ssh-keygen -t ed25519 -N '' -C 'rakazo-screen-bridge' -f "$SSH_KEY" >/dev/null 2>&1; then
    echo "bridge: generated ed25519 keypair (enroll $SSH_KEY.pub on your computer host)"
  else
    echo "bridge: keygen at $SSH_KEY failed" >&2
    exit 1
  fi
fi

MODE=""
if [ -n "${CF_SSH_HOSTNAME:-}" ] && [ -n "${CF_SERVICE_TOKEN_ID:-}" ] && [ -n "${CF_SERVICE_TOKEN_SECRET:-}" ]; then
  MODE=cf
elif [ -n "${SSH_HOST:-}" ]; then
  MODE=direct
fi
if [ -z "$MODE" ] || [ -z "${SSH_USER:-}" ]; then
  echo "bridge: no connection configured — idle. Bot computers still run; desktop view/control activates once the Bot Computers action sets the bridge connection."
  exec sleep infinity
fi

if [ "$MODE" = cf ]; then
  TARGET="${SSH_USER}@127.0.0.1"
  PORTOPT="-p $CF_LOCAL_PORT"
else
  TARGET="${SSH_USER}@${SSH_HOST}"
  PORTOPT="-p 22"
fi

SSH_ARGS="-i $SSH_KEY $PORTOPT -o StrictHostKeyChecking=accept-new -o ServerAliveInterval=15 -o ServerAliveCountMax=2 -o BatchMode=yes -o ConnectTimeout=10"

proxy_alive() { [ -n "${CF_PID:-}" ] && kill -0 "$CF_PID" 2>/dev/null; }

ensure_proxy() {
  [ "$MODE" = cf ] || return 0
  proxy_alive && return 0
  echo "bridge: starting cloudflared access tcp ($CF_SSH_HOSTNAME -> 127.0.0.1:$CF_LOCAL_PORT)"
  cloudflared access tcp --hostname "$CF_SSH_HOSTNAME" --url "127.0.0.1:$CF_LOCAL_PORT" \
    --service-token-id "$CF_SERVICE_TOKEN_ID" --service-token-secret "$CF_SERVICE_TOKEN_SECRET" \
    > "$CF_LOG" 2>&1 &
  CF_PID=$!
  # connect+listen is sub-second when healthy; give it a moment. If the token
  # or hostname is wrong cloudflared exits and the ssh attempt below fails
  # into the normal backoff; next round restarts the proxy.
  sleep 3
}

ssh_master_ok() { ssh -S "$CTL" $SSH_ARGS -O check "$TARGET" 2>/dev/null; }

# Drop the whole session: -O exit kills the master and every forward it
# carries, the state file forgets what was open, and forwards get rebuilt
# from a fresh container query after reconnect.
wipe_all() { ssh_master_ok && ssh -S "$CTL" $SSH_ARGS -O exit "$TARGET" 2>/dev/null; : > "$STATE"; }

ensure_master() {
  backoff=1
  while :; do
    ensure_proxy
    ssh_master_ok && return 0
    wipe_all
    # shellcheck disable=SC2086
    if ssh -M -S "$CTL" -fN $SSH_ARGS -o ExitOnForwardFailure=yes "$TARGET" 2>/dev/null; then
      echo "bridge: ssh mux up ($MODE)"
      backoff=1
    else
      echo "bridge: ssh connect failed, retry in ${backoff}s" >&2
      sleep "$backoff"
      backoff=$(( backoff < 60 ? backoff * 2 : 60 ))
    fi
  done
}

# Emit "containerId hostPort" for every loopback-published 6080/7070 mapping
# on rakazo bot containers. Keyed by container ID (not port) so a recreated
# bot on a reused ephemeral port never leaves a stale forward behind.
list_ports() {
  # shellcheck disable=SC2086
  ssh -S "$CTL" $SSH_ARGS "$TARGET" \
    "docker ps --filter label=${LABEL_FILTER} --format '{{json .}}'" 2>/dev/null \
  | jq -r '
      . as $o
      | [ ($o.Ports // "") | split(", ")[]
          | capture("^(?<ip>127\\.0\\.0\\.1|\\[::1\\]|localhost):(?<h>[0-9]+)->(?<c>6080|7070)/tcp$")
          | .h ] | unique
      | select(length > 0)
      | .[] | "\($o.ID[0:12]) \(.)"' \
  | sort -u
}

del_forward() {
  # shellcheck disable=SC2086
  ssh -S "$CTL" $SSH_ARGS -O cancel -L "0.0.0.0:$2:127.0.0.1:$2" "$TARGET" 2>/dev/null \
    && echo "bridge: -fwd $2 (bot $1)"
}

add_forward() {
  # Publish on every local address: daemons in this package share the
  # network namespace, so web reaches the forward via 127.0.0.1:<port>.
  # shellcheck disable=SC2086
  if ssh -S "$CTL" $SSH_ARGS -O forward -L "0.0.0.0:$2:127.0.0.1:$2" "$TARGET" 2>/dev/null; then
    echo "bridge: +fwd $2 (bot $1)"
    printf '%s %s\n' "$1" "$2" >> "$STATE.pend"
  else
    # Known v1 limitation: a refused local bind (port already taken in this
    # namespace) is retried every scan; a refused -O cancel forfeits the port
    # until the mux bounces.
    echo "bridge: !fwd $2 refused (bot $1), retry next scan" >&2
  fi
}

echo "bridge: up (mode=$MODE target=$TARGET scan=${SCAN_SECS}s)"
: > "$STATE"
while :; do
  ensure_master
  list_ports > /tmp/bridge.now
  sort -u "$STATE" > /tmp/bridge.have
  : > "$STATE.pend"
  comm -23 /tmp/bridge.have /tmp/bridge.now | while read -r c p; do [ -n "$c" ] && del_forward "$c" "$p"; done
  comm -13 /tmp/bridge.have /tmp/bridge.now | while read -r c p; do [ -n "$c" ] && add_forward "$c" "$p"; done
  comm -12 /tmp/bridge.have /tmp/bridge.now > "$STATE.new"
  cat "$STATE.pend" >> "$STATE.new"
  sort -u "$STATE.new" > "$STATE"
  rm -f /tmp/bridge.now /tmp/bridge.have "$STATE.new" "$STATE.pend"
  sleep "$SCAN_SECS"
done
