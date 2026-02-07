#!/bin/sh
set -e

DB_PATH="/app/database/dev.db"
MIGRATIONS_DIR="/app/prisma/migrations"
CUSTOM_DIR="/app/database/custom"

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

# ---------------------------------------------------------------------------
# Ensure custom templates directory exists inside the database volume.
# Schools can place their own files here (school logo, reminder template,
# user-card background, Antolin data) and they will take precedence over
# the defaults shipped in /app/public/.
# ---------------------------------------------------------------------------
if [ ! -d "$CUSTOM_DIR" ]; then
  echo "Creating custom templates directory at $CUSTOM_DIR ..."
  mkdir -p "$CUSTOM_DIR"
  echo "Place your school-specific files here to override defaults." > "$CUSTOM_DIR/README.txt"
fi

if [ -n "$(ls -A "$CUSTOM_DIR" 2>/dev/null)" ]; then
  echo "Custom files found in $CUSTOM_DIR:"
  ls -la "$CUSTOM_DIR"
else
  echo "No custom files in $CUSTOM_DIR. Using defaults from /app/public/."
fi

exec "$@"