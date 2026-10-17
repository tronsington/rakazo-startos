ARCHES := x86 arm
# upstream publishes amd64+arm64; both pack (no Dockerfile to compile).
include node_modules/@start9labs/start-sdk/s9pk.mk
