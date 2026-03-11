#!/bin/sh
set -e

# Ensure data directory exists and is writable by nextjs user
mkdir -p /app/prisma/data
chown -R nextjs:nodejs /app/prisma/data

# Generate a random password if not set or left as default
if [ -z "$LOGIN_PASSWORD" ] || [ "$LOGIN_PASSWORD" = "ChangeThisPassword" ]; then
  LOGIN_PASSWORD=$(head -c 16 /dev/urandom | od -An -tx1 | tr -d ' \n' | head -c 16)
  export LOGIN_PASSWORD
  echo ""
  echo "=========================================="
  echo "  Generated login password: $LOGIN_PASSWORD"
  echo "=========================================="
  echo ""
  echo "  Set LOGIN_PASSWORD in docker-compose.yml"
  echo "  or .env to use your own password."
  echo ""
fi

echo "Running database migrations..."
su-exec nextjs node ./node_modules/prisma/build/index.js migrate deploy

echo ""
echo "Starting application..."
exec su-exec nextjs node server.js
