# Container-Installation (Docker)

Diese Anleitung führt dich durch die Installation von OpenLibry mit Docker. Am Ende läuft OpenLibry unter `http://localhost:3000`.

**Willst du HTTPS mit eigener Domain?** Folge erst dieser Anleitung, dann [nginx & SSL](nginx-ssl.md).

## Voraussetzungen

- Linux-Server oder Desktop (Ubuntu, Debian, Raspberry Pi OS)
- Mindestens 1 GB RAM
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

## Schritt 2: OpenLibry vorbereiten

```bash
# Verzeichnis erstellen
mkdir -p ~/openlibry
cd ~/openlibry

# Environment-Datei anlegen
cat > .env << 'EOF'
AUTH_ENABLED=false
NEXTAUTH_SECRET=dein-geheimer-schluessel-hier
DATABASE_URL=file:/app/database/dev.db
EOF
```

**Tipp**: Generiere einen sicheren NEXTAUTH_SECRET mit `openssl rand -base64 32`.

## Schritt 3: OpenLibry starten

### Variante A: Zum Testen (Sandbox)

Ideal zum Ausprobieren – Container wird nach Beenden gelöscht:

```bash
docker run --rm -p 3000:3000 \
  -v "$(pwd)/database:/app/database" \
  --env-file .env \
  jzakotnik/openlibry:latest
```

Öffne `http://localhost:3000` im Browser. Mit `Strg+C` beenden.

### Variante B: Dauerhaft (Produktiv)

Erstelle eine `docker-compose.yml`:

```yaml
services:
  openlibry:
    image: jzakotnik/openlibry:latest
    container_name: openlibry
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - ./database:/app/database
      - ./public/logo.png:/app/public/logo.png
      - ./public/mahnung-template.docx:/app/public/mahnung-template.docx
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
