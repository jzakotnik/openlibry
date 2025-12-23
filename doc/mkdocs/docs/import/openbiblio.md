# OpenBiblio Migration

Du nutzt das alte [OpenBiblio](https://openbiblio.de/)? So migrierst du alle Daten zu OpenLibry.

!!! warning "Fortgeschritten"
    Diese Anleitung erfordert Kenntnisse in SQL, Docker/Podman und der Kommandozeile. Falls du unsicher bist, hol dir Hilfe von jemandem mit IT-Erfahrung.

## Übersicht

OpenBiblio speichert Daten in einer MySQL-Datenbank mit einem speziellen Schema. Wir:

1. Starten eine temporäre MySQL-Instanz
2. Importieren die alten Daten
3. Exportieren als JSON
4. Importieren in OpenLibry via API

## Voraussetzungen

- OpenBiblio-Backup (MySQL-Dateien)
- Docker oder Podman installiert
- Laufende OpenLibry-Installation

## Schritt 1: MySQL-Container starten

Erstelle eine `docker-compose.yaml`:

```yaml title="docker-compose.yaml"
version: "3.1"
services:
  db:
    container_name: mysql-server-db
    image: biarms/mysql:5.7
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: test_db
    ports:
      - "3308:3306"
  phpmyadmin:
    image: phpmyadmin/phpmyadmin:latest
    restart: always
    environment:
      PMA_HOST: db
      PMA_USER: root
      PMA_PASSWORD: root
    ports:
      - "8080:80"
```

Starten:

```bash
docker compose up -d
# oder mit podman:
podman-compose -f docker-compose.yaml up
```

## Schritt 2: OpenBiblio-Daten importieren

### Datenbank erstellen

1. Öffne phpMyAdmin: [http://localhost:8080](http://localhost:8080)
2. Erstelle eine Datenbank namens `openbiblio`

### Dateien kopieren

Kopiere die OpenBiblio-Backup-Dateien in den Container:

```bash
# Für jede Tabellen-Datei (Beispiel):
docker cp ./input/member.frm mysql-server-db:/var/lib/mysql/openbiblio/
docker cp ./input/member.MYD mysql-server-db:/var/lib/mysql/openbiblio/
docker cp ./input/member.MYI mysql-server-db:/var/lib/mysql/openbiblio/

# Wiederholen für: biblio, biblio_copy, biblio_field, biblio_status_hist, etc.
```

### Berechtigungen setzen

```bash
docker exec -it mysql-server-db /bin/bash
chown mysql /var/lib/mysql/openbiblio/*
exit
```

## Schritt 3: Daten als JSON exportieren

In phpMyAdmin:

!!! warning "Wichtig: Sortiert exportieren!"
    Exportiere die Daten sortiert nach `create_dt` (älteste zuerst), damit die Ausleihhistorie stimmt.

### Member exportieren

1. SQL ausführen: `SELECT * FROM member ORDER BY member.create_dt ASC`
2. Export → JSON
3. Als `member.json` speichern

### Bücher exportieren

Exportiere diese Tabellen als JSON:

- `biblio` → `biblio.json`
- `biblio_field` → `biblio_field.json`
- `biblio_copy` → `biblio_copy.json`
- `biblio_status_hist` → `biblio_status_hist.json`

### JSON zusammenführen

Erstelle eine Datei `book_all.json` mit dieser Struktur:

```json
{
  "biblio": [ /* Inhalt von biblio.json */ ],
  "biblio_field": [ /* Inhalt von biblio_field.json */ ],
  "biblio_copy": [ /* Inhalt von biblio_copy.json */ ],
  "biblio_status_hist": [ /* Inhalt von biblio_status_hist.json */ ]
}
```

!!! tip "Validieren"
    Prüfe das JSON mit einem [Validator](https://jsonformatter.curiousconcept.com/), bevor du importierst.

## Schritt 4: In OpenLibry importieren

### OpenLibry vorbereiten

Falls du eine frische Installation möchtest:

```bash
cd openlibry
rm database/dev.db
rm -rf prisma/migrations
npx prisma migrate dev --name init
npm run dev
```

### Nutzer importieren

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d @member.json \
  http://localhost:3000/api/openbiblioimport/migrateUsers
```

### Bücher importieren

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d @book_all.json \
  http://localhost:3000/api/openbiblioimport/migrateBooks
```

## Migrierte Felder

### Bücher

OpenBiblio-Felder werden so übertragen:

| OpenBiblio | OpenLibry |
|------------|-----------|
| 20a | isbn |
| 20c | supplierComment (Beschaffungsangaben) |
| 250a | editionDescription (Ausgabebezeichnung) |
| 260a | publisherLocation (Erscheinungsort) |
| 260b | publisherName (Verlag) |
| 260c | publisherDate (Erscheinungsjahr) |
| 300a | pages (Umfang) |
| 300b | otherPhysicalAttributes |
| 300c | physicalSize (Ausmaße) |
| 300e | additionalMaterial (Begleitmaterial) |
| 520a | summary (Zusammenfassung) |
| 541h | price (Kaufpreis) |
| 901a | minPlayers |
| 901c | minAge |
| 901d | maxAge |

### Ausleihstatus

| OpenBiblio | OpenLibry |
|------------|-----------|
| in | available |
| out | rented |
| mnd | broken |
| dis | presentation |
| hld | ordered |
| lst | lost |
| ln | remote |
| ord | ordered |
| crt | available |

## Fehlerbehebung

### "Body exceeds limit"

Die maximale Importgröße ist auf 250 MB begrenzt. Anpassen:

```env
MAX_MIGRATION_SIZE=500
```

### Import bricht ab

- JSON validieren
- Kleinere Batches versuchen
- Logs prüfen

### Ausleihhistorie stimmt nicht

- Sortierung prüfen (älteste zuerst)
- `biblio_status_hist` vollständig exportiert?

## Nach der Migration

1. ✅ Stichproben prüfen (Bücher, Nutzer, aktuelle Ausleihen)
2. ✅ Backup der neuen Datenbank erstellen
3. ✅ Container aufräumen: `docker compose down`
4. ✅ Cover-Bilder per ISBN nachladen

## Hilfe

Bei Problemen:

- [GitHub Issues](https://github.com/jzakotnik/openlibry/issues)
- [E-Mail](mailto:info@openlibry.de)
