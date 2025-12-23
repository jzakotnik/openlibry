# Bücherlabels konfigurieren

Passe die Etiketten für deine Bücher an – Größe, Layout und Inhalt.

## Übersicht

Bücherlabels werden als PDF generiert und auf A4-Etikettenpapier gedruckt. Du kannst anpassen:

- Größe und Position der Labels
- Inhalt (welche Daten erscheinen)
- Barcode-Format
- Optional: Schullogo

## Etikettenpapier

OpenLibry ist optimiert für gängige Etikettenbögen:

| Produkt | Zeilen × Spalten | Labelgröße |
|---------|------------------|------------|
| AVERY Zweckform L4732 | 16 × 4 | 35.6 × 16.9 mm |
| AVERY Zweckform 3659 | 8 × 3 | 63.5 × 33.9 mm |
| Herma 4200 | 8 × 2 | 96.5 × 33.8 mm |

!!! tip "Eigene Bögen"
    Du kannst jedes beliebige Format konfigurieren. Miss einfach die Maße aus.

## Konfiguration

### Layout

```env
# Ränder (cm)
BOOKLABEL_MARGIN_LEFT=0.6
BOOKLABEL_MARGIN_TOP=1.3

# Labelgröße (cm)
BOOKLABEL_LABEL_WIDTH=3.56
BOOKLABEL_LABEL_HEIGHT=1.69

# Labels pro Seite
BOOKLABEL_ROWSONPAGE=16
BOOKLABEL_COLUMNSONPAGE=4

# Abstände zwischen Labels (cm)
BOOKLABEL_LABEL_SPACING_HORIZONTAL=0.25
BOOKLABEL_LABEL_SPACING_VERTICAL=0

# Innenrand im Label (cm)
BOOKLABEL_MARGIN_IN_LABEL=0.1

# Rahmen zum Ausrichten (true/false)
BOOKLABEL_PRINT_LABEL_FRAME=false
```

### Barcode

```env
# Größe
BOOKLABEL_BARCODE_WIDTH=3cm
BOOKLABEL_BARCODE_HEIGHT=1.6cm

# Format (code128 empfohlen)
BOOKLABEL_BARCODE_VERSION=code128

# Minimale Code-Länge (für Scanner)
BARCODE_MINCODELENGTH=4
```

### Inhalt

Labels können bis zu 4 Textbereiche haben:

```env
# Seitlich (um 90° gedreht)
BOOKLABEL_AUTHORLINE=["Book.author",8,"left"]

# Über dem Barcode
BOOKLABEL_LINE_ABOVE=["Book.topics",8,"center"]

# Unter dem Barcode (2 Zeilen)
BOOKLABEL_LINE_BELOW_1=["Book.title",8,"left"]
BOOKLABEL_LINE_BELOW_2=["firstTopic",7,"left"]

# Schullogo
BOOKLABEL_LOGO=school_logo.png
```

**Format**: `["Inhalt", Schriftgröße, Ausrichtung]`

**Ausrichtung**: `left`, `center`, `right`

### Verfügbare Platzhalter

| Platzhalter | Wird ersetzt durch |
|-------------|-------------------|
| `Book.title` | Buchtitel |
| `Book.author` | Autor |
| `Book.topics` | Alle Schlagworte |
| `Book.isbn` | ISBN |
| `Book.id` | Mediennummer |
| `firstTopic` | Erstes Schlagwort |

## Beispielkonfigurationen

### AVERY Zweckform L4732 (Mini-Labels)

```env
BOOKLABEL_MARGIN_LEFT=0.6
BOOKLABEL_MARGIN_TOP=1.3
BOOKLABEL_LABEL_WIDTH=3.56
BOOKLABEL_LABEL_HEIGHT=1.69
BOOKLABEL_ROWSONPAGE=16
BOOKLABEL_COLUMNSONPAGE=4
BOOKLABEL_BARCODE_WIDTH=2cm
BOOKLABEL_BARCODE_HEIGHT=0.8cm
BOOKLABEL_AUTHORLINE=["Book.author",6,"left"]
BOOKLABEL_LINE_BELOW_1=["Book.title",6,"left"]
```

### Große Labels (2 × 5)

```env
BOOKLABEL_MARGIN_LEFT=1.0
BOOKLABEL_MARGIN_TOP=1.5
BOOKLABEL_LABEL_WIDTH=9.5
BOOKLABEL_LABEL_HEIGHT=5.0
BOOKLABEL_ROWSONPAGE=5
BOOKLABEL_COLUMNSONPAGE=2
BOOKLABEL_BARCODE_WIDTH=4cm
BOOKLABEL_BARCODE_HEIGHT=2cm
BOOKLABEL_AUTHORLINE=["Book.author",10,"left"]
BOOKLABEL_LINE_ABOVE=["Book.topics",9,"center"]
BOOKLABEL_LINE_BELOW_1=["Book.title",10,"left"]
BOOKLABEL_LINE_BELOW_2=["Book.isbn",8,"left"]
```

## Ausrichten

Falls die Labels nicht perfekt sitzen:

### 1. Testdruck auf Normalpapier

1. Setze `BOOKLABEL_PRINT_LABEL_FRAME=true`
2. Drucke auf normales Papier
3. Halte gegen den Etikettenbogen
4. Prüfe die Ausrichtung

### 2. Ränder anpassen

- Labels zu weit links → `BOOKLABEL_MARGIN_LEFT` erhöhen
- Labels zu weit oben → `BOOKLABEL_MARGIN_TOP` erhöhen

### 3. Drucker-Einstellungen

- Drucke mit **100% Skalierung** (keine Anpassung!)
- Keine "An Seite anpassen"-Option
- Randloser Druck wenn möglich

## Labels überspringen

Hast du einen angefangenen Bogen?

1. Gehe zu **Reports** → **Buch Etiketten**
2. Klicke **Überspringe Label**
3. Klicke auf die bereits verwendeten Positionen
4. Erzeuge das PDF

So kannst du Bögen optimal nutzen!

## Tipps

### Lange Titel

Titel werden automatisch abgeschnitten. Passe `BOOKLABEL_MAX_AUTHORLINE_LENGTH` an:

```env
BOOKLABEL_MAX_AUTHORLINE_LENGTH=25
```

### Lesbarkeit

- Kleine Labels: Schriftgröße 6-8
- Mittlere Labels: Schriftgröße 8-10
- Große Labels: Schriftgröße 10-12

### Schullogo

1. Logo als PNG speichern (transparenter Hintergrund ideal)
2. In `/public/` ablegen
3. `BOOKLABEL_LOGO=dein_logo.png` setzen

## Nächste Schritte

- [Reports & Labels](../user-guide/reports.md) – Labels drucken
- [Benutzerausweise](user-cards.md) – Ausweise konfigurieren
