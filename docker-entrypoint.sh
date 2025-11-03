#!/bin/sh
set -e

DB_PATH="/app/database/dev.db"
SCHEMA_DIR="/app/prisma"
MIGRATIONS_DIR="$SCHEMA_DIR/migrations"

echo "Database path $DATABASE_URL"

# Ensure mount point exists and is writable
mkdir -p /app/database

has_migrations() {
  [ -d "$MIGRATIONS_DIR" ] && [ -n "$(ls -A "$MIGRATIONS_DIR" 2>/dev/null)" ]
}

# If DB file doesn't exist, create schema
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
  # DB exists. Apply pending migrations if any.
  if has_migrations; then
    echo "Database exists. Applying pending migrations with: prisma migrate deploy"
    npx prisma migrate deploy
  else
    echo "Database exists and no migrations directory. Skipping schema sync."
  fi
fi

exec "$@"
