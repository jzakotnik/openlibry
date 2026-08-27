#!/bin/bash
# =============================================================================
# OpenLibry Book Label API - Test Script
#
# Tests all label API endpoints with curl.
# Usage: ./test-labels-api.sh [BASE_URL]
#
# Default BASE_URL: http://localhost:3000
# =============================================================================

BASE_URL="${1:-http://localhost:3000}"
API="$BASE_URL/api/labels"
OUTPUT_DIR="./test-label-output"
PASS=0
FAIL=0

mkdir -p "$OUTPUT_DIR"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

header() {
  echo ""
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${CYAN}  $1${NC}"
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

check() {
  local test_name="$1"
  local http_code="$2"
  local expected="$3"

  if [ "$http_code" = "$expected" ]; then
    echo -e "  ${GREEN}✅ $test_name (HTTP $http_code)${NC}"
    PASS=$((PASS + 1))
  else
    echo -e "  ${RED}❌ $test_name — expected $expected, got $http_code${NC}"
    FAIL=$((FAIL + 1))
  fi
}

# =============================================================================
header "1. GET /api/labels/sheets — List all sheet configs"
# =============================================================================

RESPONSE=$(curl -s -w "\n%{http_code}" "$API/sheets")
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

check "List sheets" "$HTTP_CODE" "200"

# Count returned sheets
SHEET_COUNT=$(echo "$BODY" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null || echo "?")
echo -e "  ${YELLOW}→ Returned $SHEET_COUNT sheet configs${NC}"
echo "$BODY" | python3 -m json.tool 2>/dev/null | head -20
echo "  ..."

# =============================================================================
header "2. GET /api/labels/sheets?id=zweckform-3474 — Single sheet"
# =============================================================================

RESPONSE=$(curl -s -w "\n%{http_code}" "$API/sheets?id=zweckform-3474")
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

check "Get zweckform-3474" "$HTTP_CODE" "200"
echo "$BODY" | python3 -m json.tool 2>/dev/null

# =============================================================================
header "3. GET /api/labels/sheets?id=nonexistent — 404 handling"
# =============================================================================

RESPONSE=$(curl -s -w "\n%{http_code}" "$API/sheets?id=does-not-exist")
HTTP_CODE=$(echo "$RESPONSE" | tail -1)

check "Sheet 404" "$HTTP_CODE" "404"

# =============================================================================
header "4. GET /api/labels/templates — List all templates"
# =============================================================================

RESPONSE=$(curl -s -w "\n%{http_code}" "$API/templates")
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

check "List templates" "$HTTP_CODE" "200"

TEMPLATE_COUNT=$(echo "$BODY" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null || echo "?")
echo -e "  ${YELLOW}→ Returned $TEMPLATE_COUNT templates${NC}"
echo "$BODY" | python3 -m json.tool 2>/dev/null

# =============================================================================
header "5. GET /api/labels/templates?id=default — Single template"
# =============================================================================

RESPONSE=$(curl -s -w "\n%{http_code}" "$API/templates?id=default")
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

check "Get default template" "$HTTP_CODE" "200"
echo "$BODY" | python3 -m json.tool 2>/dev/null

# =============================================================================
header "6. POST /api/labels/templates — Save a custom template"
# =============================================================================

RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test-template",
    "name": "Test Vorlage",
    "sheetConfigId": "zweckform-3474",
    "spineWidthPercent": 30,
    "padding": 1.5,
    "fields": {
      "spine":       { "content": "author",   "fontSizeMax": 10, "align": "center" },
      "horizontal1": { "content": "title",    "fontSizeMax": 12, "align": "left" },
      "horizontal2": { "content": "id",       "fontSizeMax": 10, "align": "left" },
      "horizontal3": { "content": "subtitle", "fontSizeMax": 8,  "align": "left" }
    }
  }' \
  "$API/templates")
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

check "Save template" "$HTTP_CODE" "200"
echo "$BODY" | python3 -m json.tool 2>/dev/null

# Verify it was saved
RESPONSE=$(curl -s -w "\n%{http_code}" "$API/templates?id=test-template")
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
check "Verify saved template" "$HTTP_CODE" "200"

# =============================================================================
header "7. POST /api/labels/templates — Validation (missing fields)"
# =============================================================================

RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{ "id": "bad", "name": "Bad" }' \
  "$API/templates")
HTTP_CODE=$(echo "$RESPONSE" | tail -1)

check "Reject invalid template" "$HTTP_CODE" "400"

# =============================================================================
header "8. POST /api/labels/generate — Full sheet, explicit books"
# =============================================================================

PDF_FILE="$OUTPUT_DIR/test-full-sheet.pdf"

HTTP_CODE=$(curl -s -w "%{http_code}" -o "$PDF_FILE" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "sheetConfigId": "zweckform-3474",
    "templateId": "default",
    "books": [
      { "id": "B-0001", "title": "Der kleine Prinz", "author": "Antoine de Saint-Exupéry", "subtitle": "Eine Erzählung" },
      { "id": "B-0002", "title": "Momo", "author": "Michael Ende", "subtitle": "oder Die seltsame Geschichte von den Zeit-Dieben" },
      { "id": "B-0003", "title": "Jim Knopf und Lukas der Lokomotivführer", "author": "Michael Ende" },
      { "id": "B-0004", "title": "Die unendliche Geschichte", "author": "Michael Ende" },
      { "id": "B-0005", "title": "Pippi Langstrumpf", "author": "Astrid Lindgren" },
      { "id": "B-0006", "title": "Das Sams", "author": "Paul Maar", "subtitle": "Eine Woche voller Samstage" },
      { "id": "B-0007", "title": "Die kleine Hexe", "author": "Otfried Preußler" },
      { "id": "B-0008", "title": "Der Räuber Hotzenplotz", "author": "Otfried Preußler" },
      { "id": "B-0009", "title": "Krabat", "author": "Otfried Preußler" },
      { "id": "B-0010", "title": "Ronja Räubertochter", "author": "Astrid Lindgren" },
      { "id": "B-0011", "title": "Die Brüder Löwenherz", "author": "Astrid Lindgren" },
      { "id": "B-0012", "title": "Tintenherz", "author": "Cornelia Funke" }
    ]
  }' \
  "$API/generate")

check "Generate PDF (12 books, full sheet)" "$HTTP_CODE" "200"

if [ -f "$PDF_FILE" ]; then
  FILE_SIZE=$(wc -c < "$PDF_FILE" | tr -d ' ')
  echo -e "  ${YELLOW}→ PDF saved: $PDF_FILE ($FILE_SIZE bytes)${NC}"
  # Check it's actually a PDF
  HEAD=$(head -c 5 "$PDF_FILE")
  if [ "$HEAD" = "%PDF-" ]; then
    echo -e "  ${GREEN}→ Valid PDF header${NC}"
  else
    echo -e "  ${RED}→ NOT a valid PDF file!${NC}"
  fi
fi

# =============================================================================
header "9. POST /api/labels/generate — With startPosition (half-used sheet)"
# =============================================================================

PDF_FILE="$OUTPUT_DIR/test-start-position.pdf"

HTTP_CODE=$(curl -s -w "%{http_code}" -o "$PDF_FILE" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "sheetConfigId": "zweckform-3474",
    "templateId": "default",
    "startPosition": { "row": 5, "col": 2 },
    "books": [
      { "id": "B-0100", "title": "Harry Potter und der Stein der Weisen", "author": "J.K. Rowling" },
      { "id": "B-0101", "title": "Harry Potter und die Kammer des Schreckens", "author": "J.K. Rowling" },
      { "id": "B-0102", "title": "Harry Potter und der Gefangene von Askaban", "author": "J.K. Rowling" },
      { "id": "B-0103", "title": "Harry Potter und der Feuerkelch", "author": "J.K. Rowling" }
    ]
  }' \
  "$API/generate")

check "Generate PDF with startPosition (5,2)" "$HTTP_CODE" "200"

if [ -f "$PDF_FILE" ]; then
  FILE_SIZE=$(wc -c < "$PDF_FILE" | tr -d ' ')
  echo -e "  ${YELLOW}→ PDF saved: $PDF_FILE ($FILE_SIZE bytes)${NC}"
  echo -e "  ${YELLOW}→ First 4 rows + col 1 of row 5 should be empty${NC}"
fi

# =============================================================================
header "10. POST /api/labels/generate — Explicit positions (scattered)"
# =============================================================================

PDF_FILE="$OUTPUT_DIR/test-positions.pdf"

HTTP_CODE=$(curl -s -w "%{http_code}" -o "$PDF_FILE" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "sheetConfigId": "zweckform-3474",
    "templateId": "default",
    "positions": [
      { "row": 2, "col": 1 },
      { "row": 2, "col": 3 },
      { "row": 5, "col": 2 },
      { "row": 8, "col": 1 },
      { "row": 8, "col": 3 }
    ],
    "books": [
      { "id": "B-0201", "title": "Gregs Tagebuch", "author": "Jeff Kinney" },
      { "id": "B-0202", "title": "Die drei ???", "author": "Alfred Hitchcock" },
      { "id": "B-0203", "title": "Das magische Baumhaus", "author": "Mary Pope Osborne" },
      { "id": "B-0204", "title": "Die Schule der magischen Tiere", "author": "Margit Auer" },
      { "id": "B-0205", "title": "Warrior Cats", "author": "Erin Hunter" }
    ]
  }' \
  "$API/generate")

check "Generate PDF with explicit positions" "$HTTP_CODE" "200"

if [ -f "$PDF_FILE" ]; then
  FILE_SIZE=$(wc -c < "$PDF_FILE" | tr -d ' ')
  echo -e "  ${YELLOW}→ PDF saved: $PDF_FILE ($FILE_SIZE bytes)${NC}"
  echo -e "  ${YELLOW}→ Labels only at (2,1) (2,3) (5,2) (8,1) (8,3)${NC}"
fi

# =============================================================================
header "11. POST /api/labels/generate — Different sheet + template"
# =============================================================================

PDF_FILE="$OUTPUT_DIR/test-large-labels.pdf"

HTTP_CODE=$(curl -s -w "%{http_code}" -o "$PDF_FILE" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "sheetConfigId": "zweckform-3659",
    "templateId": "text-only",
    "books": [
      { "id": "B-0301", "title": "Der Grüffelo", "author": "Julia Donaldson", "subtitle": "Vierfarbiges Pappbilderbuch" },
      { "id": "B-0302", "title": "Die Raupe Nimmersatt", "author": "Eric Carle", "subtitle": "Pop-up-Buch" },
      { "id": "B-0303", "title": "Wo die wilden Kerle wohnen", "author": "Maurice Sendak" }
    ]
  }' \
  "$API/generate")

check "Generate PDF (3659 sheet, text-only template)" "$HTTP_CODE" "200"

if [ -f "$PDF_FILE" ]; then
  FILE_SIZE=$(wc -c < "$PDF_FILE" | tr -d ' ')
  echo -e "  ${YELLOW}→ PDF saved: $PDF_FILE ($FILE_SIZE bytes)${NC}"
fi

# =============================================================================
header "12. POST /api/labels/generate — Overflow across pages"
# =============================================================================

PDF_FILE="$OUTPUT_DIR/test-multipage.pdf"

# Generate 30 books (more than 24 per sheet on zweckform-3474)
BOOKS="["
for i in $(seq 1 30); do
  BOOKS="$BOOKS"'{"id":"B-'$(printf "%04d" $i)'","title":"Testbuch Nummer '$i'","author":"Testautor '$i'"}'
  if [ $i -lt 30 ]; then BOOKS="$BOOKS,"; fi
done
BOOKS="$BOOKS]"

HTTP_CODE=$(curl -s -w "%{http_code}" -o "$PDF_FILE" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "sheetConfigId": "zweckform-3474",
    "templateId": "default",
    "books": '"$BOOKS"'
  }' \
  "$API/generate")

check "Generate multi-page PDF (30 books on 24/sheet)" "$HTTP_CODE" "200"

if [ -f "$PDF_FILE" ]; then
  FILE_SIZE=$(wc -c < "$PDF_FILE" | tr -d ' ')
  echo -e "  ${YELLOW}→ PDF saved: $PDF_FILE ($FILE_SIZE bytes)${NC}"
  echo -e "  ${YELLOW}→ Should be 2 pages (24 + 6)${NC}"
fi

# =============================================================================
header "13. POST /api/labels/generate — With bookFilter (from DB)"
# =============================================================================

PDF_FILE="$OUTPUT_DIR/test-db-latest.pdf"

HTTP_CODE=$(curl -s -w "%{http_code}" -o "$PDF_FILE" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "sheetConfigId": "zweckform-3474",
    "templateId": "default",
    "bookFilter": { "type": "latest", "count": 5 }
  }' \
  "$API/generate")

check "Generate PDF from DB (latest 5)" "$HTTP_CODE" "200"

if [ -f "$PDF_FILE" ]; then
  FILE_SIZE=$(wc -c < "$PDF_FILE" | tr -d ' ')
  echo -e "  ${YELLOW}→ PDF saved: $PDF_FILE ($FILE_SIZE bytes)${NC}"
  echo -e "  ${YELLOW}→ Uses actual book data from database${NC}"
fi

# =============================================================================
header "14. POST /api/labels/generate — Error: missing books"
# =============================================================================

RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "sheetConfigId": "zweckform-3474",
    "templateId": "default"
  }' \
  "$API/generate")
HTTP_CODE=$(echo "$RESPONSE" | tail -1)

check "Reject missing books/filter" "$HTTP_CODE" "400"

# =============================================================================
header "15. POST /api/labels/generate — Error: invalid sheet"
# =============================================================================

RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "sheetConfigId": "nonexistent",
    "templateId": "default",
    "books": [{ "id": "1", "title": "Test", "author": "Test" }]
  }' \
  "$API/generate")
HTTP_CODE=$(echo "$RESPONSE" | tail -1)

check "Reject invalid sheet ID" "$HTTP_CODE" "404"

# =============================================================================
header "16. POST /api/labels/generate — Error: out-of-bounds position"
# =============================================================================

RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "sheetConfigId": "zweckform-3474",
    "templateId": "default",
    "positions": [{ "row": 99, "col": 1 }],
    "books": [{ "id": "1", "title": "Test", "author": "Test" }]
  }' \
  "$API/generate")
HTTP_CODE=$(echo "$RESPONSE" | tail -1)

check "Reject out-of-bounds position" "$HTTP_CODE" "400"

# =============================================================================
header "Summary"
# =============================================================================

TOTAL=$((PASS + FAIL))
echo ""
echo -e "  ${GREEN}Passed: $PASS${NC}"
echo -e "  ${RED}Failed: $FAIL${NC}"
echo -e "  Total:  $TOTAL"
echo ""

if [ -d "$OUTPUT_DIR" ]; then
  echo -e "  ${YELLOW}Generated PDFs in: $OUTPUT_DIR/${NC}"
  ls -lh "$OUTPUT_DIR"/*.pdf 2>/dev/null | awk '{print "    " $5 "  " $9}'
fi

echo ""
if [ $FAIL -eq 0 ]; then
  echo -e "  ${GREEN}All tests passed!${NC}"
  exit 0
else
  echo -e "  ${RED}Some tests failed.${NC}"
  exit 1
fi