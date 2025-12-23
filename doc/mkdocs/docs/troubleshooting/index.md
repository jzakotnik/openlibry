# Fehlerbehebung

Etwas funktioniert nicht? Hier findest du Lösungen für häufige Probleme.

## Schnelle Hilfe

| Problem | Lösung |
|---------|--------|
| OpenLibry startet nicht | [Docker-Probleme](docker-issues.md) |
| Seite lädt nicht | Port prüfen, Firewall, Logs checken |
| Login funktioniert nicht | `AUTH_SECRET` prüfen, neu starten |
| Datenbank-Fehler | [Datenbank-Probleme](database-issues.md) |
| Alles ist langsam | [Performance](performance.md) |

## Allgemeine Tipps

### Logs prüfen

```bash
# Docker
docker logs openlibry

# pm2
pm2 logs openlibry
```

### Neustart hilft oft

```bash
# Docker
docker restart openlibry

# pm2
pm2 restart openlibry
```

### Backup vor Experimenten

```bash
cp database/dev.db database/dev.db.backup
```

## Häufige Probleme

- [Docker-Probleme](docker-issues.md)
- [Datenbank-Probleme](database-issues.md)
- [Performance](performance.md)

## Noch Hilfe nötig?

- **GitHub Issues**: [github.com/jzakotnik/openlibry/issues](https://github.com/jzakotnik/openlibry/issues)
- **E-Mail**: [info@openlibry.de](mailto:info@openlibry.de)
