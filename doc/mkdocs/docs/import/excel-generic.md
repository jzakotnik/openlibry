# Excel Import

Der einfachste Weg, viele Bücher und Nutzer auf einmal zu importieren.

## Übersicht

Der Excel-Import liest eine `.xlsx`-Datei mit zwei Blättern:

1. **Bücherliste** (erstes Blatt)
2. **Userliste** (zweites Blatt)

## Schritt für Schritt

### 1. Excel-Datei vorbereiten

Deine Excel-Datei muss das richtige Format haben. Am einfachsten: Mach erst einen **Excel-Export** aus OpenLibry und nutze diese Datei als Vorlage.

Oder lade die [Beispieldatei](../assets/sample_export.xlsx) herunter.

### 2. Spalten richtig benennen

Die erste Zeile muss die **Spaltennamen** enthalten. Die Namen müssen genau stimmen!

**Bücherliste** (wichtigste Spalten):

| Spaltenname | Beschreibung | Pflicht? |
|-------------|--------------|----------|
| Mediennummer | Eindeutige ID | Nein (wird sonst generiert) |
| Titel | Buchtitel | **Ja** |
| Autor | Name des Autors | **Ja** |
| ISBN | ISBN-13 oder ISBN-10 | Nein |
| Schlagworte | Mit Semikolon getrennt | Nein |
| Zusammenfassung | Kurzbeschreibung | Nein |
| Verlag | Name des Verlags | Nein |
| Publikationsdatum | Erscheinungsjahr | Nein |
| Min Alter | Empfohlenes Mindestalter | Nein |
| Max Alter | Empfohlenes Höchstalter | Nein |

**Userliste** (wichtigste Spalten):

| Spaltenname | Beschreibung | Pflicht? |
|-------------|--------------|----------|
| Nummer | Ausweisnummer | Nein (wird sonst generiert) |
| Vorname | Vorname | **Ja** |
| Nachname | Nachname | **Ja** |
| Klasse | z.B. "3a" | Nein |
| Lehrkraft | Name der Klassenlehrerin | Nein |
| eMail | E-Mail für Mahnungen | Nein |
| Freigeschaltet | true/false | Nein (Standard: true) |

!!! tip "Alle Spalten"
    Die vollständige Liste aller Spalten findest du im [Datenmodell](../reference/data-model.md).

### 3. Import durchführen

1. Gehe zu **Reports** → **Excel Import**
2. Klicke auf **Datei auswählen**
3. Wähle deine Excel-Datei

### 4. Vorschau prüfen

Nach dem Hochladen siehst du eine Vorschau:

- Anzahl der gefundenen Bücher
- Anzahl der gefundenen Nutzer
- Erste Zeilen zur Kontrolle

!!! warning "Genau hinschauen!"
    Prüfe die Vorschau sorgfältig. Stimmen die Spalten? Sind die Daten richtig zugeordnet?

### 5. Importieren

Wenn alles gut aussieht:

1. Klicke **In die Datenbank importieren**
2. Warte, bis der Import abgeschlossen ist
3. Prüfe in OpenLibry, ob alles stimmt

## Tipps

### Daten aus anderen Programmen

#### Microsoft Excel

Einfach als `.xlsx` speichern – fertig.

#### LibreOffice Calc

"Speichern unter" → "Excel 2007-365 (.xlsx)"

#### Google Sheets

Datei → Herunterladen → Microsoft Excel (.xlsx)

#### CSV-Dateien

1. In Excel öffnen
2. Spalten anpassen
3. Als `.xlsx` speichern

### Umlaute und Sonderzeichen

Achte auf die richtige Kodierung:

- Excel speichert normalerweise korrekt
- Bei CSV: UTF-8 verwenden
- Prüfe Umlaute (ä, ö, ü) in der Vorschau

### Große Datenmengen

Bei sehr vielen Büchern (>5000):

- Import kann einige Minuten dauern
- Nicht abbrechen!
- Bei Timeout: In kleineren Batches importieren

## Häufige Fehler

### "Spalte XY nicht gefunden"

→ Prüfe die Schreibweise der Spaltenüberschriften

### "Pflichtfeld fehlt"

→ Jedes Buch braucht Titel UND Autor, jeder Nutzer braucht Vorname UND Nachname

### "ID bereits vorhanden"

→ Mediennummern/Ausweisnummern müssen eindeutig sein

### Import bricht ab

Mögliche Ursachen:

- Datei zu groß (max. 250 MB, einstellbar via `MAX_MIGRATION_SIZE`)
- Ungültige Daten in einer Zeile
- Serverprobleme

Lösung:

1. Fehlermeldung genau lesen
2. Problematische Zeile finden und korrigieren
3. Erneut versuchen

## Beispiel-Workflow

Du hast eine handgeschriebene Liste mit 50 Büchern:

1. **Excel-Datei erstellen**: Titel und Autor eintragen
2. **Optional**: ISBN hinzufügen (für Cover)
3. **In OpenLibry importieren**
4. **Cover nachladen**: Per ISBN-Suche
5. **Schlagworte ergänzen**: Falls gewünscht
6. **Etiketten drucken**: Alle 50 auf einmal

Zeitaufwand: Ca. 1-2 Stunden für 50 Bücher (statt 5+ Stunden manuell)

## Nächste Schritte

- [ISBN & Cover-Suche](isbn-lookup.md) – Cover für importierte Bücher
- [Bücherverwaltung](../user-guide/book-management.md) – Bücher nachbearbeiten
- [Bücherlabels drucken](../user-guide/reports.md) – Etiketten für neue Bücher
