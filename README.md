# OpenLibry - Die einfache und freie Software für die Schulbibliothek

**OpenLibry** ist eine moderne, benutzerfreundliche Open-Source-Lösung für kleine Bibliotheken, insbesondere in Schulen. Die Software wurde speziell für den hektischen Alltag entwickelt, in dem Kinder Bücher ausleihen, zurückgeben und verwalten.

## Was macht OpenLibry besonders?

OpenLibry entstand aus dem Bedarf einer Grundschule, in der die veraltete OpenBiblio-Software nicht mehr zeitgemäß war. Viele Eltern und Freiwillige engagieren sich ehrenamtlich in Schulbibliotheken - doch kostenlose, moderne digitale Lösungen fehlen oft. OpenLibry schließt diese Lücke mit einer schlanken, intuitiven Software, die auf wenige Klicks optimiert ist und sowohl auf Computern als auch auf Tablets und Smartphones läuft.

---

## 📋 Navigation - Was möchten Sie tun?

### 🔍 [1. Mehr über die Software erfahren](#-software-info)
Entdecken Sie die Features, sehen Sie Screenshots und verstehen Sie, wie OpenLibry funktioniert.

### 💻 [2. OpenLibry installieren](#-installation)
Schritt-für-Schritt Anleitungen für verschiedene Installationsmethoden (Bare Metal, Docker, nginx).

### ⚙️ [3. Software konfigurieren](#%EF%B8%8F-konfiguration)
Passen Sie OpenLibry an Ihre Bedürfnisse an - von Ausleihzeiten bis zu Bücherlabels.

### 📖 [4. Die Software benutzen](#-benutzung)
Lernen Sie die tägliche Arbeit mit OpenLibry kennen - Ausleihe, Verwaltung, Reports.

### 🔄 [5. Daten importieren/exportieren](#-import--export)
Importieren Sie bestehende Daten aus anderen Systemen oder erstellen Sie Backups.

### 🔧 [6. API & Entwicklung](#-api--entwicklung)
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
![Überblick Screenshot](./doc/titel1.jpg)

**Ausleih-Screen**
![Leihe Screenshot](./doc/screen1.jpg)

**Bücherverwaltung**
![Bücher Liste Screenshot](./doc/buch1.jpg)

**Buch bearbeiten**
![Bücher Edit Screenshot](./doc/buchedit1.jpg)

---

## 💻 Installation

### Vorbereitung

Kopieren Sie zunächst das Beispiel-Environment-File und konfigurieren Sie es:

```bash
cp .env_example .env
```

**Wichtig**: Setzen Sie `AUTH_ENABLED` zunächst auf `false`, um sich beim ersten Login ohne Authentifizierung anmelden zu können. Nach der Registrierung des ersten Users über `https://<domain>/auth/register` setzen Sie den Wert auf `true`.

### Option 1: Bare Metal Installation (z.B. Raspberry Pi)

Für eine lokale Installation ohne Docker folgen Sie diesen Schritten:

```bash
# System aktualisieren
sudo apt-get update
sudo apt-get upgrade

# Curl installieren (falls nicht vorhanden)
apt install curl

# Node Version Manager installieren
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash

# Node.js installieren (nach Neustart des Terminals)
nvm install --lts

# Git installieren (falls nicht vorhanden)
sudo apt-get install git-all

# Repository klonen
git clone https://github.com/jzakotnik/openlibry.git
cd openlibry

# Environment-File vorbereiten
cp .env_example .env
nano .env  # Anpassungen vornehmen

# Node-Pakete installieren
npm install

# Leere Datenbank erstellen
npx prisma db push

# OpenLibry starten
npm run dev
```

Achten Sie darauf, dass der entsprechende Port freigegeben und über den Browser zugänglich ist.

### Option 2: Docker Installation

#### Vorarbeiten

```bash
# System aktualisieren
sudo apt-get update
sudo apt-get upgrade

# Curl installieren (falls nicht vorhanden)
sudo apt install curl

# Node Version Manager installieren
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash

# Node.js installieren (nach Terminal-Neustart)
nvm install --lts

# Git installieren (falls nicht vorhanden)
sudo apt-get install git-all
```

#### Docker selbst installieren

```bash
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu jammy stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update 
sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker ${USER}
sudo systemctl is-active docker
```

**Wichtig**: Nach der Installation ist ein Neustart erforderlich, damit die Gruppenänderungen aktiv werden.

#### OpenLibry vorbereiten

```bash
# Repository klonen
git clone https://github.com/jzakotnik/openlibry.git
cd openlibry

# Environment-File erstellen
cp .env_example .env
```

Bearbeiten Sie die `.env`-Datei und hinterlegen Sie Ihre Logos und das Mahnungs-Template im `public`-Ordner. Orientieren Sie sich dabei an den Beispieldateien.

```bash
# Docker-Image erstellen
docker build --no-cache -t openlibry:latest .
```

#### Variante A: Sandbox-Modus (zum Testen)

Ideal zum Ausprobieren ohne dauerhafte Installation:

```bash
docker run --rm -p 3000:3000 -v "$(pwd)/database:/app/database" -e AUTH_SECRET="someSecret" -e DATABASE_URL="file:/app/database/dev.db" jzakotnik/openlibry:latest
```

Öffnen Sie `http://localhost:3000` im Browser. Beenden Sie mit Strg+C. Optional können Sie das Image danach löschen: `docker image rm openlibry`

**Hinweis**: Im `./database`-Ordner wird eine Datenbankdatei angelegt. Falls dieser nicht erstellt werden kann, passen Sie die Berechtigungen an:

```bash
docker run --rm --entrypoint sh jzakotnik/openlibry:latest -c 'id -u'
sudo chown 1000:1000 database
```

#### Variante B: Dauerhafte Installation

Für den produktiven Einsatz mit automatischem Neustart:

```bash
# Container starten (startet automatisch nach Neustart/Absturz)
docker compose up

# Bei Bedarf manuell stoppen
docker stop openlibry

# Container und Image komplett entfernen
docker rm openlibry
docker image rm openlibry
```

Öffnen Sie `http://localhost:3000` im Browser.

**Docker Speicherplatz-Management**: Bei vielen Experimenten können alte Images viel Speicherplatz belegen:
- Builder-Dateien löschen: `docker builder prune`
- Alle Images löschen: `docker image prune -a`

### Option 3: Installation mit nginx und pm2

Eine detaillierte Anleitung für die Konfiguration mit dem Webserver nginx auf einer Subdomain finden Sie [hier](./doc/WebServerInstall.md).

### Ersten Benutzer anlegen

Nach der Installation:

1. Setzen Sie `AUTH_ENABLED` in `.env` auf `false`
2. Rufen Sie `/auth/register` auf und erstellen Sie einen User
3. Setzen Sie `AUTH_ENABLED` auf `true`

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

**Beispiel-Konfiguration**: 
```
["Titel: Book.title",10,"left"]
```
Dies gibt "Titel: " gefolgt vom Buchtitel in Schriftgröße 10, linksbündig aus.

![Beispiel Bücherlabel](./doc/boocklabelSpacings.png)

### Benutzerausweise konfigurieren

Benutzerausweise werden ebenfalls auf DIN A4 gedruckt und können danach zugeschnitten und laminiert werden.

**Struktur**: Ein Ausweis besteht aus einem Bild und beliebig vielen Datenblöcken darauf oder darunter.

**Größe**: `USERLABEL_WIDTH` definiert die Breite (unterstützt CSS-Einheiten wie `cm`, `px`, `vw`).

**Farbbalken**: Mit `USERLABEL_SEPARATE_COLORBAR` fügen Sie einen farbigen Balken unterhalb des Bildes ein (Größe in Pixeln).

**Beispiel-Datenblock**:
```
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

## 📖 Benutzung

### Ausleihe

Der Ausleih-Screen ist für Barcodescanner optimiert:

**Workflow**: Der Fokus liegt initial auf dem Benutzersuchfeld. Scannen Sie den Benutzerbarcode (der Scanner sollte einen Enter-Befehl senden - meist Standardeinstellung). Der Nutzer wird automatisch ausgeklappt, und Sie können Bücher manuell zurückgeben.

**Buchausleihe**: Der Fokus springt automatisch zur Büchersuche. Scannen Sie das zu leihende Buch und bestätigen Sie die Ausleihe. Nach dem Vorgang wird das Suchfeld automatisch markiert, sodass Sie direkt das nächste Buch scannen können.

**Tastatursteuerung**: Mit ESC löschen Sie den Suchfeldinhalt. Ein zweites ESC springt zurück zur Nutzersuche.

**Verlängerung**: Bücher können per Klick verlängert werden, sofern die maximale Ausleihzeit noch nicht erreicht ist.

### Benutzerverwaltung

In der Nutzerverwaltung verwalten Sie alle Leiher. Sie können mehrere Nutzer markieren und gemeinsam löschen.

**Klassenerhöhung**: Zum Schuljahreswechsel erhöhen Sie die Klassenstufe einfach durch Markierung der betroffenen Nutzer und Klick auf `+1`. Der Zahlenanteil im Klassennamen wird automatisch erhöht.

![Nutzerverwaltung - Klasse erhöhen](./doc/NutzerScreen.png)

### Bücherlabel drucken

Nach der Konfiguration (siehe [Konfiguration](#bücherlabel-konfigurieren)) drucken Sie Labels unter "REPORTS":

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

## 🔄 Import & Export

### Excel Export

Auf der Reports-Seite erstellen Sie via `Excel Export` eine Excel-Datei mit zwei Blättern:

**Userliste** enthält:
- Erzeugt am, Update am, Nummer, Nachname, Vorname, Klasse, Lehrkraft, Freigeschaltet, eMail

**Bücherliste** enthält:
- Mediennummer, Erzeugt am, Update am, Ausleihstatus, Ausgeliehen am, Rückgabe am, Anzahl Verlängerungen, Titel, Untertitel, Autor, Schlagworte, Bild, ISBN, Edition, Verlagsort, Seiten, Zusammenfassung, Min Spieler, Verlag, Merkmale, Beschaffung, Publikationsdatum, Abmessungen, Min Alter, Max Alter, Material, Preis, Links, Ausgeliehen von

### Excel Import

Auf der Reports-Seite finden Sie den `Excel Import`:

**Schritt 1 - Upload**: Laden Sie Ihre Excel-Datei hoch. Eine Vorschau zeigt Anzahl und erste Zeilen der zu importierenden User und Bücher. Die Spalten müssen dem Export-Format entsprechen. Ein [Beispiel-Excel](./doc/sample_export.xlsx) steht zur Verfügung.

![Import Screen](./doc/excel_import_screen1.png)

**Schritt 2 - Import**: Wenn die Vorschau korrekt aussieht, klicken Sie `In die Datenbank importieren`. Es muss bereits eine leere Datenbank existieren.

### Import aus OpenBiblio

Detaillierte Informationen zum Import aus OpenBiblio und anderen Tools finden Sie in den [Import-Schritten](./doc/OpenBiblioImport.md).

**Datenmodell**: Das Buch-Schema umfasst zahlreiche Felder (alle optional außer Titel und Autor). Details finden Sie im [Schema](./prisma/schema.prisma).

Wichtige Felder: id (Mediennummer), rentalStatus, rentedDate, dueDate, renewalCount, title, subtitle, author, topics, imageLink, isbn, editionDescription, publisherLocation, pages, summary, minPlayers, publisherName, otherPhysicalAttributes, supplierComment, publisherDate, physicalSize, minAge, maxAge, additionalMaterial, price, externalLinks.

**Cover-Import**:
- ISBN-Service: https://openlibrary.org/isbn/9780140328721
- Cover: https://covers.openlibrary.org/13834659

---

## 🔧 API & Entwicklung

### REST-API

OpenLibry bietet eine REST-API für die Ressourcen `book` und `user` mit den Standard-HTTP-Operationen (GET, PUT, POST, DELETE).

**Ausleihe**: Verknüpfung von User und Buch über:
```
http://localhost:3000/api/book/2001/user/1080
```

**Verwendung**: Die API eignet sich für automatisierten Import von Usern/Büchern aus anderen Programmen.

Weitere Beispiele finden Sie im [docs-Ordner](./doc/sampleAPIRequests/).

---

## 📧 Kontakt & Unterstützung

**Mitmachen**: Möchten Sie die Software nutzen, zur Entwicklung beitragen oder Hosting-Unterstützung erhalten? Kontaktieren Sie uns unter [info@openlibry.de](mailto:info@openlibry.de).

**Finanzielle Unterstützung**: Sie können das Projekt auf [Ko-Fi](https://ko-fi.com/jzakotnik) unterstützen.

---

**OpenLibry** - Entwickelt mit ❤️ für Schulbibliotheken und ehrenamtliche Helfer