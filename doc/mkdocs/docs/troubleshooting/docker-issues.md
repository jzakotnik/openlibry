# Docker-Probleme

Lösungen für häufige Docker-Probleme.

## Container startet nicht

### Fehler: Port bereits belegt

```
Error: bind: address already in use
```

**Lösung**: Anderen Port verwenden:

```yaml
ports:
  - "3001:3000"  # Host-Port ändern
```

### Fehler: Permission denied

```
EACCES: permission denied
```

**Lösung**: Berechtigungen des database-Ordners prüfen:

```bash
# User-ID im Container
docker run --rm --entrypoint sh jzakotnik/openlibry:latest -c 'id -u'

# Ordner-Rechte anpassen
sudo chown 1000:1000 database
```

## Datenbank wird nicht gespeichert

Prüfe das Volume-Mounting in `docker-compose.yml`:

```yaml
volumes:
  - ./database:/app/database
```

Der Pfad `./database` muss existieren und schreibbar sein.

## Image wird nicht gefunden

```bash
# Image manuell herunterladen
docker pull jzakotnik/openlibry:release
```

## Container-Logs leer

```bash
# Live-Logs anzeigen
docker logs -f openlibry

# Letzte 100 Zeilen
docker logs --tail 100 openlibry
```

## Speicherplatz voll

```bash
# Ungenutzte Images löschen
docker image prune -a

# Build-Cache leeren
docker builder prune

# Alles aufräumen (Vorsicht!)
docker system prune -a
```

## Updates funktionieren nicht

```bash
# Image komplett neu laden
docker compose pull
docker compose up -d --force-recreate
```
