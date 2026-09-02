#!/bin/sh
set -e

DB_PATH="/app/database/dev.db"
CUSTOM_DIR="/app/database/custom"
DEFAULTS_LABELS_DIR="/app/defaults/labels"
CUSTOM_LABELS_DIR="$CUSTOM_DIR/labels"

echo "=== OpenLibry entrypoint ==="
echo "DATABASE_URL: $DATABASE_URL"

# ---------------------------------------------------------------------------
# Database initialisation
# Both fresh installs and schema updates go through `prisma db push`, which
# diffs the live database against prisma/schema.prisma and applies whatever
# is needed to match it. There is no migration history to track.
# ---------------------------------------------------------------------------
# Safety net: ensure the mount point exists and is writable before we try
# to create/sync the database. The Dockerfile already creates this dir
# as the node user, but explicit is better than implicit.
mkdir -p /app/database

if [ ! -f "$DB_PATH" ]; then
  echo "No database found at $DB_PATH. Running: prisma db push"
else
  echo "Database exists. Syncing schema. Running: prisma db push"
fi
npx prisma db push

# ---------------------------------------------------------------------------
# Ensure the custom templates directory exists.
# Schools place their own files here (school logo, reminder template,
# user-card background, Antolin data). These take precedence over the
# defaults shipped in /app/public/.
# ---------------------------------------------------------------------------
if [ ! -d "$CUSTOM_DIR" ]; then
  echo "Creating custom directory at $CUSTOM_DIR ..."
  mkdir -p "$CUSTOM_DIR"
  echo "Place your school-specific files here to override defaults." > "$CUSTOM_DIR/README.txt"
fi

# ---------------------------------------------------------------------------
# Seed default label sheets and templates into the database volume.
# Only missing files are copied — existing files are never overwritten,
# so any school-specific label customisations survive container updates.
# ---------------------------------------------------------------------------
if [ -d "$DEFAULTS_LABELS_DIR" ]; then
  for subdir in sheets templates; do
    mkdir -p "$CUSTOM_LABELS_DIR/$subdir"
    for src in "$DEFAULTS_LABELS_DIR/$subdir"/*.json; do
      [ -f "$src" ] || continue
      dest="$CUSTOM_LABELS_DIR/$subdir/$(basename "$src")"
      if [ ! -f "$dest" ]; then
        cp "$src" "$dest"
        echo "Seeded label file: $dest"
      fi
    done
  done
else
  echo "Warning: defaults labels directory not found at $DEFAULTS_LABELS_DIR — skipping seed."
fi

# ---------------------------------------------------------------------------
# Log what is present in the custom directory for easier debugging.
# ---------------------------------------------------------------------------
echo "Custom files in $CUSTOM_DIR:"
ls -1R "$CUSTOM_DIR" 2>/dev/null || echo "(none)"

exec "$@"