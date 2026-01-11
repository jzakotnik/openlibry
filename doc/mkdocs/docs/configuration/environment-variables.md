# Umgebungsvariablen

Vollständige Referenz aller Einstellungen in der `.env`-Datei.

## Datenbank

| Variable | Beschreibung | Standard |
|----------|--------------|----------|
| `DATABASE_URL` | Pfad zur SQLite-Datenbank | `file:./database/dev.db` |

```env
DATABASE_URL=file:./database/dev.db
```

## Authentifizierung

| Variable | Beschreibung | Standard |
|----------|--------------|----------|
| `AUTH_ENABLED` | Login erforderlich? | `true` |
| `NEXTAUTH_SECRET` | Geheimnis für Session-Tokens | *(muss gesetzt werden)* |

```env
AUTH_ENABLED=true
NEXTAUTH_SECRET=einLangesZufälligesGeheimnis123!
```

!!! warning "AUTH_SECRET"
    Verwende einen langen, zufälligen String. Ändere ihn nicht nachträglich, sonst werden alle Nutzer ausgeloggt.

## Ausleihzeiten

| Variable | Beschreibung | Standard |
|----------|--------------|----------|
| `RENTAL_DURATION_DAYS` | Leihfrist in Tagen | `21` |
| `EXTENSION_DURATION_DAYS` | Verlängerung in Tagen | `14` |
| `MAX_EXTENSIONS` | Maximale Verlängerungen | `2` |

```env
RENTAL_DURATION_DAYS=21
EXTENSION_DURATION_DAYS=14
MAX_EXTENSIONS=2
```

## Bücherlabels

### Layout

| Variable | Beschreibung | Standard |
|----------|--------------|----------|
| `BOOKLABEL_MARGIN_LEFT` | Linker Rand (cm) | `1` |
| `BOOKLABEL_MARGIN_TOP` | Oberer Rand (cm) | `2` |
| `BOOKLABEL_LABEL_WIDTH` | Breite eines Labels (cm) | `5.0` |
| `BOOKLABEL_LABEL_HEIGHT` | Höhe eines Labels (cm) | `3.0` |
| `BOOKLABEL_ROWSONPAGE` | Zeilen pro Seite | `5` |
| `BOOKLABEL_COLUMNSONPAGE` | Spalten pro Seite | `2` |
| `BOOKLABEL_LABEL_SPACING_HORIZONTAL` | Horizontaler Abstand (cm) | `0` |
| `BOOKLABEL_LABEL_SPACING_VERTICAL` | Vertikaler Abstand (cm) | `0` |
| `BOOKLABEL_MARGIN_IN_LABEL` | Innenrand im Label (cm) | `0` |
| `BOOKLABEL_PRINT_LABEL_FRAME` | Rahmen zeichnen? | `false` |

### Barcode

| Variable | Beschreibung | Standard |
|----------|--------------|----------|
| `BOOKLABEL_BARCODE_WIDTH` | Breite des Barcodes | `3cm` |
| `BOOKLABEL_BARCODE_HEIGHT` | Höhe des Barcodes | `1.6cm` |
| `BOOKLABEL_BARCODE_VERSION` | Barcode-Format | `code128` |
| `BARCODE_MINCODELENGTH` | Minimale Code-Länge | `4` |

### Inhalt

| Variable | Beschreibung | Format |
|----------|--------------|--------|
| `BOOKLABEL_AUTHORLINE` | Seitliche Autorenzeile | `["Book.author",8,"left"]` |
| `BOOKLABEL_LINE_ABOVE` | Zeile über Barcode | `["Text",10,"center"]` |
| `BOOKLABEL_LINE_BELOW_1` | 1. Zeile unter Barcode | `["Book.title",10,"left"]` |
| `BOOKLABEL_LINE_BELOW_2` | 2. Zeile unter Barcode | `["Book.topics",8,"left"]` |
| `BOOKLABEL_LOGO` | Logo-Datei (im public/) | `school_logo.png` |

**Format**: `["Inhalt", Schriftgröße, Ausrichtung]`

**Platzhalter**:
- `Book.title` – Buchtitel
- `Book.author` – Autor
- `Book.topics` – Schlagworte
- `Book.isbn` – ISBN
- `firstTopic` – Erstes Schlagwort

Mehr Details: [Bücherlabels konfigurieren](book-labels.md)

## Benutzerausweise

| Variable | Beschreibung | Standard |
|----------|--------------|----------|
| `USERID_LABEL_IMAGE` | Hintergrundbild | `ausweis_hintergrund.png` |
| `USERLABEL_WIDTH` | Breite des Ausweises | `42vw` |
| `USERLABEL_PER_PAGE` | Ausweise pro Seite | `6` |
| `USERLABEL_SEPARATE_COLORBAR` | Farbbalken-Höhe (px) | `0` |
| `USERLABEL_BARCODE` | Barcode-Position | `["10%","60%","30%","15%","code128"]` |

### Datenzeilen

| Variable | Format |
|----------|--------|
| `USERLABEL_LINE_1` | `["User.firstName User.lastName","75%","3%","35vw","2pt","black",14]` |
| `USERLABEL_LINE_2` | `["User.schoolGrade","80%","3%","35vw","2pt","black",12]` |

**Format**: `["Inhalt", Top, Left, Breite, Padding, Farbe, Schriftgröße]`

Mehr Details: [Benutzerausweise konfigurieren](user-cards.md)

## Mahnschreiben

| Variable | Beschreibung | Standard |
|----------|--------------|----------|
| `REMINDER_TEMPLATE` | Template-Datei | `mahnung-template.docx` |
| `SCHOOL_NAME` | Schulname | `"Meine Schule"` |
| `SCHOOL_ADDRESS` | Adresse | `"Musterstraße 1"` |
| `SCHOOL_CITY` | Ort | `"12345 Musterstadt"` |

Mehr Details: [Mahnschreiben konfigurieren](reminders.md)

## Sonstiges

| Variable | Beschreibung | Standard |
|----------|--------------|----------|
| `PORT` | Server-Port | `3000` |
| `MAX_MIGRATION_SIZE` | Max. Import-Größe (MB) | `250` |
| `RENTAL_SORT_BOOKS` | Sortierung in Leihe | `title_asc` |

## Beispiel-Konfiguration

```env title=".env"
# Datenbank
DATABASE_URL=file:./database/dev.db

# Authentifizierung
AUTH_ENABLED=true
NEXTAUTH_SECRET=meinSuperGeheimesPasswort123!

# Ausleihzeiten
RENTAL_DURATION_DAYS=21
EXTENSION_DURATION_DAYS=14
MAX_EXTENSIONS=2

# Schulinformationen
SCHOOL_NAME="Grundschule Beispielstadt"
SCHOOL_ADDRESS="Schulstraße 1"
SCHOOL_CITY="12345 Beispielstadt"

# Bücherlabels (AVERY Zweckform L4732)
BOOKLABEL_MARGIN_LEFT=0.6
BOOKLABEL_MARGIN_TOP=1.3
BOOKLABEL_LABEL_WIDTH=3.56
BOOKLABEL_LABEL_HEIGHT=1.69
BOOKLABEL_ROWSONPAGE=16
BOOKLABEL_COLUMNSONPAGE=4

# Benutzerausweise
USERID_LABEL_IMAGE=ausweis_hintergrund.png
USERLABEL_WIDTH=9cm
```

## Nach Änderungen

Nach jeder Änderung an der `.env`-Datei:

```bash
# Bare Metal
pm2 restart openlibry

# Docker
docker restart openlibry
```
