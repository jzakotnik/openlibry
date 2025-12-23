# Updates & Upgrades

Wie du OpenLibry auf dem neuesten Stand hältst.

## Bevor du updatest

!!! warning "Backup machen!"
    Erstelle **immer** ein Backup deiner Datenbank, bevor du updatest!
    
    ```bash
    cp database/dev.db database/dev.db.backup
    ```

## Docker Updates

### Einzelnes Update

```bash
# In das Projektverzeichnis wechseln
cd /pfad/zu/openlibry

# Neues Image herunterladen
docker compose pull

# Container mit neuem Image neu starten
docker compose up -d
```

### Version prüfen

Nach dem Update:

1. Öffne OpenLibry im Browser
2. Schau unten in der Fußzeile – dort steht die Version

### Automatische Updates mit Watchtower

Watchtower prüft regelmäßig auf neue Images und aktualisiert automatisch:

```yaml title="docker-compose.yml"
services:
  openlibry:
    image: jzakotnik/openlibry:release
    # ... deine anderen Einstellungen ...

  watchtower:
    image: containrrr/watchtower
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    command: --interval 86400 openlibry
    restart: unless-stopped
```

- `--interval 86400` = Prüft einmal täglich (86400 Sekunden)
- `openlibry` = Name des Containers, der aktualisiert werden soll

## Bare Metal Updates

### Manuelles Update

```bash
cd /pfad/zu/openlibry

# Backup erstellen
cp database/dev.db database/dev.db.backup

# Änderungen holen
git pull

# Abhängigkeiten aktualisieren
npm install

# Datenbank-Schema aktualisieren
npx prisma db push

# Neu bauen (für Produktionsmodus)
npm run build

# Neu starten
pm2 restart openlibry
```

### Update-Skript

Erstelle ein praktisches Update-Skript:

```bash title="update.sh"
#!/bin/bash
set -e  # Bei Fehlern abbrechen

OPENLIBRY_DIR="/pfad/zu/openlibry"
BACKUP_DIR="/pfad/zu/backups"
DATE=$(date +%Y%m%d_%H%M%S)

echo "🔄 OpenLibry Update startet..."

# Backup erstellen
echo "📦 Erstelle Backup..."
mkdir -p $BACKUP_DIR
cp $OPENLIBRY_DIR/database/dev.db $BACKUP_DIR/dev_$DATE.db

# Update durchführen
cd $OPENLIBRY_DIR
echo "⬇️ Lade Änderungen..."
git pull

echo "📚 Installiere Abhängigkeiten..."
npm install

echo "🗄️ Aktualisiere Datenbank..."
npx prisma db push

echo "🔨 Baue Produktionsversion..."
npm run build

echo "🔄 Starte neu..."
pm2 restart openlibry

echo "✅ Update abgeschlossen!"
echo "📦 Backup gespeichert unter: $BACKUP_DIR/dev_$DATE.db"
```

```bash
chmod +x update.sh
./update.sh
```

## Datenbank-Migrationen

Bei größeren Updates kann sich das Datenbank-Schema ändern. OpenLibry verwendet Prisma für Migrationen.

### Automatisch (empfohlen)

```bash
npx prisma db push
```

Dieser Befehl:

- Prüft Unterschiede zwischen Schema und Datenbank
- Führt notwendige Änderungen durch
- Behält bestehende Daten (wenn möglich)

### Bei Problemen

Falls die automatische Migration fehlschlägt:

1. **Backup prüfen** – Ist das Backup vorhanden?
2. **Logs lesen** – Was sagt die Fehlermeldung?
3. **Manuell migrieren** – Siehe unten

```bash
# Schema-Differenz anzeigen
npx prisma db push --dry-run

# Mit Force-Flag (Vorsicht: kann Daten löschen!)
npx prisma db push --force-reset
```

!!! danger "Vorsicht mit --force-reset"
    Dieses Flag löscht alle Daten und erstellt die Datenbank neu. Nur verwenden, wenn du ein Backup hast!

## Rollback

Falls ein Update Probleme macht:

### Docker Rollback

```bash
# Letzte funktionierende Version verwenden
docker compose down
docker compose pull jzakotnik/openlibry:v1.2.3  # Spezifische Version
docker compose up -d
```

### Bare Metal Rollback

```bash
cd /pfad/zu/openlibry

# Backup zurückspielen
cp database/dev.db.backup database/dev.db

# Auf vorherige Version zurückgehen
git checkout v1.2.3  # Spezifische Version

# Abhängigkeiten für diese Version installieren
npm install

# Neu bauen
npm run build

# Neu starten
pm2 restart openlibry
```

## Release-Kanäle

OpenLibry hat verschiedene Release-Kanäle:

| Tag | Beschreibung | Empfohlen für |
|-----|--------------|---------------|
| `release` | Stabile, getestete Version | Produktion |
| `latest` | Neueste Version | Mutiges Testen |
| `v1.2.3` | Spezifische Version | Wenn du Kontrolle brauchst |

### Docker-Tag ändern

```yaml title="docker-compose.yml"
services:
  openlibry:
    image: jzakotnik/openlibry:release  # Stabiler Kanal
    # image: jzakotnik/openlibry:latest  # Neueste
    # image: jzakotnik/openlibry:v1.2.3  # Spezifisch
```

## Changelog prüfen

Bevor du updatest, schau in den Changelog:

- [GitHub Releases](https://github.com/jzakotnik/openlibry/releases)
- [Changelog in der Dokumentation](../reference/changelog.md)

Dort findest du:

- Neue Features
- Behobene Bugs
- Breaking Changes (erfordern Anpassungen)

## Best Practices

1. **Regelmäßig updaten** – Sicherheitsupdates sind wichtig
2. **Immer Backups machen** – Vor jedem Update
3. **Changelog lesen** – Besonders bei Major-Versionen
4. **Erst testen** – Wenn möglich, in einer Testumgebung
5. **Zeitpunkt wählen** – Nicht während der Ausleihe updaten

## Hilfe bei Problemen

- [Fehlerbehebung](../troubleshooting/index.md)
- [GitHub Issues](https://github.com/jzakotnik/openlibry/issues)
- [E-Mail](mailto:info@openlibry.de)
