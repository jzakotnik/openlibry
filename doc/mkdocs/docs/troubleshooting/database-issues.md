# Datenbank-Probleme

Lösungen für Datenbank-Fehler.

## Datenbank ist beschädigt

**Symptom**: Fehlermeldungen wie "database disk image is malformed"

**Lösung 1**: Aus Backup wiederherstellen

```bash
cp database/dev.db.backup database/dev.db
pm2 restart openlibry
```

**Lösung 2**: Datenbank reparieren versuchen

```bash
sqlite3 database/dev.db "PRAGMA integrity_check;"
```

## Migration fehlgeschlagen

Nach einem Update:

```bash
# Schema neu synchronisieren
npx prisma db push

# Bei Problemen: Force-Reset (LÖSCHT ALLE DATEN!)
npx prisma db push --force-reset
```

## Datenbank ist gesperrt

**Symptom**: "database is locked"

**Ursache**: Mehrere Prozesse greifen gleichzeitig zu

**Lösung**: Nur eine OpenLibry-Instanz pro Datenbank

```bash
# Laufende Prozesse prüfen
lsof database/dev.db
```

## Datenbank zu groß

SQLite kann mehrere GB verarbeiten, aber:

```bash
# Datenbank-Größe prüfen
ls -lh database/dev.db

# Datenbank optimieren
sqlite3 database/dev.db "VACUUM;"
```

## Daten verschwunden

1. Prüfe, ob die richtige Datenbank-Datei verwendet wird
2. Prüfe den `DATABASE_URL` in `.env`
3. Bei Docker: Volume-Mounting prüfen
