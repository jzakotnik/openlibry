# Import aus "Meine Bibliothek" (Android)

Du hast deine Bücher bisher mit der Android-App "Meine Bibliothek" verwaltet? So überträgst du sie zu OpenLibry.

## Übersicht

"Meine Bibliothek" ist eine beliebte Android-App zur Buchverwaltung. Die App kann Daten als CSV exportieren, die wir für OpenLibry aufbereiten.

## Schritt 1: Export aus der App

1. Öffne "Meine Bibliothek" auf deinem Android-Gerät
2. Gehe zu **Einstellungen** (Zahnrad-Symbol)
3. Wähle **Export**
4. Wähle **CSV-Export**
5. Speichere die Datei (z.B. `meine_bibliothek_export.csv`)
6. Übertrage die Datei auf deinen Computer

## Schritt 2: CSV in Excel umwandeln

Die exportierte CSV muss für OpenLibry angepasst werden.

### In Excel oder LibreOffice öffnen

1. Öffne die CSV-Datei
2. Wähle bei der Importauswahl:
   - Kodierung: UTF-8
   - Trennzeichen: Semikolon oder Komma (je nach App-Version)

### Spalten umbenennen

Benenne die Spalten entsprechend der OpenLibry-Struktur um:

| Meine Bibliothek | OpenLibry |
|------------------|-----------|
| Title | Titel |
| Author | Autor |
| ISBN | ISBN |
| Publisher | Verlag |
| Year | Publikationsdatum |
| Description | Zusammenfassung |
| Genre / Category | Schlagworte |
| Pages | Seiten |
| Rating | *(nicht übertragbar)* |
| Notes | *(zu Zusammenfassung hinzufügen)* |

!!! info "Spalten variieren"
    Je nach App-Version können die Spalten anders heißen. Prüfe die exportierte Datei.

### Leeres Blatt für Nutzer hinzufügen

OpenLibry erwartet ein zweites Blatt mit Nutzern:

1. Erstelle ein neues Blatt
2. Benenne es "Userliste"
3. Füge mindestens die Überschriften hinzu: `Vorname`, `Nachname`, `Klasse`
4. (Das Blatt kann auch leer bleiben)

### Als XLSX speichern

1. Datei → Speichern unter
2. Format: Excel-Arbeitsmappe (.xlsx)
3. Speichern

## Schritt 3: Import in OpenLibry

1. Gehe zu **Reports** → **Excel Import**
2. Lade die angepasste Excel-Datei hoch
3. Prüfe die Vorschau
4. Klicke **In die Datenbank importieren**

## Feldmapping im Detail

### Übertragbare Felder

| Meine Bibliothek | OpenLibry | Hinweise |
|------------------|-----------|----------|
| Title | Titel | Pflichtfeld |
| Author | Autor | Pflichtfeld |
| ISBN | ISBN | Für Cover-Suche |
| Publisher | Verlag | |
| Year | Publikationsdatum | |
| Description | Zusammenfassung | |
| Genre | Schlagworte | Mit Semikolon trennen |
| Pages | Seiten | |
| Location | *(nicht direkt)* | Als Schlagwort möglich |
| Notes | *(nicht direkt)* | An Zusammenfassung anhängen |

### Nicht übertragbare Felder

Diese Felder von "Meine Bibliothek" haben kein Äquivalent in OpenLibry:

- **Rating/Bewertung**: OpenLibry hat keine Bewertungen
- **Read/Gelesen**: OpenLibry trackt nur Ausleihen, nicht gelesene Bücher
- **Wishlist**: Keine Wunschliste-Funktion
- **Loan Status**: Muss neu erfasst werden

## Häufige Probleme

### Umlaute werden falsch dargestellt

**Problem**: ä erscheint als Ã¤, ö als Ã¶, etc.

**Lösung**: CSV mit UTF-8 öffnen:
1. In Excel: Daten → Aus Text/CSV → Datei wählen → Kodierung: UTF-8
2. In LibreOffice: Beim Öffnen UTF-8 auswählen

### Mehrere Autoren

**Problem**: "Autor 1; Autor 2" wird nicht richtig erkannt

**Lösung**: OpenLibry erwartet Autoren als einfachen Text. Das Format ist frei wählbar:
- "Max Mustermann, Anna Musterfrau"
- "Mustermann, M. / Musterfrau, A."

### Cover-Bilder fehlen

**Problem**: Covers aus der App werden nicht übertragen

**Lösung**: Covers werden in "Meine Bibliothek" extern gespeichert und nicht exportiert. 

Nach dem Import kannst du Cover per ISBN nachladen:
1. Buch öffnen
2. ISBN eingeben
3. "Cover laden" klicken

Siehe auch: [ISBN & Cover-Suche](isbn-lookup.md)

### Genres zu Schlagworten konvertieren

"Meine Bibliothek" hat oft mehrere Genres/Kategorien. Für OpenLibry:

1. Alle Genres in eine Spalte zusammenfassen
2. Mit Semikolon trennen: `Fantasy;Jugendbuch;Abenteuer`

## Beispiel

### Original aus "Meine Bibliothek"

```csv
Title;Author;ISBN;Publisher;Year;Genre
Harry Potter und der Stein der Weisen;J.K. Rowling;978-3-551-55167-2;Carlsen;1998;Fantasy
```

### Angepasst für OpenLibry

```
Titel;Autor;ISBN;Verlag;Publikationsdatum;Schlagworte
Harry Potter und der Stein der Weisen;J.K. Rowling;978-3-551-55167-2;Carlsen;1998;Fantasy;Jugendbuch
```

## Nächste Schritte

- [ISBN & Cover-Suche](isbn-lookup.md) – Cover für importierte Bücher nachladen
- [Bücherlabels drucken](../user-guide/reports.md) – Etiketten erstellen
