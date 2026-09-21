#!/usr/bin/env bash
#
# Bulk-fetch book cover images after an Excel import.
#
# Fetches the full book list from GET /api/book, then for every book that
# has an ISBN calls the existing single-cover endpoint
# GET /api/book/fetchCover?isbn=...&bookId=... which looks the cover up
# (DNB -> OpenLibrary -> Google Books) and writes it to
# COVERIMAGE_FILESTORAGE_PATH/<bookId>.jpg on the server.
#
# A random 5-10s pause is inserted after every book so the external cover
# providers don't rate-limit / block the run.
#
# Usage:
#   ./scripts/fetch-covers.sh [base_url]
#
# Env vars:
#   BASE_URL       Server base URL (default: http://localhost:3000)
#   SKIP_EXISTING  If set to "1" and COVER_DIR is set, skip books that
#                  already have a <bookId>.jpg in COVER_DIR.
#   COVER_DIR      Local path to the cover storage dir (matches
#                  COVERIMAGE_FILESTORAGE_PATH on the server), only used
#                  when SKIP_EXISTING=1 and the script runs on the same
#                  host/filesystem as the server.
#
# Requires: curl, jq

set -uo pipefail

BASE_URL="${1:-${BASE_URL:-http://localhost:3000}}"
SKIP_EXISTING="${SKIP_EXISTING:-0}"
COVER_DIR="${COVER_DIR:-}"

command -v curl >/dev/null 2>&1 || { echo "curl is required" >&2; exit 1; }
command -v jq   >/dev/null 2>&1 || { echo "jq is required"   >&2; exit 1; }

LOG_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/logs"
mkdir -p "$LOG_DIR"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
LOG_FILE="$LOG_DIR/fetch-covers-${TIMESTAMP}.log"
FAILED_FILE="$LOG_DIR/fetch-covers-${TIMESTAMP}-failed.csv"

echo "bookId,isbn,reason" > "$FAILED_FILE"

log() {
  echo "$(date '+%Y-%m-%d %H:%M:%S') $*" | tee -a "$LOG_FILE"
}

log "Starting bulk cover fetch against ${BASE_URL}"

BOOKS_JSON="$(curl -sS --fail "${BASE_URL}/api/book")" || {
  log "ERROR: could not fetch book list from ${BASE_URL}/api/book"
  exit 1
}

# TSV: id<TAB>isbn, only rows with a non-empty isbn
ROWS="$(echo "$BOOKS_JSON" | jq -r '.[] | select(.isbn != null and (.isbn | tostring | gsub("\\s";"") | length) > 0) | [.id, .isbn] | @tsv')"

TOTAL="$(echo "$ROWS" | grep -c . || true)"
log "Found ${TOTAL} books with an ISBN"

COUNT=0
OK=0
FAIL=0
SKIPPED=0

while IFS=$'\t' read -r BOOK_ID ISBN; do
  [ -z "$BOOK_ID" ] && continue
  COUNT=$((COUNT + 1))

  if [ "$SKIP_EXISTING" = "1" ] && [ -n "$COVER_DIR" ] && [ -f "${COVER_DIR}/${BOOK_ID}.jpg" ]; then
    log "[${COUNT}/${TOTAL}] book ${BOOK_ID} (isbn ${ISBN}) - cover already exists, skipping"
    SKIPPED=$((SKIPPED + 1))
    continue
  fi

  log "[${COUNT}/${TOTAL}] fetching cover for book ${BOOK_ID} (isbn ${ISBN})"

  HTTP_CODE="$(curl -sS -o /tmp/fetch-cover-response.json -w '%{http_code}' \
    --get "${BASE_URL}/api/book/fetchCover" \
    --data-urlencode "isbn=${ISBN}" \
    --data-urlencode "bookId=${BOOK_ID}")"

  if [ "$HTTP_CODE" = "200" ]; then
    SUCCESS="$(jq -r '.success // false' /tmp/fetch-cover-response.json 2>/dev/null || echo false)"
    if [ "$SUCCESS" = "true" ]; then
      log "  -> OK"
      OK=$((OK + 1))
    else
      REASON="$(jq -r '.error // .reason // "unknown"' /tmp/fetch-cover-response.json 2>/dev/null)"
      log "  -> FAILED (http 200 but success=false: ${REASON})"
      echo "${BOOK_ID},${ISBN},${REASON}" >> "$FAILED_FILE"
      FAIL=$((FAIL + 1))
    fi
  else
    REASON="$(jq -r '.error // .reason // "unknown"' /tmp/fetch-cover-response.json 2>/dev/null || echo "http ${HTTP_CODE}")"
    log "  -> FAILED (http ${HTTP_CODE}: ${REASON})"
    echo "${BOOK_ID},${ISBN},${REASON}" >> "$FAILED_FILE"
    FAIL=$((FAIL + 1))
  fi

  # Random pause between 5 and 10 seconds (inclusive) so we don't hammer
  # DNB / OpenLibrary / Google Books.
  PAUSE=$((RANDOM % 6 + 5))
  log "  sleeping ${PAUSE}s"
  sleep "$PAUSE"
done <<< "$ROWS"

rm -f /tmp/fetch-cover-response.json

log "Done. total=${TOTAL} ok=${OK} failed=${FAIL} skipped=${SKIPPED}"
log "Failures logged to ${FAILED_FILE}"
