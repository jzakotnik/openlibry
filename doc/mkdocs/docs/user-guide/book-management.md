# Bücherverwaltung

Hier verwaltest du den Bestand deiner Bibliothek: Bücher anlegen, bearbeiten, suchen und löschen.

## Bücher anzeigen

Klicke auf **Bücher** in der Navigation. Du siehst eine Liste aller Bücher mit:

- Cover-Bild (falls vorhanden)
- Titel und Autor
- Mediennummer
- Ausleihstatus

### Suchen und Filtern

Das Suchfeld oben durchsucht:

- Titel
- Autor
- Mediennummer
- ISBN
- Schlagworte

Einfach lostippen – die Ergebnisse erscheinen sofort.

## Buch anlegen

### Manuell

1. Klicke auf das **+** Symbol
2. Fülle die Felder aus:
   - **Titel** (Pflicht)
   - **Autor** (Pflicht)
   - Weitere Felder optional
3. Klicke **Speichern**

### Mit ISBN

Wenn du eine ISBN hast:

1. Klicke auf **+**
2. Gib die ISBN ein
3. Klicke auf **Suchen** oder **Cover laden**
4. Metadaten werden automatisch gefüllt
5. Prüfen und **Speichern**

!!! tip "ISBN-Suche"
    Die ISBN-Suche nutzt OpenLibrary und die Deutsche Nationalbibliothek. Nicht alle Bücher werden gefunden, besonders ältere oder seltene Titel.

## Buch bearbeiten

1. Klicke auf ein Buch in der Liste
2. Die Detailansicht öffnet sich
3. Ändere die gewünschten Felder
4. Klicke **Speichern**

### Wichtige Felder

| Feld | Beschreibung |
|------|--------------|
| **Titel** | Der Buchtitel (Pflicht) |
| **Autor** | Name des Autors (Pflicht) |
| **ISBN** | Für Cover-Suche und Identifikation |
| **Schlagworte** | Für Filter, mit Semikolon getrennt |
| **Zusammenfassung** | Kurzbeschreibung |
| **Min/Max Alter** | Altersempfehlung |

### Cover-Bild hinzufügen

**Automatisch per ISBN:**
1. ISBN eingeben
2. Cover wird automatisch gesucht

**Manuell hochladen:**
1. Klicke auf "Bild hochladen"
2. Wähle ein Bild von deinem Computer
3. Das Bild wird gespeichert

**Per URL:**
1. Füge einen Link zu einem Cover-Bild ein
2. Das Bild wird verlinkt

## Buch löschen

1. Öffne das Buch
2. Klicke auf **Löschen**
3. Bestätige die Nachfrage

!!! warning "Achtung"
    Gelöschte Bücher sind unwiderruflich weg. Die Ausleihhistorie bleibt erhalten, aber das Buch selbst ist nicht wiederherstellbar.

## Ausleihstatus

Bücher können verschiedene Status haben:

| Status | Bedeutung |
|--------|-----------|
| **Verfügbar** | Kann ausgeliehen werden |
| **Ausgeliehen** | Ist gerade verliehen |
| **Beschädigt** | Muss repariert werden |
| **Verloren** | Wurde nicht zurückgegeben |
| **Bestellt** | Noch nicht eingetroffen |
| **Vorführung** | Ausgestellt, nicht verleihbar |

Den Status kannst du manuell ändern (außer "Ausgeliehen" – das passiert automatisch).

## Schlagworte

Schlagworte helfen beim Filtern und Organisieren:

- Mehrere Schlagworte mit **Semikolon** trennen
- Beispiel: `Abenteuer;Fantasy;Kinderbuch`
- Schlagworte erscheinen im Filter unter Reports

### Tipps für Schlagworte

- Einheitliche Schreibweise verwenden
- Nicht zu viele pro Buch (3-5 reichen)
- Genres, Themen, Altersgruppen funktionieren gut

## Mediennummern

Jedes Buch bekommt automatisch eine eindeutige **Mediennummer** (ID). Diese:

- Wird für den Barcode verwendet
- Ist nicht änderbar
- Wird beim Anlegen vergeben

!!! info "Eigene Nummern?"
    Du kannst beim Import eigene Mediennummern vergeben. Nach dem Anlegen sind sie aber fix.

## Einzelnes Etikett drucken

Direkt aus der Buch-Detailansicht:

1. Öffne ein Buch
2. Klicke auf **Etikett drucken**
3. Ein PDF mit einem einzelnen Etikett wird erstellt

Praktisch für neu erfasste Bücher!

## Mehrere Bücher gleichzeitig

Für Massenoperationen:

- [Excel-Import](../import/excel-generic.md) für viele neue Bücher
- [Reports → Bücherliste](reports.md) für Export aller Bücher
- [Reports → Etiketten](reports.md) für mehrere Etiketten auf einmal

## Nächste Schritte

- [Nutzerverwaltung](user-management.md)
- [Bücherlabels konfigurieren](../configuration/book-labels.md)
- [Excel-Import](../import/excel-generic.md)
