# Excel Export

Exportiere alle Daten aus OpenLibry in eine Excel-Datei.

## So geht's

1. Gehe zu **Reports**
2. Klicke auf **Excel Export** (oder direkt: `/api/excel`)
3. Eine `.xlsx`-Datei wird heruntergeladen

## Inhalt der Datei

Die Excel-Datei enthält zwei Blätter:

### Blatt 1: Bücherliste

Alle Bücher mit folgenden Spalten:

| Spalte | Beschreibung |
|--------|--------------|
| Mediennummer | Eindeutige ID des Buchs |
| Erzeugt am | Datum der Erfassung |
| Update am | Letzte Änderung |
| Ausleihstatus | available, rented, etc. |
| Ausgeliehen am | Datum der aktuellen Ausleihe |
| Rückgabe am | Fälligkeitsdatum |
| Anzahl Verlängerungen | Wie oft verlängert |
| Titel | Buchtitel |
| Untertitel | Untertitel |
| Autor | Autorname |
| Schlagworte | Tags, Semikolon-getrennt |
| Bild | URL zum Cover |
| ISBN | ISBN-10 oder ISBN-13 |
| Edition | Ausgabebezeichnung |
| Verlagsort | Ort des Verlags |
| Seiten | Seitenzahl |
| Zusammenfassung | Kurzbeschreibung |
| Verlag | Verlagsname |
| Publikationsdatum | Erscheinungsjahr |
| Min Alter / Max Alter | Altersempfehlung |
| Preis | Kaufpreis |
| Ausgeliehen von | Nutzer-ID (falls ausgeliehen) |

### Blatt 2: Userliste

Alle Nutzer mit folgenden Spalten:

| Spalte | Beschreibung |
|--------|--------------|
| Erzeugt am | Datum der Erfassung |
| Update am | Letzte Änderung |
| Nummer | Ausweisnummer |
| Nachname | Nachname |
| Vorname | Vorname |
| Klasse | z.B. "3a" |
| Lehrkraft | Name der Klassenlehrerin |
| Freigeschaltet | true/false |
| eMail | E-Mail-Adresse |

## Verwendungszwecke

### Als Backup

Der Excel-Export eignet sich als menschenlesbares Backup:

- Kann ohne OpenLibry geöffnet werden
- Alle Daten auf einen Blick
- Kann wieder importiert werden

!!! tip "Für echte Backups"
    Für regelmäßige Backups empfehlen wir das [Datenbank-Backup](backup-restore.md), da es schneller und zuverlässiger ist.

### Für Statistiken

In Excel kannst du:

- Nach Spalten sortieren und filtern
- Pivot-Tabellen erstellen
- Diagramme erstellen

Beispiele:

- Wie viele Bücher pro Schlagwort?
- Welche Klasse leiht am meisten?
- Wie ist die Altersverteilung der Bücher?

### Für die Schulleitung

Erstelle Berichte:

- Gesamtzahl Bücher
- Anzahl aktive Nutzer
- Ausleihhäufigkeit
- Verlustrate

### Für Migration

Falls du OpenLibry auf einem neuen Server installierst:

1. Export aus alter Installation
2. Import in neue Installation

## Automatischer Export (für Entwickler)

Der Export ist ein einfacher API-Aufruf:

```bash
curl -o export.xlsx http://localhost:3000/api/excel
```

### Automatisches Backup-Script

```bash title="weekly_export.sh"
#!/bin/bash
DATE=$(date +%Y%m%d)
BACKUP_DIR=/pfad/zu/backups

curl -o $BACKUP_DIR/export_$DATE.xlsx http://localhost:3000/api/excel
echo "Export erstellt: export_$DATE.xlsx"
```

Per Cronjob wöchentlich ausführen:

```bash
0 3 * * 0 /pfad/zu/weekly_export.sh
```

## Tipps

### Große Datenmengen

Bei sehr vielen Büchern (>10.000) kann der Export einige Sekunden dauern. Geduld!

### Datenschutz

Die Excel-Datei enthält personenbezogene Daten (Namen, E-Mails). Behandle sie entsprechend:

- Nicht unverschlüsselt per E-Mail senden
- Auf sicheren Systemen speichern
- Nach Verwendung löschen

### Regelmäßigkeit

Empfehlung: Mindestens monatlich exportieren, besser wöchentlich.

## Nächste Schritte

- [Backup & Restore](backup-restore.md) – Datenbank-Backup
- [Excel Import](../import/excel-generic.md) – Daten wieder importieren
