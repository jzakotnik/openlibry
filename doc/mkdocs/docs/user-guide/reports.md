# Reports & Labels

Im Reports-Bereich findest du Übersichten, Statistiken und die Möglichkeit, Etiketten und Dokumente zu erstellen.

## Übersicht

Klicke auf **Reports** in der Navigation. Du siehst:

- Dashboard mit Schnellstatistiken
- Verschiedene Report-Karten zum Anklicken

## Dashboard

Das Dashboard zeigt dir auf einen Blick:

| Kachel | Zeigt |
|--------|-------|
| **Leihe** | Anzahl aktuell ausgeliehener Bücher |
| **Nutzerinnen** | Gesamtzahl aller Nutzer |
| **Bücher** | Gesamtzahl aller Bücher |
| **Verspätet** | Bücher über dem Rückgabedatum |

Darunter: Eine Schlagwort-Wolke mit den häufigsten Themen.

## Bücherlabel drucken

So druckst du Barcode-Etiketten für Bücher:

### Auswahl treffen

Du hast vier Möglichkeiten:

1. **Neueste Labels**: Gib eine Anzahl ein – OpenLibry wählt die neuesten Bücher
2. **ID-Bereich**: Definiere "Von ID" bis "Bis ID"
3. **Einzelnes Buch**: Gib eine spezifische ID ein
4. **Schlagwort-Filter**: Zusätzlich nach Schlagwort filtern

### PDF erstellen

1. Wähle deine Bücher aus
2. Klicke **Erzeuge PDF**
3. Ein PDF mit allen Etiketten wird erstellt
4. Drucke auf Etikettenpapier (z.B. AVERY Zweckform)

### Labels überspringen

Hast du einen Bogen, der schon teilweise benutzt ist?

1. Klicke **Überspringe Label**
2. Klicke auf die Labels, die leer bleiben sollen
3. Erzeuge das PDF

So kannst du einen angefangenen Bogen weiterverwenden!

!!! tip "Konfiguration"
    Die Größe und das Layout der Etiketten kannst du anpassen. Siehe [Bücherlabels konfigurieren](../configuration/book-labels.md).

## Benutzerausweise drucken

1. Gehe zu **Reports** → **Ausweise**
2. Wähle Nutzer aus (Klasse oder alle)
3. Klicke **Erzeuge PDF**
4. Drucke, schneide aus und laminiere

Konfiguration: [Benutzerausweise konfigurieren](../configuration/user-cards.md)

## Mahnschreiben

Für überfällige Bücher:

1. Gehe zu **Reports** → **Mahnungen**
2. Wähle die überfälligen Ausleihen
3. Klicke **Mahnschreiben erstellen**
4. Ein Word-Dokument (.docx) wird erstellt

Das Dokument enthält:

- Name des Nutzers
- Liste der überfälligen Bücher
- Rückgabedatum
- Dein Schullogo und Text

Konfiguration: [Mahnschreiben konfigurieren](../configuration/reminders.md)

## Excel Export

Exportiere alle Daten als Excel-Datei:

1. Klicke auf **Excel Export**
2. Eine Datei mit zwei Blättern wird erstellt:
   - **Userliste**: Alle Nutzer mit Details
   - **Bücherliste**: Alle Bücher mit Details

Ideal für:

- Backups
- Eigene Auswertungen
- Weitergabe an die Schulleitung

## Excel Import

Importiere Daten aus einer Excel-Datei:

1. Klicke auf **Excel Import**
2. Wähle eine Excel-Datei
3. Prüfe die Vorschau
4. Klicke **In die Datenbank importieren**

Mehr Details: [Excel-Import](../import/excel-generic.md)

## Listen

### Nutzerliste

Klicke auf **Nutzerinnen** für eine tabellarische Übersicht:

- Sortierbar nach jeder Spalte
- Filterbar
- Exportierbar

### Bücherliste

Klicke auf **Bücher** für eine tabellarische Übersicht:

- Alle Bücher mit Details
- Sortier- und filterbar
- Zeigt Ausleihstatus

### Leihenliste

Klicke auf **Leihen** für alle aktuellen Ausleihen:

- Wer hat was ausgeliehen
- Seit wann
- Bis wann (Rückgabedatum)
- Wie oft verlängert

## Historie / Audit

Klicke auf **Historie** für ein Protokoll aller Aktivitäten:

- Ausleihen
- Rückgaben
- Verlängerungen
- Änderungen

Nützlich für:

- Nachvollziehen von Problemen
- Statistiken über die Zeit
- "Wer hat das Buch zuletzt gehabt?"

## Nächste Schritte

- [Bücherlabels konfigurieren](../configuration/book-labels.md)
- [Benutzerausweise konfigurieren](../configuration/user-cards.md)
- [Mahnschreiben konfigurieren](../configuration/reminders.md)
