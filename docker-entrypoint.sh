#!/bin/sh
set -eu

# Named Docker volumes are commonly initialized as root. Repair only the
# application-owned persistence directory, then drop privileges permanently.
mkdir -p /app/data
chown -R nextjs:nodejs /app/data

exec su-exec nextjs:nodejs "$@"
