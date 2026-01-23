# Container-Installation (Docker)

Diese Anleitung führt dich durch die Installation von OpenLibry mit Docker. Am Ende läuft OpenLibry unter `http://localhost:3000` oder auf dem entsprechenden host wie `http://raspberrypi:3000`. 

**Willst du HTTPS mit eigener Domain?** In dem Fall ist es sinnvoll einen Reverse Proxy zu nutzen, der die SSL Verbindung aufbaut und sie an den OpenLibry Server weiterleitet. Folge erst dieser Anleitung, und danach [nginx & SSL](nginx-ssl.md).

## Voraussetzungen

- Linux-Server oder Desktop (Ubuntu, Debian, Raspberry Pi OS)
- Mindestens 2 GB RAM
- 2 GB freier Speicherplatz

## Schritt 1: Docker installieren

Falls Docker noch nicht installiert ist:

```bash
# System aktualisieren
sudo apt-get update
sudo apt-get upgrade -y

# Docker-Repository einrichten
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu jammy stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Docker installieren
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y

# Benutzer zur Docker-Gruppe hinzufügen
sudo usermod -aG docker ${USER}
```

**Wichtig**: Nach der Installation einmal abmelden und neu anmelden, damit die Gruppenänderung aktiv wird.

Prüfen, ob Docker läuft:

```bash
docker --version
sudo systemctl is-active docker
```

## Schritt 2: OpenLibry vorbereiten und konfigurieren

Im Unterschied zur temporären Installation werden im Server Ordner für die Datenbank un die Cover angelegt, die auch verbleiben, wenn der Docker Container gelöscht oder geupdatet wird. Diese müssen entsprechende Zugangsrechte haben, damit der Docker Daemon diese nutzen kann. Falls was nicht funktioniert sind es in 90% der Fälle ein Permission Problem.

```bash
# Verzeichnis erstellen
mkdir -p ~/openlibry
cd ~/openlibry

# Volumes anlegen, node user ist typischerweise uid 1000, nicht root!
mkdir -p database images
sudo chown -R 1000:1000 database images
```

Erstelle eine `.env` Datei im openlibry folder, entweder über diesen [Link](https://github.com/jzakotnik/openlibry/blob/main/.env_example) oder manuell:
```sh
#############################################
# 🔧 TECHNICAL CONFIGURATION
#############################################

# 🗄️ Database connection string (SQLite in this example)
DATABASE_URL=file:/app/database/dev.db

# 🔐 Authentication: URLs for NextAuth (used for callbacks and redirects)
NEXTAUTH_URL=http://localhost:3000

# 🔑 Secret key used for encrypting NextAuth tokens and sessions
NEXTAUTH_SECRET=<some random string>

# 👤 Toggle authentication (true = enabled, false = disabled). 
# ⚠️ Disabling authentication should only be used during development/bootstrap.
AUTH_ENABLED=false

# 📁 Path where uploaded cover images are stored (without trailing /)
# Example below works inside the Docker container
COVERIMAGE_FILESTORAGE_PATH=/app/images

# ⏱️ Session timeout (in seconds) for user inactivity before automatic logout
LOGIN_SESSION_TIMEOUT=3600

# 📦 Maximum allowed size for migration JSON files (e.g. OpenBiblio imports)
MAX_MIGRATION_SIZE=250mb

# 🛡️ Security header configuration
# "insecure" = disables CSP headers (not recommended in production)
SECURITY_HEADERS=insecure

# 🗑️ When deleting books/users, apply a safety delay (in seconds) before deletion is final
DELETE_SAFETY_SECONDS=5

# 📚 Default sorting order for rental screen
# Options: 'id_asc', 'id_desc', 'title_asc', 'title_desc'
RENTAL_SORT_BOOKS="title_asc"

# 🔢 Minimum length for barcodes. Shorter barcodes will be padded with spaces.
BARCODE_MINCODELENGTH=3

# 💾 Show backup button in the top navigation bar (1 = show, 0 = hide)
BACKUP_BUTTON_SWITCH=1


#############################################
# 🏫 BUSINESS CONFIGURATION
#############################################

# 🏫 School name displayed in the UI and reports
SCHOOL_NAME="Mustermann Schule"

# 🖼️ School logo used in UI and labels (filename in /public directory)
LOGO_LABEL="schullogo.jpg"

# 📅 Default extension period (in days) when renewing rentals
EXTENSION_DURATION_DAYS=22

# 📊 Number of books shown per page in overview listings
NUMBER_BOOKS_OVERVIEW=20

# 🔢 Maximum number of books expected in the library (for search/pagination scaling)
NUMBER_BOOKS_MAX=10000


#############################################
# 📧 REMINDER (MAHNUNG) CONFIGURATION
#############################################

# 📄 Path to the reminder (mahnung) Word template
REMINDER_TEMPLATE_DOC="mahnung-template.docx"

# 👤 Responsible person or department shown in reminder notices
REMINDER_RESPONSIBLE_NAME="Schulbücherei"
REMINDER_RESPONSIBLE_EMAIL="info@email.de"

# 🔁 Number of times a reminder can be renewed before escalation
REMINDER_RENEWAL_COUNT=5


#############################################
# 🏷️ BOOK LABEL CONFIGURATION
#############################################

# 📐 Label positioning and dimensions (in cm)
BOOKLABEL_MARGIN_LEFT=3
BOOKLABEL_MARGIN_TOP=2
BOOKLABEL_LABEL_WIDTH=7.0
BOOKLABEL_LABEL_HEIGHT=3.2
BOOKLABEL_ROWSONPAGE=5
BOOKLABEL_COLUMNSONPAGE=2

# 🖼️ Draw a frame around labels (useful for calibration during printing)
BOOKLABEL_PRINT_LABEL_FRAME=false

# ↔️ Spacing between labels (in cm)
BOOKLABEL_LABEL_SPACING_HORIZONTAL=1.7
BOOKLABEL_LABEL_SPACING_VERTICAL=2.2

# 📏 Inner margin (in cm) inside the label to account for printer offsets
BOOKLABEL_MARGIN_IN_LABEL=0.05

# ✍️ Author line configuration (rotated 90°, displayed next to barcode)
# Format: [content, fontsize, alignment]
BOOKLABEL_AUTHORLINE=["Book.author",9,"center"]
BOOKLABEL_AUTHOR_SPACING="1.8"

# 📝 Maximum number of characters printed from the author line 
# (19 characters ≈ one line, 38 ≈ two lines)
BOOKLABEL_MAX_AUTHORLINE_LENGTH="38"

# 📖 Additional text lines on labels
BOOKLABEL_LINE_ABOVE=["Book.title",10,"left"]
BOOKLABEL_LINE_ABOVE_USE_MAX_SPACE=true
BOOKLABEL_LINE_BELOW_1=["firstTopic",10,"left"]

# 📝 Maximum number of characters printed from the first line below (topics)
# (32 characters ≈ one line)
BOOKLABEL_LINE_BELOW_1_LENGTH="32"
BOOKLABEL_LINE_BELOW_2=["Mustermann Schule",10,"left"]

# 🖼️ Logo and barcode settings for book labels
BOOKLABEL_LOGO=schullogo_buchlabel.png
BOOKLABEL_BARCODE_WIDTH="3cm"
BOOKLABEL_BARCODE_HEIGHT="1.6cm"
BOOKLABEL_BARCODE_VERSION="code128"
BOOKLABEL_BARCODE_PLACEHOLDER="barcode"


#############################################
# 🆔 USER LABEL CONFIGURATION
#############################################

# 🖼️ Background template for user ID labels (filename in /public directory)
USERID_LABEL_IMAGE=userlabeltemplate.jpg

# 📐 Size and layout
USERLABEL_WIDTH="42vw"
USERLABEL_PER_PAGE=6

# 🎨 Optional color bar to display under user image
# Format: [width, height, color]
USERLABEL_SEPARATE_COLORBAR=[250,70,"lightgreen"]

# 📝 Text lines on user labels
# Format: [content, top, left, width, margin, color, fontsize]
USERLABEL_LINE_1=["User.firstName User.lastName","75%","3%","35vw","2pt","black",14]
USERLABEL_LINE_2=["Mustermann Schule","83%","3%","35vw","2pt","black",10]
USERLABEL_LINE_3=["User.schoolGrade","90%","3%","35vw","2pt","black",12]

# 🔲 Barcode for user labels
# Format: [top, left, width, height, version]
USERLABEL_BARCODE=["80%","63%","3cm","1.6cm","code128"]
``` 



Erstelle eine `docker-compose.yml`:
```yaml
services:
  openlibry:
    image: jzakotnik/openlibry:release
    container_name: openlibry
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - ./database:/app/database
      - ./images:/app/images
    env_file:
      - .env
```

Starten:

```bash
docker compose up -d
```

OpenLibry läuft jetzt unter `http://localhost:3000` und startet automatisch nach einem Neustart.

## Schritt 4: Ersten Benutzer anlegen

1. Öffne `http://localhost:3000/auth/register`
2. Erstelle einen Admin-Benutzer
3. Bearbeite die `.env` und setze `AUTH_ENABLED=true`
4. Container neu starten: `docker compose restart`

## Nützliche Befehle

```bash
# Status anzeigen
docker compose ps

# Logs anzeigen
docker compose logs -f

# Stoppen
docker compose stop

# Stoppen und Container entfernen
docker compose down

# Update auf neue Version
docker compose pull
docker compose up -d
```

## Speicherplatz aufräumen

Bei vielen Experimenten können alte Images Speicherplatz belegen:

```bash
# Ungenutzte Images löschen
docker image prune -a

# Builder-Cache leeren
docker builder prune
```

## Berechtigungsprobleme?

Falls der database-Ordner nicht erstellt werden kann:

```bash
# Benutzer-ID im Container herausfinden
docker run --rm --entrypoint sh jzakotnik/openlibry:latest -c 'id -u'

# Ordner mit korrekten Rechten erstellen
mkdir -p database
sudo chown 1000:1000 database
```

## Nächste Schritte

- [nginx & SSL einrichten](nginx-ssl.md) – Für HTTPS und eigene Domain
- [Konfiguration](../configuration/index.md) – Labels, Mahnungen, etc.
- [Upgrading](upgrading.md) – Auf neue Versionen aktualisieren
