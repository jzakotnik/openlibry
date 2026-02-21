#!/usr/bin/env bash
# Anonymize user last names directly in a SQLite database.
#
# Usage:
#   ./anonymize-lastnames.sh <path-to-database.db>
#
# Example:
#   ./anonymize-lastnames.sh /opt/openlibry/prisma/dev.db

set -euo pipefail

# --- Argument check ---
if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <path-to-database.db>"
  exit 1
fi

DB="$1"

if [[ ! -f "$DB" ]]; then
  echo "Error: Database file not found: $DB"
  exit 1
fi

if ! command -v sqlite3 &>/dev/null; then
  echo "Error: sqlite3 is not installed."
  exit 1
fi

# --- Name pool ---
NAMES=(
  "Müller" "Schmidt" "Schneider" "Fischer" "Weber" "Meyer" "Wagner"
  "Becker" "Schulz" "Hoffmann" "Schäfer" "Bauer" "Koch" "Richter"
  "Klein" "Wolf" "Schröder" "Neumann" "Schwarz" "Braun" "Hofmann"
  "Zimmermann" "Schmitt" "Hartmann" "Krüger" "Schmid" "Werner" "Lange"
  "Schmitz" "Meier" "Krause" "Maier" "Lehmann" "Huber" "Mayer"
  "Herrmann" "Köhler" "Walter" "König" "Schulze" "Fuchs" "Kaiser"
  "Lang" "Weiß" "Peters" "Scholz" "Jung" "Möller" "Hahn" "Keller"
  "Vogel" "Schubert" "Roth" "Frank" "Friedrich" "Beck" "Günther"
  "Berger" "Winkler" "Lorenz" "Baumann" "Schuster" "Kraus" "Böhm"
  "Simon" "Franke" "Albrecht" "Winter" "Ludwig" "Martin" "Krämer"
  "Schumacher" "Vogt" "Jäger" "Stein" "Otto" "Groß" "Sommer" "Haas"
  "Graf" "Heinrich" "Seidel" "Schreiber" "Ziegler" "Brandt" "Kuhn"
  "Schulte" "Dietrich" "Kühn" "Engel" "Pohl" "Horn" "Sauer" "Arnold"
  "Thomas" "Bergmann" "Busch" "Pfeiffer" "Voigt" "Götz" "Seifert"
  "Lindner" "Ernst" "Hübner" "Kramer" "Franz" "Beyer" "Wolff" "Peter"
  "Jansen" "Kern" "Barth" "Wenzel" "Hermann" "Ott" "Paul" "Riedel"
  "Wilhelm" "Hansen" "Nagel" "Grimm" "Lenz" "Ritter" "Bock" "Langer"
  "Kaufmann" "Mohr" "Förster" "Zimmer" "Haase" "Lutz" "Kruse" "Jahn"
  "Schumann" "Fiedler" "Thiel" "Hoppe" "Kraft" "Michel" "Marx" "Fritz"
  "Arndt" "Eckert" "Schütz" "Walther" "Petersen" "Berg" "Schindler"
  "Kunz" "Reuter" "Sander" "Schilling" "Reinhardt" "Frey" "Ebert"
  "Böttcher" "Thiele" "Gruber" "Schramm" "Hein" "Bayer" "Fröhlich"
  "Voß" "Herzog" "Hesse" "Maurer" "Rudolph" "Nowak" "Geiger"
  "Beckmann" "Kunze" "Seitz" "Stephan" "Büttner" "Bender" "Gärtner"
  "Bachmann" "Behrens" "Scherer" "Adam" "Stahl" "Steiner" "Kurz"
  "Dietz" "Brunner" "Witt" "Moser" "Fink" "Ullrich" "Kirchner"
  "Löffler" "Heinz" "Schultz" "Ulrich" "Reichert" "Schwab" "Breuer"
  "Gerlach" "Brinkmann" "Göbel" "Blum" "Brand" "Naumann" "Stark"
  "Wirth" "Schenk" "Binder" "Körner" "Schlüter" "Rieger" "Urban"
  "Nguyen" "Yilmaz" "Adams" "Kowalski" "Özdemir" "Öztürk" "Dose"
)

# --- Fisher-Yates shuffle ---
shuffle() {
  local arr=("$@")
  local n=${#arr[@]}
  for ((i = n - 1; i > 0; i--)); do
    j=$(( RANDOM % (i + 1) ))
    local tmp="${arr[$i]}"
    arr[$i]="${arr[$j]}"
    arr[$j]="$tmp"
  done
  echo "${arr[@]}"
}

# --- Fetch user IDs ---
echo "Reading users from: $DB"
mapfile -t USER_IDS < <(sqlite3 "$DB" "SELECT id FROM User ORDER BY id;")

TOTAL=${#USER_IDS[@]}
if [[ $TOTAL -eq 0 ]]; then
  echo "No users found in the database."
  exit 0
fi
echo "Found $TOTAL user(s)."

# --- Shuffle the name pool ---
read -r -a SHUFFLED <<< "$(shuffle "${NAMES[@]}")"
POOL_SIZE=${#SHUFFLED[@]}

# --- Build and execute one transaction ---
echo "Applying updates..."
{
  echo "BEGIN TRANSACTION;"
  for i in "${!USER_IDS[@]}"; do
    USER_ID="${USER_IDS[$i]}"
    LAST_NAME="${SHUFFLED[$((i % POOL_SIZE))]}"
    LAST_NAME="${LAST_NAME//\'/\'\'}"  # escape single quotes
    echo "UPDATE User SET lastName = '${LAST_NAME}' WHERE id = ${USER_ID};"
  done
  echo "COMMIT;"
} | sqlite3 "$DB"

echo "Done. Updated $TOTAL user(s) with anonymized last names."