# Nutzerverwaltung

Hier verwaltest du alle Ausleiher: Schüler, Lehrer und andere Bibliotheksnutzer.

## Nutzer anzeigen

Klicke auf **Nutzer** in der Navigation. Du siehst alle Nutzer mit:

- Name (Nachname, Vorname)
- Klasse
- Anzahl ausgeliehener Bücher
- Status (aktiv/inaktiv)

### Suchen

Das Suchfeld durchsucht:

- Vorname
- Nachname
- Klasse
- Ausweisnummer

## Nutzer anlegen

1. Klicke auf das **+** Symbol
2. Fülle aus:
   - **Vorname** (Pflicht)
   - **Nachname** (Pflicht)
   - **Klasse** (z.B. "3a")
   - Optional: Lehrkraft, E-Mail
3. Klicke **Speichern**

!!! tip "E-Mail"
    Die E-Mail wird für automatische Mahnungen verwendet. Meist ist das die E-Mail der Eltern.

## Nutzer bearbeiten

1. Klicke auf einen Nutzer
2. Ändere die gewünschten Felder
3. Klicke **Speichern**

## Nutzer löschen

1. Öffne den Nutzer
2. Klicke auf **Löschen**
3. Bestätige

!!! warning "Ausgeliehene Bücher"
    Ein Nutzer mit ausgeliehenen Büchern kann nicht gelöscht werden. Erst alle Bücher zurückgeben!

## Mehrere Nutzer auswählen

Du kannst mehrere Nutzer gleichzeitig auswählen:

1. Aktiviere die Checkboxen links
2. Wähle die gewünschten Nutzer aus
3. Nutze die Gruppenaktionen oben

### Gruppenaktionen

- **Löschen**: Alle markierten Nutzer löschen
- **+1 Klasse**: Klassenstufe erhöhen

## Klassenerhöhung

Am Schuljahresende müssen die Klassen aktualisiert werden:

1. Filtere nach einer Klasse (z.B. "3")
2. Markiere alle Nutzer dieser Klasse
3. Klicke auf **+1**
4. Aus "3a" wird "4a", aus "3b" wird "4b", etc.

!!! info "So funktioniert's"
    OpenLibry erhöht nur den Zahlenanteil. "3a" → "4a", "Klasse 2" → "Klasse 3"

### Was ist mit Abgängern?

Nutzer der höchsten Klasse (z.B. 4. Klasse in der Grundschule):

1. Alle ausstehenden Bücher zurückfordern
2. Nutzer löschen oder als inaktiv markieren

## Benutzerausweise

Du kannst Ausweise mit Barcodes drucken:

1. Gehe zu **Reports**
2. Wähle **Ausweise**
3. Wähle die Nutzer (Klasse oder alle)
4. Klicke **Erzeuge PDF**
5. Drucke und schneide aus

Mehr Details: [Benutzerausweise konfigurieren](../configuration/user-cards.md)

## Wichtige Felder

| Feld | Beschreibung |
|------|--------------|
| **Vorname** | Pflichtfeld |
| **Nachname** | Pflichtfeld |
| **Klasse** | z.B. "3a", "Klasse 2", "Vorschule" |
| **Lehrkraft** | Name der Klassenlehrerin |
| **E-Mail** | Für Mahnungen (meist Eltern-E-Mail) |
| **Aktiv** | Inaktive Nutzer können nichts ausleihen |

## Ausweisnummern

Jeder Nutzer bekommt automatisch eine **Ausweisnummer** (ID). Diese:

- Wird für den Barcode verwendet
- Ist nicht änderbar
- Kann beim Import vorgegeben werden

## Massenimport

Für viele Nutzer auf einmal:

1. Erstelle eine Excel-Datei mit Nutzerdaten
2. Gehe zu **Reports** → **Excel Import**
3. Lade die Datei hoch

Mehr Details: [Excel-Import](../import/excel-generic.md)

!!! tip "Schülerlisten"
    Frag im Sekretariat nach der Schülerliste als Excel. Die lässt sich meist direkt importieren.

## Nächste Schritte

- [Benutzerausweise konfigurieren](../configuration/user-cards.md)
- [Excel-Import](../import/excel-generic.md)
- [Mahnschreiben](../configuration/reminders.md)
