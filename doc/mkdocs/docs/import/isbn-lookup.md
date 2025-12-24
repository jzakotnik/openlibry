# ISBN & Cover-Suche

Mit der ISBN kannst du automatisch Buchinformationen und Cover-Bilder laden.

## Wie funktioniert's?

OpenLibry nutzt externe Dienste, um Buchdaten zu finden:

- **OpenLibrary** – Große internationale Buch-Datenbank
- **Deutsche Nationalbibliothek (DNB)** – Für deutsche Bücher

## Cover-Bild per ISBN laden

### Einzelnes Buch

1. Öffne ein Buch zur Bearbeitung
2. Gib die **ISBN** ein (ISBN-10 oder ISBN-13)
3. Klicke auf **Cover laden** oder **Suchen**
4. Das Cover wird automatisch gefunden (falls verfügbar)
5. **Speichern**

### Beim Anlegen neuer Bücher

1. Klicke auf **+** um ein neues Buch anzulegen
2. Gib die **ISBN** ein
3. Klicke auf **Suchen**
4. Metadaten werden automatisch ausgefüllt:
   - Titel
   - Autor
   - Verlag
   - Cover-Bild
5. Prüfen und **Speichern**

## ISBN finden

### Auf dem Buch

Die ISBN findest du meist:

- Auf der Rückseite über dem Barcode
- Auf der Impressumsseite (eine der ersten Seiten)
- ISBN-10: 10 Ziffern (ältere Bücher)
- ISBN-13: 13 Ziffern, beginnt mit 978 oder 979

### Barcode scannen

Viele Bücher haben die ISBN als Barcode:

1. Buch in Bearbeitungsmodus öffnen
2. Mit Barcode-Scanner den ISBN-Barcode scannen
3. Fertig!

### Online suchen

Falls keine ISBN am Buch:

1. Suche bei [Amazon](https://amazon.de), [BookButler](https://bookbutler.de) oder [Google Books](https://books.google.com)
2. Kopiere die ISBN

## Unterstützte Formate

| Format | Beispiel | Unterstützt |
|--------|----------|-------------|
| ISBN-13 | 978-3-551-55167-2 | ✅ |
| ISBN-13 (ohne Striche) | 9783551551672 | ✅ |
| ISBN-10 | 3-551-55167-9 | ✅ |
| ISBN-10 (ohne Striche) | 3551551679 | ✅ |

## Datenquellen

### OpenLibrary

- Internationale Bücher
- Cover-Bilder
- Metadaten in verschiedenen Sprachen
- URL-Format: `https://openlibrary.org/isbn/[ISBN]`
- Cover-URL: `https://covers.openlibrary.org/b/isbn/[ISBN]-L.jpg`

### Deutsche Nationalbibliothek

- Speziell für deutsche Bücher
- Hochwertige Metadaten
- Nicht alle Bücher haben Covers

## Wenn kein Cover gefunden wird

Nicht alle Bücher haben Cover in den Datenbanken. Alternativen:

### Manuell hochladen

1. Cover im Internet suchen (Google Bildersuche)
2. Bild herunterladen
3. In OpenLibry: **Bild hochladen**
4. Bild auswählen

### Cover-URL eingeben

Falls du eine URL zu einem Cover hast:

1. URL kopieren
2. In das Feld **Bild/imageLink** einfügen
3. Speichern

### Selbst fotografieren

Für Bücher ohne Online-Cover:

1. Cover mit dem Handy fotografieren
2. Bild zuschneiden
3. Hochladen

!!! tip "Bildgröße"
    Cover müssen nicht riesig sein. 300-500 Pixel Breite reichen völlig.

## Häufige Probleme

### "Cover nicht gefunden"

- ISBN korrekt? (Prüfe auf Tippfehler)
- Altes Buch? (Bücher vor 1970 oft nicht in der Datenbank)
- Sehr neues Buch? (Manchmal dauert es, bis Datenbanken aktualisiert sind)
- Regionale Ausgabe? (Deutsche ISBN ≠ amerikanische ISBN)

### Cover hat falsche Auflösung

Die automatisch geladenen Cover sind oft niedrig aufgelöst. Für höhere Qualität:

1. Manuell besseres Bild suchen
2. Hochladen

### Falsche Metadaten

Manchmal liefern die Datenbanken falsche Informationen:

1. Daten nach dem Laden prüfen
2. Manuell korrigieren
3. Speichern

## Massenabgleich

Du hast viele Bücher ohne Cover?

### Manueller Ansatz

1. Nach Büchern ohne Cover filtern (imageLink leer)
2. Jedes Buch öffnen
3. ISBN eingeben → Cover laden

### Per Script (für Entwickler)

```javascript
// Pseudocode
books.filter(b => !b.imageLink).forEach(async book => {
  if (book.isbn) {
    const coverUrl = await fetchCover(book.isbn);
    await updateBook(book.id, { imageLink: coverUrl });
  }
});
```

Siehe [API-Referenz](../development/api-reference.md) für Details.

## Nächste Schritte

- [Bücherverwaltung](../user-guide/book-management.md)
- [Excel-Import](excel-generic.md)
- [API Import](api-import.md)
