# OpenLibry - Die einfache und freie Software für die Schulbibliothek

**OpenLibry** ist eine moderne, benutzerfreundliche Open-Source-Lösung für kleine Bibliotheken, insbesondere in Schulen. Die Software wurde speziell für den hektischen Alltag entwickelt, in dem Kinder Bücher ausleihen, zurückgeben und verwalten.

## Was macht OpenLibry besonders?

OpenLibry entstand aus dem Bedarf einer Grundschule, in der die veraltete OpenBiblio-Software nicht mehr zeitgemäß war. Viele Eltern und Freiwillige engagieren sich ehrenamtlich in Schulbibliotheken - doch kostenlose, moderne digitale Lösungen fehlen oft. OpenLibry schließt diese Lücke mit einer schlanken, intuitiven Software, die auf wenige Klicks optimiert ist und sowohl auf Computern als auch auf Tablets und Smartphones läuft.

---

## 📋 Navigation - Was möchten Sie tun?

### 🔍 [1. Mehr über die Software erfahren](https://openlibry.de/site/)

Entdecken Sie die Features, sehen Sie Screenshots und verstehen Sie, wie OpenLibry funktioniert.

### 💻 2. [OpenLibry installieren](https://openlibry.de/site/installation/)

[Hier](https://openlibry.de/site/installation/) ist Schritt-für-Schritt Anleitungen für verschiedene Installationsmethoden (Bare Metal, Docker, nginx)

### ⚙️ [3. Software konfigurieren](https://openlibry.de/site/configuration/)

Passen Sie OpenLibry an Ihre Bedürfnisse an - von Ausleihzeiten bis zu Bücherlabels.

### 📖 [4. Die Software benutzen](https://openlibry.de/site/user-guide/)

Lernen Sie die tägliche Arbeit mit OpenLibry kennen - Ausleihe, Verwaltung, Reports.

### 🔄 [5. Daten importieren/exportieren](https://openlibry.de/site/import/)

Importieren Sie bestehende Daten aus anderen Systemen oder erstellen Sie Backups.

### 🔧 [6. API & Entwicklung](https://openlibry.de/site/development/)

Technische Informationen für Entwickler und API-Nutzung.

### 📧 [7. Kontakt & Unterstützung](#-kontakt--unterstützung)

Hilfe erhalten, mitmachen oder das Projekt unterstützen.

---

## 🔍 Software-Info

### Hauptfeatures

OpenLibry bietet eine durchdachte Kombination aus Funktionalität und Benutzerfreundlichkeit:

**Plattformunabhängigkeit**: Nutzen Sie OpenLibry auf Computer, Tablet oder Smartphone - die Oberfläche passt sich automatisch an.

**Intelligente Suche**: Während Sie tippen, erscheinen bereits Suchergebnisse für Bücher, Ausleihen und Nutzer. Ein einfacher Filter zeigt überfällige Bücher direkt im Ausleih-Screen an.

**Optimierter Workflow**: Jeder Klick wurde durchdacht. Besonders die Ausleihe und Rückgabe erfolgen mit minimalen Maus- und Tastatureingaben, ideal für den Einsatz mit Barcodescannern.

**Visuelle Bibliothek**: Fügen Sie Cover-Bilder für Bücher ein und machen Sie Ihre Bibliothek ansprechender.

**Flexible Installation**: Ob lokal auf einem Raspberry Pi oder in der Cloud - OpenLibry lässt sich einfach dort installieren, wo Sie es brauchen.

**Keine unnötige Komplexität**: Verzicht auf komplizierte Nutzerverwaltung und überflüssige Datenfelder. Die Software konzentriert sich auf das Wesentliche.

**Moderner Tech-Stack**: Basierend auf Next.js mit einer einfachen Datenbank-Struktur.

**Datenübernahme**: Importfunktion für Daten aus alten OpenBiblio-Installationen sowie Excel-Import/-Export.

### Screenshots

**Start-Screen**
![Überblick Screenshot](./doc/titel1.png)

**Ausleih-Screen**
![Leihe Screenshot](./doc/screen1.png)

**Bücherverwaltung**
![Bücher Liste Screenshot](./doc/buch1.png)

**Buch bearbeiten**
![Bücher Edit Screenshot](./doc/buchedit1.png)

### Intro Video

Ein 12-minütiges Intro-Video über die Bedienung gibts in diesem [YouTube Video](https://youtu.be/2UIFdA6Lqaw?si=5YP4eNZX5wCBMmBJ).


---

## ⚙️ Konfiguration

### Bücherlabel konfigurieren

Bücherlabels sind für den Druck auf A4-Labelpapier optimiert. Größe und Inhalt lassen sich in der `.env`-Datei anpassen.

**Positionierung**: Definieren Sie Ränder oben, links sowie horizontale und vertikale Abstände zwischen Labels in Zentimetern. Mit `BOOKLABEL_PRINT_LABEL_FRAME` können Sie einen Rahmen um die Labels erstellen, der beim Ausrichten hilft oder zum Ausschneiden verwendet werden kann.

**Inhaltsblöcke**: Das Label unterstützt bis zu vier Datenblöcke zusätzlich zum Barcode:

- `BOOKLABEL_AUTHORLINE`: Links am Rand, um 90° gedreht
- `BOOKLABEL_LINE_ABOVE`: Oberhalb des Barcodes
- `BOOKLABEL_LINE_BELOW_1` und `BOOKLABEL_LINE_BELOW_2`: Unterhalb des Barcodes

Unterhalb des Barcodes wird automatisch die Buch-ID ausgegeben.

**Beispiel-Konfiguration**

```json
["Titel: Book.title", 10, "left"]
```

Dies gibt "Titel: " gefolgt vom Buchtitel in Schriftgröße 10, linksbündig aus.

![Beispiel Bücherlabel](./doc/boocklabelSpacings.png)

### Benutzerausweise konfigurieren

Benutzerausweise werden ebenfalls auf DIN A4 gedruckt und können danach zugeschnitten und laminiert werden.

**Struktur**: Ein Ausweis besteht aus einem Bild und beliebig vielen Datenblöcken darauf oder darunter.

**Größe**: `USERLABEL_WIDTH` definiert die Breite (unterstützt CSS-Einheiten wie `cm`, `px`, `vw`).

**Farbbalken**: Mit `USERLABEL_SEPARATE_COLORBAR` fügen Sie einen farbigen Balken unterhalb des Bildes ein (Größe in Pixeln).

**Beispiel-Datenblock**

```json
USERLABEL_LINE_1= ["User.firstName User.lastName","75%","3%","35vw","2pt","black",14]
```

Erstellt einen Block mit 75% Abstand zum oberen Rand, 3% zum linken Rand, 35% relativer Breite, 2 Punkt Innenrand, schwarzer Schrift in Größe 14 mit Vor- und Nachname.

**Barcode-Länge**: `BARCODE_MINCODELENGTH` setzt die minimale Barcodelänge für Bücher- und Nutzerausweise (wichtig für Scanner mit Mindestlängenanforderung).

### Mahnschreiben konfigurieren

OpenLibry verwendet eine Template-Bibliothek für automatisierte Mahnschreiben. Die Platzhalter werden in der `.env`-Datei konfiguriert. Ein Beispiel-Template finden Sie [hier](./public/mahnung-template.docx).

### Antolin-Integration

Um Bücher mit Antolin-Schlagworten zu versehen, können Sie den Antolin-Export des Westermann Verlags einbinden:

1. Kontaktieren Sie Westermann/Antolin für den Download-Link
2. Speichern Sie die CSV-Datei unter `/public/antolin/antolingesamt.csv`
3. Im Buch-Edit-Screen sehen Sie nun ähnliche Bücher aus der Antolin-Datenbank

OpenLibry durchsucht die Datenbank nach Übereinstimmungen bei Autor und Titel.

![Antolin Screenshot](./doc/antolin.png)

---

**Auswahlmöglichkeiten**:

1. **Neueste Labels**: Geben Sie die Anzahl ein - OpenLibry wählt rückwärts von der höchsten ID
2. **ID-Bereich**: Definieren Sie `Von ID` bis `Bis ID` (leere Felder bedeuten ID 0 bzw. letzte ID)
3. **Einzelnes Buch**: Wählen Sie eine spezifische ID
4. **Schlagwort-Filter**: Nutzen Sie optional Schlagwörter als Zusatzfilter

![Reports - Buch Etiketten](./doc/booklabelIdSelect.png)

**PDF erstellen**: Klicken Sie auf `Erzeuge PDF` oder nutzen Sie `Überspringe Label`, um einzelne Labels auf einem bereits teilweise verwendeten Bogen zu deaktivieren:

![Einzelne Label deaktivieren](./doc/printSkipLabels.png)

Mit Links- oder Rechtsklick deaktivieren Sie einzelne Labels (nur auf der ersten Seite).

In der Bücherverwaltung können Sie auch direkt ein einzelnes Label für ein Buch drucken.

---


### Excel Import

Auf der Reports-Seite finden Sie den `Excel Import`:

**Schritt 1 - Upload**: Laden Sie Ihre Excel-Datei hoch. Eine Vorschau zeigt Anzahl und erste Zeilen der zu importierenden User und Bücher. Die Spalten müssen dem Export-Format entsprechen. Ein [Beispiel-Excel](./doc/sample_export.xlsx) steht zur Verfügung.

![Import Screen](./doc/excel_import_screen1.png)

**Schritt 2 - Import**: Wenn die Vorschau korrekt aussieht, klicken Sie `In die Datenbank importieren`. Es muss bereits eine leere Datenbank existieren.

### Import aus OpenBiblio

Detaillierte Informationen zum Import aus OpenBiblio und anderen Tools finden Sie in den [Import-Schritten](./doc/OpenBiblioImport.md).

**Datenmodell**: Das Buch-Schema umfasst zahlreiche Felder (alle optional außer Titel und Autor). Details finden Sie im [Schema](./prisma/schema.prisma).

Wichtige Felder: id (Mediennummer), rentalStatus, rentedDate, dueDate, renewalCount, title, subtitle, author, topics, imageLink, isbn, editionDescription, publisherLocation, pages, summary, minPlayers, publisherName, otherPhysicalAttributes, supplierComment, publisherDate, physicalSize, minAge, maxAge, additionalMaterial, price, externalLinks.

**Cover-Import**

- ISBN-Service: [https://openlibrary.org/isbn/9780140328721](https://openlibrary.org/isbn/9780140328721)
- Cover: [https://covers.openlibrary.org/13834659](https://covers.openlibrary.org/13834659)

---


## 📧 Kontakt & Unterstützung

**Mitmachen**: Möchten Sie die Software nutzen, zur Entwicklung beitragen oder Hosting-Unterstützung erhalten? Kontaktieren Sie uns unter [info@openlibry.de](mailto:info@openlibry.de).

**Finanzielle Unterstützung**: Sie können das Projekt auf [Ko-Fi](https://ko-fi.com/jzakotnik) unterstützen.

---

**OpenLibry** - Entwickelt mit ❤️ für Schulbibliotheken und ehrenamtliche Helfer
