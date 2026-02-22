# Benutzerausweise konfigurieren

Erstelle Bibliotheksausweise mit Barcode für deine Nutzer.

## Übersicht

Benutzerausweise werden als PDF erstellt und können auf Papier oder Karton gedruckt, ausgeschnitten und laminiert werden.

![Beispiel Nutzerausweis](../assets/nutzerausweis-beispiel.svg)

## Konfiguration

### Grundeinstellungen

```env
# Hintergrundbild (nur der Dateiname, ohne Pfad – Ablageort siehe Abschnitt "Hintergrundbild")
# Standard wenn nicht gesetzt: userlabeltemplate.jpg (im Image enthalten)
USERID_LABEL_IMAGE=ausweis_hintergrund.png

# Breite des Ausweises (CSS-Einheiten: cm, px, vw)
# Standard: 42vw
USERLABEL_WIDTH=9cm

# Ausweise pro Seite
# Standard: 6
USERLABEL_PER_PAGE=6
```

### Barcode

Position und Größe des Barcodes auf dem Ausweis:

```env
# Format: ["Top", "Left", "Breite", "Höhe", "Barcode-Typ"]
# Alle Werte als Strings; Position in % (relativ zur Ausweisfläche), Größe in cm oder %
# Standard:
USERLABEL_BARCODE=["80%","63%","3cm","1.6cm","code128"]
```

| Position | Bedeutung |
|----------|-----------|
| `Top` | Abstand von oben (z.B. `"80%"`) |
| `Left` | Abstand von links (z.B. `"63%"`) |
| `Breite` | Breite des Barcodes (z.B. `"3cm"`) |
| `Höhe` | Höhe des Barcodes (z.B. `"1.6cm"`) |
| `Barcode-Typ` | Immer `"code128"` |

!!! warning "JSON-Format"
    Der gesamte Wert muss ein gültiges JSON-Array sein. Alle 5 Elemente müssen als Strings
    in Anführungszeichen stehen. Ein fehlerhafter Wert (z.B. nur eine Zahl) führt zu einem
    Fehler beim Erzeugen des PDFs.

### Optionaler Farbbalken

Ein farbiger Balken unterhalb des Hintergrundbilds – nützlich für Klassenfarben:

```env
# Format: [Breite_in_pt, Höhe_in_pt, "Farbe"]
# Beispiel: 5 cm breiter, 20 pt hoher roter Balken:
USERLABEL_SEPARATE_COLORBAR=[141.7, 20, "#cc0000"]

# Zum Deaktivieren: Variable weglassen oder auskommentieren
# USERLABEL_SEPARATE_COLORBAR=
```

!!! warning "JSON-Format"
    Auch hier muss der Wert ein gültiges JSON-Array mit 3 Elementen sein: `[Breite, Höhe, "Farbe"]`.
    Breite und Höhe sind Zahlen (in Punkten), Farbe ein String (Hex oder CSS-Name).
    **Nicht** einfach `0` setzen – das führt zu einem JSON-Fehler.

### Datenzeilen

Du kannst beliebig viele Textzeilen auf dem Ausweis platzieren. Die Variablen werden
alphabetisch-numerisch sortiert (LINE_1 vor LINE_2 usw.):

```env
# Format: ["Inhalt", "Top", "Left", "Breite", "Padding", "Farbe", Schriftgröße]
#          Text      % von oben  % von links  max. Breite  Innenabstand  Farbe  Größe (Zahl!)
USERLABEL_LINE_1=["User.firstName User.lastName","75%","3%","35vw","2pt","black",14]
USERLABEL_LINE_2=["Klasse: User.schoolGrade","82%","3%","35vw","2pt","black",12]
USERLABEL_LINE_3=["Schulbibliothek","5%","3%","35vw","2pt","white",10]
```

!!! info "Schriftgröße ist eine Zahl"
    Das letzte Element (Schriftgröße) ist die einzige **Zahl** ohne Anführungszeichen.
    Alle anderen Elemente sind Strings.

## Verfügbare Platzhalter

| Platzhalter | Wird ersetzt durch |
|-------------|-------------------|
| `User.firstName` | Vorname |
| `User.lastName` | Nachname |
| `User.schoolGrade` | Klasse |
| `User.id` | Ausweisnummer |
| `User.eMail` | E-Mail |

Platzhalter können auch kombiniert werden: `"User.firstName User.lastName"` ergibt z.B. `"Anna Müller"`.

## Hintergrundbild

1. Erstelle ein Bild mit deinem Design (z.B. Schullogo, Farben)
2. Empfohlene Größe: 400×250 px oder ähnliches Seitenverhältnis
3. Speichere das Bild – **je nach Installation an unterschiedlichen Orten** (siehe unten)
4. Setze `USERID_LABEL_IMAGE=dein_bild.png` in der `.env`
5. OpenLibry neu starten

!!! tip "Design-Tool"
    Tools wie [Canva](https://canva.com) eignen sich gut zum Erstellen von Ausweis-Designs.
    Exportiere das Ergebnis als PNG oder JPG.

### Wo speichere ich das Bild?

=== "Docker"

    Lege das Bild in den `database/custom/`-Ordner auf dem **Host-System**:

    ```bash
    cp ausweis_hintergrund.png ~/openlibry/database/custom/ausweis_hintergrund.png
    ```

    Dieser Ordner ist über das Docker-Volume gemountet und bleibt bei Container-Updates
    automatisch erhalten. OpenLibry sucht Dateien **zuerst** in `database/custom/` – wird die
    Datei dort nicht gefunden, greift es auf die Standarddatei aus dem Image zurück
    (`userlabeltemplate.jpg`).

    !!! info "Warum nicht `/public/`?"
        Der `public/`-Ordner ist fest ins Docker-Image eingebaut und wird nicht als Volume
        gemountet. Dateien, die dort abgelegt werden, gehen beim nächsten `docker compose pull`
        verloren. Eigene Dateien gehören deshalb immer in `database/custom/`.

=== "Bare Metal"

    Lege das Bild direkt in den `public/`-Ordner der OpenLibry-Installation:

    ```bash
    cp ausweis_hintergrund.png /pfad/zu/openlibry/public/ausweis_hintergrund.png
    ```

    OpenLibry liest alle Vorlagen-Dateien aus `public/`. Nach dem Kopieren genügt ein
    Neustart (`pm2 restart openlibry`), damit das Bild verwendet wird.

### Wie prüfe ich, ob das Bild geladen wird?

Du kannst den Health-Check-Endpoint aufrufen – er zeigt für jede Vorlagendatei,
ob sie gefunden wurde und aus welcher Quelle (`custom` oder `public`):

```
http://localhost:3000/api/health
```

Im Abschnitt `checks.files` siehst du den `source`-Wert für `USERID_LABEL_IMAGE`:
- `"custom"` → Datei aus `database/custom/` (Docker) oder du hast sie in `public/` abgelegt
- `"public"` → Standarddatei aus dem Image wird verwendet
- `"missing"` → Datei nicht gefunden, PDF-Erzeugung schlägt fehl

## Vollständiges Beispiel

```env
# Hintergrundbild (in database/custom/ für Docker, in public/ für Bare Metal)
USERID_LABEL_IMAGE=bibliotheksausweis.png

# Größe und Layout
USERLABEL_WIDTH=8.5cm
USERLABEL_PER_PAGE=8

# Barcode rechts unten
USERLABEL_BARCODE=["70%","60%","3cm","1.6cm","code128"]

# Farbbalken (optional): 142pt breit, 15pt hoch, dunkelblau
USERLABEL_SEPARATE_COLORBAR=[142, 15, "#003366"]

# Textzeilen
USERLABEL_LINE_1=["User.firstName User.lastName","45%","5%","50%","2pt","#333333",12]
USERLABEL_LINE_2=["Klasse User.schoolGrade","55%","5%","50%","2pt","#666666",10]
USERLABEL_LINE_3=["Schulbibliothek Musterstadt","5%","5%","90%","2pt","#ffffff",8]
```

## Ausweise drucken

1. Gehe zu **Reports** → **Ausweise**
2. Wähle Nutzer aus:
   - Alle Nutzer
   - Nach Klasse filtern
   - ID-Bereich
3. Klicke **Erzeuge PDF**
4. Drucke auf Karton oder dickes Papier
5. Ausschneiden und laminieren

## Tipps

**Laminieren:** Laminierte Ausweise halten viel länger. Ein kleines Laminiergerät (~30€) lohnt sich.

**Farben:** Nutze Hex-Codes für Farben: `"#ff0000"` (rot), `"#003366"` (dunkelblau), `"black"`, `"white"`.

**Positionierung:** Die `%`-Werte für Top und Left beziehen sich auf die gesamte Ausweisfläche.
Probiere die Werte aus und passe sie schrittweise an – erzeuge nach jeder Änderung ein Test-PDF.

**Zeilen hinzufügen:** Füge einfach weitere `USERLABEL_LINE_4`, `USERLABEL_LINE_5` usw. hinzu.
Die Nummerierung bestimmt die Reihenfolge, in der sie verarbeitet werden.

## Nächste Schritte

- [Reports](../user-guide/reports.md) – Ausweise drucken
- [Bücherlabels](book-labels.md) – Bücher-Etiketten konfigurieren