# Bücherlabels konfigurieren

Passe die Etiketten für deine Bücher an – Bogenformat, Layout und Inhalt.

## Übersicht

Bücherlabels werden als PDF generiert und auf A4-Etikettenpapier gedruckt. Die Konfiguration erfolgt über:

- **Bogen-Konfigurationen** (JSON-Dateien) — beschreiben das physische Etikettenpapier
- **Vorlagen** (JSON-Dateien) — bestimmen, welche Daten auf dem Etikett erscheinen
- **Visueller Editor** — Vorlagen direkt im Browser bearbeiten mit Live-Vorschau
- **API** — PDF-Erzeugung auch ohne UI, z.B. per Skript

Alle Konfigurationsdateien liegen in `database/custom/labels/` und werden beim Docker-Setup automatisch als Volume gemountet.

```
database/custom/labels/
├── sheets/          # Etikettenbögen (Papierformate)
│   ├── zweckform-3474.json
│   ├── avery-l7160.json
│   └── ...
└── templates/       # Vorlagen (Felderzuordnung)
    ├── default.json
    └── ...
```

## Schnellstart

1. Gehe zu **Berichte** → **Buchetiketten drucken**
2. Wähle eine Vorlage und einen Etikettenbogen aus
3. Filtere die Bücher (neueste X, nach Thema, alle, oder bestimmte IDs)
4. Optional: Startposition festlegen, falls der Bogen schon teilweise bedruckt ist
5. Klicke **PDF herunterladen**

Fertig! Das PDF ist druckbereit.

## Mitgelieferte Etikettenbögen

Diese Bögen werden mit OpenLibry ausgeliefert:

| Datei | Produkt | Etikettenmaß | Etiketten/Blatt | Raster |
|-------|---------|--------------|-----------------|--------|
| `zweckform-3474` | Avery Zweckform 3474 | 70 × 37 mm | 24 | 3 × 8 |
| `zweckform-3475` | Avery Zweckform 3475 | 70 × 36 mm | 24 | 3 × 8 |
| `zweckform-3490` | Avery Zweckform 3490 | 70 × 36 mm | 24 | 3 × 8 |
| `zweckform-3422` | Avery Zweckform 3422 | 70 × 35 mm | 24 | 3 × 8 |
| `zweckform-3420` | Avery Zweckform 3420 | 70 × 16.9 mm | 51 | 3 × 17 |
| `zweckform-3659` | Avery Zweckform 3659 | 97 × 42.3 mm | 12 | 2 × 6 |
| `avery-l7160` | Avery L7160 | 63.5 × 38.1 mm | 21 | 3 × 7 |
| `avery-l7163` | Avery L7163 | 99.1 × 38.1 mm | 14 | 2 × 7 |
| `herma-4360` | HERMA 4360 | 70 × 37 mm | 24 | 3 × 8 |

## Eigenen Etikettenbogen hinzufügen

Erstelle eine neue JSON-Datei in `database/custom/labels/sheets/`. Alle Maße sind in Millimetern.

```json
{
  "id": "mein-bogen",
  "name": "Mein Etikettenbogen",
  "description": "Beispiel 105 × 48 mm, 12 Stück/Blatt",
  "pageSize": { "width": 210, "height": 297 },
  "unit": "mm",
  "label": { "width": 105, "height": 48 },
  "grid": { "columns": 2, "rows": 6 },
  "margins": { "top": 8.5, "left": 0, "right": 0, "bottom": 8.5 },
  "gap": { "horizontal": 0, "vertical": 0 },
  "labelsPerSheet": 12
}
```

!!! tip "Maße prüfen"
    Die Summe aus Rändern, Etiketten und Abständen muss die Seitengröße ergeben:

    - Horizontal: `margins.left` + Spalten × `label.width` + (Spalten − 1) × `gap.horizontal` + `margins.right` = 210 mm
    - Vertikal: `margins.top` + Reihen × `label.height` + (Reihen − 1) × `gap.vertical` + `margins.bottom` = 297 mm

## Etikett-Layout

Jedes Etikett hat vier Felder in einer L-Form:

```
┌──────────┬───────────────────────┐
│          │  Zeile 1              │
│Buchrücken├───────────────────────┤
│ (gedreht │  Zeile 2              │
│  90° CCW)├───────────────────────┤
│          │  Zeile 3              │
└──────────┴───────────────────────┘
```

- **Buchrücken** — vertikales Feld links, Text um 90° gedreht (für den Buchrücken)
- **Zeile 1–3** — drei horizontale Felder rechts (für die Buchrückseite)

### Verfügbare Feldinhalte

| Inhalt | Beschreibung |
|--------|-------------|
| Titel | Buchtitel |
| Untertitel | Untertitel des Buchs |
| Autor | Name des Autors |
| Buchnummer | Interne ID in der Bibliothek |
| Schulname | Wert von `SCHOOL_NAME` aus der `.env`-Datei |
| Themen (max. 3) | Die ersten drei Themen des Buchs, kommagetrennt |
| Barcode | Code128-Barcode der Buchnummer |
| Leer | Feld bleibt frei |

## Vorlagen bearbeiten

### Im Browser (empfohlen)

1. Gehe zu **Berichte** → **Etiketten-Vorlage bearbeiten**
2. Lade eine vorhandene Vorlage oder klicke **Neu**
3. Wähle einen Etikettenbogen aus
4. Ordne jedem der vier Felder einen Inhalt zu
5. Stelle Schriftgrößen und Ausrichtung ein
6. Passe die Buchrücken-Breite mit dem Schieberegler an
7. Die Vorschau rechts zeigt das Ergebnis als echtes PDF
8. Klicke **Vorlage speichern**

Die Vorschau wird direkt vom Server als PDF erzeugt — was du siehst, ist exakt das, was gedruckt wird.

### Als JSON-Datei

Vorlagen liegen in `database/custom/labels/templates/`:

```json
{
  "id": "default",
  "name": "Standard Buchetikett",
  "sheetConfigId": "zweckform-3474",
  "spineWidthPercent": 25,
  "padding": 2,
  "fields": {
    "spine":       { "content": "id",      "fontSizeMax": 14, "align": "center" },
    "horizontal1": { "content": "title",   "fontSizeMax": 11, "align": "left" },
    "horizontal2": { "content": "author",  "fontSizeMax": 9,  "align": "left" },
    "horizontal3": { "content": "barcode", "fontSizeMax": 0,  "align": "center" }
  }
}
```

| Feld | Beschreibung |
|------|-------------|
| `spineWidthPercent` | Breite des Buchrücken-Felds in Prozent der Etikettenbreite (10–50) |
| `padding` | Innenabstand in mm |
| `fontSizeMax` | Maximale Schriftgröße in pt — Text wird automatisch verkleinert, wenn er nicht passt. Bei Barcode-Feldern auf `0` setzen. |
| `align` | Ausrichtung: `left`, `center` oder `right` |
| `content` | Einer der Werte: `title`, `subtitle`, `author`, `id`, `school`, `topics`, `barcode`, `none` |

## Angefangene Bögen nutzen

Wenn ein Etikettenbogen schon teilweise bedruckt ist:

1. Gehe zu **Berichte** → **Buchetiketten drucken**
2. Wähle unter **Position auf dem Bogen** den Modus:
    - **Ab Position** — klicke auf die Stelle, ab der gedruckt werden soll. Alle Felder davor bleiben leer.
    - **Einzelne Felder** — klicke einzelne freie Felder an, die bedruckt werden sollen.
3. Erzeuge das PDF

So verschwendest du keine Etikettenbögen!

## API

Die Label-Erzeugung funktioniert auch ohne Browser — z.B. für Skripte oder Automatisierung.

### PDF erzeugen

```bash
curl -X POST http://localhost:3000/api/labels/generate \
  -H "Content-Type: application/json" \
  -d '{
    "sheetConfigId": "zweckform-3474",
    "templateId": "default",
    "bookFilter": { "type": "latest", "count": 24 }
  }'  \
  -o etiketten.pdf
```

**Bücher auswählen** über `bookFilter`:

| Filter | Beispiel |
|--------|---------|
| Neueste N | `{ "type": "latest", "count": 50 }` |
| Nach Thema | `{ "type": "topic", "value": "Abenteuer" }` |
| Alle Bücher | `{ "type": "all" }` |
| Bestimmte IDs | `{ "type": "ids", "ids": [1, 5, 42] }` |

Alternativ können Buchdaten direkt übergeben werden (ohne Datenbankzugriff):

```bash
curl -X POST http://localhost:3000/api/labels/generate \
  -H "Content-Type: application/json" \
  -d '{
    "sheetConfigId": "zweckform-3474",
    "templateId": "default",
    "books": [
      { "id": "42", "title": "Der kleine Prinz", "author": "Saint-Exupéry", "topics": "Abenteuer; Freundschaft" }
    ]
  }' \
  -o etiketten.pdf
```

**Startposition setzen** (halb bedruckter Bogen):

```json
{
  "sheetConfigId": "zweckform-3474",
  "templateId": "default",
  "startPosition": { "row": 5, "col": 2 },
  "bookFilter": { "type": "latest", "count": 10 }
}
```

**Einzelne Positionen angeben** (verstreute freie Etiketten):

```json
{
  "sheetConfigId": "zweckform-3474",
  "templateId": "default",
  "positions": [
    { "row": 2, "col": 1 },
    { "row": 2, "col": 3 },
    { "row": 5, "col": 2 }
  ],
  "bookFilter": { "type": "ids", "ids": [1, 2, 3] }
}
```

### Weitere Endpunkte

| Endpunkt | Beschreibung |
|----------|-------------|
| `GET /api/labels/sheets` | Alle verfügbaren Etikettenbögen auflisten |
| `GET /api/labels/sheets?id=zweckform-3474` | Einzelnen Bogen abrufen |
| `GET /api/labels/templates` | Alle Vorlagen auflisten |
| `GET /api/labels/templates?id=default` | Einzelne Vorlage abrufen |
| `POST /api/labels/templates` | Vorlage speichern (Body = JSON der Vorlage) |

## Konfigurationsverzeichnis

Standardmäßig: `./database/custom/labels/`. Kann über die `.env`-Datei geändert werden:

```env
LABEL_CONFIG_DIR=./database/custom/labels
```

In Docker wird `database/custom/` als Volume gemountet — eigene Bögen und Vorlagen bleiben bei Updates erhalten.

## Ausrichten und Troubleshooting

Falls die Labels nicht perfekt auf dem Etikettenpapier sitzen:

### Testdruck auf Normalpapier

1. Drucke auf normales Papier
2. Halte es gegen das Licht mit dem Etikettenbogen dahinter
3. Prüfe die Ausrichtung

### Ränder anpassen

Bearbeite die `margins`-Werte in der JSON-Datei des Bogens. Typische Anpassungen sind ±0.5 mm.

- Labels zu weit **links** → `margins.left` erhöhen
- Labels zu weit **oben** → `margins.top` erhöhen

### Drucker-Einstellungen prüfen

- Drucke mit **100% Skalierung** (keine Anpassung!)
- Deaktiviere „An Seite anpassen"
- Nutze randlosen Druck wenn möglich

## Schulname auf dem Etikett

Um den Schulnamen auf dem Etikett anzuzeigen, setze in der `.env`-Datei:

```env
SCHOOL_NAME=Grundschule Mammolshain
```

Dann weise in der Vorlage einem Feld den Inhalt „Schulname" zu.

## Migration von der alten Konfiguration

Falls du bisher die `BOOKLABEL_*`-Umgebungsvariablen verwendet hast: Die alte API unter `/api/report/booklabels` ist nicht mehr verfügbar. Du kannst aber auf das neue System umsteigen:

1. Erstelle über den Editor eine Vorlage, die deinem bisherigen Layout entspricht
2. Wähle den passenden Etikettenbogen aus der Liste (oder erstelle einen eigenen)
3. Teste über **Berichte** → **Buchetiketten drucken**
4. Wenn alles passt, können die alten `BOOKLABEL_*`-Variablen entfernt werden

## Nächste Schritte

- [Reports & Labels](../user-guide/reports.md) – Labels drucken
- [Benutzerausweise](user-cards.md) – Ausweise für Bibliotheksnutzer konfigurieren