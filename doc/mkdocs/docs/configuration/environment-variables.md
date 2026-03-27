# Umgebungsvariablen

Vollständige Referenz aller Einstellungen in der `.env`-Datei.

## Datenbank

| Variable | Beschreibung | Standard |
|----------|--------------|----------|
| `DATABASE_URL` | Pfad zur SQLite-Datenbank | `file:./database/dev.db` |
| `COVERIMAGE_FILESTORAGE_PATH` | Pfad zu Cover Images | `/app/images` |


```env
DATABASE_URL=file:./database/dev.db
```

## Authentifizierung und Sicherheit

| Variable | Beschreibung | Standard |
|----------|--------------|----------|
| `AUTH_ENABLED` | Login erforderlich? | `true` |
| `NEXTAUTH_SECRET` | Geheimer Seed für Session-Tokens | *(muss gesetzt werden)* |
| `SECURITY_HEADERS` | CSRP headers für HTTP calls | `insecure` |


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


## Nach Änderungen

Nach jeder Änderung an der `.env`-Datei:

```bash
# Bare Metal
pm2 restart openlibry

# Docker
docker restart openlibry
```
