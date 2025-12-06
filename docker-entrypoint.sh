#!/bin/sh
set -e

DB_PATH="/app/database/dev.db"
MIGRATIONS_DIR="/app/prisma/migrations"

echo "Database URL: $DATABASE_URL"

# Ensure mount point exists and is writable
mkdir -p /app/database

has_migrations() {
  [ -d "$MIGRATIONS_DIR" ] && [ -n "$(ls -A "$MIGRATIONS_DIR" 2>/dev/null)" ]
}

if [ ! -f "$DB_PATH" ]; then
  echo "No database found at $DB_PATH."

  if has_migrations; then
    echo "Migrations detected. Running: prisma migrate deploy"
    npx prisma migrate deploy
  else
    echo "No migrations found. Running: prisma db push"
    npx prisma db push
  fi
else
  if has_migrations; then
    echo "Database exists. Applying pending migrations..."
    npx prisma migrate deploy
  else
    echo "Database exists, no migrations. Skipping."
  fi
fi

exec "$@"