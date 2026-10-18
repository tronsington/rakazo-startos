ARCHES := x86 arm
# upstream app image publishes amd64+arm64; the bridge image is built locally
# at pack time (arm64 build needs qemu binfmt on the build host — see the
# build notes in AGENTS.md).
include node_modules/@start9labs/start-sdk/s9pk.mk
