# Konfiguration

OpenLibry an deine Bedürfnisse anpassen.

## Übersicht

Die meisten Einstellungen werden über **Umgebungsvariablen** in der `.env`-Datei gesteuert.

| Bereich | Beschreibung |
|---------|--------------|
| [Umgebungsvariablen](environment-variables.md) | Vollständige Referenz aller Einstellungen |
| [Bücherlabels](book-labels.md) | Etiketten für Bücher anpassen |
| [Benutzerausweise](user-cards.md) | Ausweise gestalten |
| [Mahnschreiben](reminders.md) | Mahnungs-Template anpassen |
| [Antolin](antolin.md) | Antolin-Integration einrichten |
| [Authentifizierung](authentication.md) | Login und Benutzer |

## Schnellstart

### .env-Datei finden

Je nach Installation:

- **Bare Metal**: Im OpenLibry-Verzeichnis
- **Docker**: Im Verzeichnis mit `docker-compose.yml`

### Änderungen vornehmen

1. `.env`-Datei öffnen
2. Einstellung ändern
3. Speichern
4. OpenLibry neu starten

```bash
# Bare Metal
pm2 restart openlibry

# Docker
docker restart openlibry
```

## Die wichtigsten Einstellungen

```env
# Ausleihzeiten
RENTAL_DURATION_DAYS=21      # Leihfrist in Tagen
EXTENSION_DURATION_DAYS=14   # Verlängerung in Tagen
MAX_EXTENSIONS=2             # Max. Anzahl Verlängerungen

# Authentifizierung
AUTH_ENABLED=true            # Login erforderlich?
NEXTAUTH_SECRET=geheim123        # Geheimnis für Sessions

# Schule
SCHOOL_NAME="Meine Schule"   # Name auf Dokumenten
```

## Nächste Schritte

- [Alle Umgebungsvariablen](environment-variables.md)
- [Bücherlabels anpassen](book-labels.md)
