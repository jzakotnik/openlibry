# OpenLibry aktualisieren

Diese Anleitung zeigt, wie du OpenLibry auf eine neue Version aktualisierst.

## Vor dem Update

1. **Backup erstellen!** Sichere die Datenbank:
   ```bash
   cp database/dev.db database/dev.db.backup-$(date +%Y%m%d)
   ```

2. [Release Notes](https://github.com/jzakotnik/openlibry/releases) lesen – gibt es Breaking Changes?

## Container-Installation

```bash
cd ~/openlibry

# Neues Image holen
docker compose pull

# Container mit neuem Image starten
docker compose up -d

# Alte Images aufräumen (optional)
docker image prune
```

Das war's. Die Datenbank wird automatisch migriert.

## Installation ohne Container

```bash
cd ~/openlibry

# Änderungen sichern (falls vorhanden)
git stash

# Neueste Version holen
git pull

# Gesicherte Änderungen wieder anwenden
git stash pop

# Abhängigkeiten aktualisieren
npm install

# Datenbank-Schema aktualisieren
npx prisma db push

# Neu bauen
npm run build

# Neu starten
pm2 restart openlibry
```

## Nach dem Update

1. Anwendung im Browser testen
2. Einloggen prüfen
3. Eine Test-Ausleihe durchführen

## Rollback bei Problemen

### Container

```bash
# Vorherige Version starten
docker compose down
docker run -p 3000:3000 ... jzakotnik/openlibry:1.2.3  # alte Version

# Datenbank-Backup zurückspielen
cp database/dev.db.backup-DATUM database/dev.db
```

### Ohne Container

```bash
# Auf vorherigen Commit zurück
git log --oneline -10  # Commit-ID finden
git checkout <commit-id>

# Oder auf ein Tag
git checkout v1.2.3

# Datenbank-Backup zurückspielen
cp database/dev.db.backup-DATUM database/dev.db

# Neu bauen und starten
npm install
npm run build
pm2 restart openlibry
```

## Automatische Updates (optional)

Für Mutige: Ein Cronjob, der wöchentlich prüft und aktualisiert.

**Warnung**: Nur für unkritische Installationen. Besser manuell prüfen!

```bash
# Beispiel-Skript für Container
#!/bin/bash
cd ~/openlibry
docker compose pull
docker compose up -d
```
