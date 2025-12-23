# Docker-Installation

Die einfachste Art, OpenLibry zu installieren. In wenigen Minuten bist du startklar.

## Voraussetzungen

- Docker (und optional Docker Compose)
- Ein Computer mit Internetzugang

### Docker installieren

Falls du Docker noch nicht hast:

=== "Ubuntu/Debian"

    ```bash
    # Docker installieren
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu jammy stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt update 
    sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    # Benutzer zur Docker-Gruppe hinzufügen
    sudo usermod -aG docker ${USER}
    
    # Prüfen, ob Docker läuft
    sudo systemctl is-active docker
    ```
    
    !!! warning "Neustart nötig"
        Nach dem Hinzufügen zur Docker-Gruppe musst du dich ab- und wieder anmelden!

=== "Windows/macOS"

    Lade [Docker Desktop](https://www.docker.com/products/docker-desktop/) herunter und installiere es.

## Variante A: Sandbox-Modus (zum Testen)

Ideal zum Ausprobieren ohne dauerhafte Installation:

```bash
docker run --rm -p 3000:3000 \
  -v "$(pwd)/database:/app/database" \
  -e AUTH_SECRET="einGeheimnis123" \
  -e DATABASE_URL="file:/app/database/dev.db" \
  jzakotnik/openlibry:latest
```

Öffne [http://localhost:3000](http://localhost:3000) im Browser.

- Beenden mit ++ctrl+c++
- `--rm` löscht den Container automatisch beim Beenden
- Die Datenbank bleibt im `./database`-Ordner erhalten

## Variante B: Dauerhafte Installation

Für den produktiven Einsatz empfehlen wir Docker Compose.

### 1. Projektverzeichnis erstellen

```bash
mkdir openlibry
cd openlibry
```

### 2. docker-compose.yml erstellen

```yaml title="docker-compose.yml"
services:
  openlibry:
    container_name: openlibry
    image: jzakotnik/openlibry:release
    ports:
      - "3000:3000"
    env_file:
      - ./.env
    volumes:
      - ./database:/app/database
      - ./public/coverimages:/app/public/coverimages
    restart: unless-stopped
```

### 3. Environment-Datei erstellen

```bash title=".env"
# Authentifizierung
AUTH_ENABLED=false
AUTH_SECRET=hierEinLangesGeheimnis123!

# Datenbank
DATABASE_URL=file:/app/database/dev.db

# Ausleihzeiten
RENTAL_DURATION_DAYS=21
EXTENSION_DURATION_DAYS=14
MAX_EXTENSIONS=2

# Schulinformationen
SCHOOL_NAME="Meine Schule"
```

!!! tip "Vollständige .env"
    Alle verfügbaren Einstellungen findest du in der [Umgebungsvariablen-Referenz](../configuration/environment-variables.md).

### 4. OpenLibry starten

```bash
docker compose up -d
```

Das `-d` startet den Container im Hintergrund.

### 5. Fertig!

Öffne [http://localhost:3000](http://localhost:3000) im Browser.

## Nützliche Docker-Befehle

### Status prüfen

```bash
docker compose ps
```

### Logs anzeigen

```bash
# Alle Logs
docker compose logs

# Live-Logs
docker compose logs -f

# Nur die letzten 100 Zeilen
docker compose logs --tail 100
```

### Stoppen und Starten

```bash
# Stoppen
docker compose stop

# Starten
docker compose start

# Neu starten
docker compose restart
```

### Komplett entfernen

```bash
# Container stoppen und entfernen
docker compose down

# Mit Volumes (Datenbank!)
docker compose down -v
```

!!! danger "Vorsicht mit `-v`"
    `docker compose down -v` löscht auch die Datenbank! Mach vorher ein Backup.

## Updates

### Auf neue Version aktualisieren

```bash
# Neues Image herunterladen
docker compose pull

# Container mit neuem Image neu starten
docker compose up -d
```

### Automatische Updates (optional)

Mit [Watchtower](https://containrrr.dev/watchtower/) kannst du automatische Updates einrichten:

```yaml title="docker-compose.yml (erweitert)"
services:
  openlibry:
    # ... wie oben ...

  watchtower:
    image: containrrr/watchtower
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    command: --interval 86400 openlibry
    restart: unless-stopped
```

Watchtower prüft täglich auf Updates und startet OpenLibry automatisch neu.

## Speicherplatz-Management

Docker-Images können viel Speicher belegen. Regelmäßig aufräumen:

```bash
# Ungenutzte Images löschen
docker image prune -a

# Build-Cache leeren
docker builder prune

# Alles aufräumen (Vorsicht!)
docker system prune -a
```

## Berechtigungsprobleme

Falls der `database`-Ordner nicht erstellt werden kann:

```bash
# User-ID im Container herausfinden
docker run --rm --entrypoint sh jzakotnik/openlibry:latest -c 'id -u'
# Ausgabe: 1000

# Ordner mit richtigen Berechtigungen erstellen
mkdir -p database
sudo chown 1000:1000 database
```

## Mehrere Instanzen

Du kannst mehrere OpenLibry-Instanzen auf einem Server betreiben:

```yaml title="docker-compose.yml"
services:
  bibliothek-nord:
    container_name: openlibry-nord
    image: jzakotnik/openlibry:release
    ports:
      - "3001:3000"
    volumes:
      - ./nord/database:/app/database
    env_file:
      - ./nord/.env
    restart: unless-stopped

  bibliothek-sued:
    container_name: openlibry-sued
    image: jzakotnik/openlibry:release
    ports:
      - "3002:3000"
    volumes:
      - ./sued/database:/app/database
    env_file:
      - ./sued/.env
    restart: unless-stopped
```

Jede Instanz hat ihre eigene Datenbank und Konfiguration.

## Nächste Schritte

- [Erste Einrichtung](../getting-started/first-steps.md) – Admin-Nutzer anlegen
- [Konfiguration](../configuration/index.md) – Alle Einstellungen
- [nginx & pm2](nginx-pm2.md) – HTTPS und eigene Domain
