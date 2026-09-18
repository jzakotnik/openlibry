# Voraussetzungen

Was brauchst du, um OpenLibry zu betreiben? Die gute Nachricht: Nicht viel!

## Hardware

### Minimal (zum Testen)

- Jeder einigermaßen aktuelle Computer, der als Server für die OpebnLibry Webseite läuft
- 512 MB RAM
- 500 MB Festplatte

### Empfohlen (produktiver Einsatz)

| Komponente | Empfehlung |
|------------|------------|
| CPU | Dual-Core oder besser |
| RAM | 1 GB |
| Speicher | 2 GB (abhängig von Cover-Bildern) |
| Netzwerk | Erreichbar im Schulnetzwerk |

### Raspberry Pi

OpenLibry läuft wunderbar auf einem Raspberry Pi! Getestet mit:

- Raspberry Pi 4 (2 GB RAM) – läuft super ✅
- Raspberry Pi 3 – funktioniert, etwas langsamer ⚠️
- Raspberry Pi Zero – nicht empfohlen ❌

!!! tip "Raspberry Pi Tipp"
    Verwende eine schnelle SD-Karte (Class 10 oder besser) oder besser noch eine SSD über USB. Die Datenbank profitiert stark von schnellem Speicher.

## Software

### Mit Docker (empfohlen)

Du brauchst nur:

- **Docker** – [Installation](https://docs.docker.com/get-docker/)
- **Docker Compose** (optional) – Für einfachere Konfiguration

Das war's! Docker kümmert sich um alles andere.

### Ohne Docker ("Bare Metal" Server)

- **Node.js** – Version 18 oder neuer (LTS empfohlen)
- **npm** – Kommt mit Node.js
- **Git** – Zum Klonen des Repositories

Optional:
- **nginx** – Als Reverse Proxy für HTTPS
- **pm2** – Prozessmanager für dauerhaften Betrieb
- **certbot** – Für SSL-Zertifikate

## Netzwerk

### Lokaler Betrieb

Wenn OpenLibry nur auf einem Computer läuft, brauchst du nichts Besonderes - Du kannst die Webseite direkt im Browser öffnen auf dem gleichen Computer.

### Im Schulnetzwerk

Damit andere Computer auf OpenLibry zugreifen können:

- Der OpenLibry-Server muss im Netzwerk erreichbar sein
- Der Port (Standard: 3000) muss freigegeben sein
- Alle Clients (Computer, Tablets) brauchen Zugang zum Netzwerk

### Aus dem Internet erreichbar

Wenn du OpenLibry von überall erreichen willst:

- Eigene Domain (z.B. `bibliothek.deine-schule.de`)
- Reverse Proxy (nginx empfohlen)
- SSL-Zertifikat (Let's Encrypt ist kostenlos)
- Port-Weiterleitung oder Hosting bei einem Provider

Siehe [Installation mit nginx](../installation/nginx-ssl.md) für Details.

## Browser

OpenLibry funktioniert mit allen modernen Browsern:

- ✅ Chrome / Chromium
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ⚠️ Internet Explorer – nicht unterstützt

## Barcode-Scanner

OpenLibry funktioniert mit jedem USB-Barcode-Scanner, der sich wie eine Tastatur verhält (das sind fast alle).

### Empfohlene Einstellungen

Die meisten Scanner funktionieren out-of-the-box. Ideal ist:

- **Enter nach Scan** – Der Scanner sendet nach dem Barcode automatisch Enter
- **Code 128** – Standardformat für Buch-Barcodes

!!! tip "Scanner testen"
    Öffne einen Texteditor und scanne einen Barcode. Wenn der Code erscheint und der Cursor in die nächste Zeile springt, ist alles perfekt eingestellt.

### Ohne Scanner

Kein Problem! Du kannst auch alles über die Tastatur eingeben. Die Suche funktioniert auch mit Teilen des Titels oder Namens.

Alternativ scannt die [Express Leihe](../user-guide/lending.md#express-leihe-alternative-scan) Barcodes über die Gerätekamera (Smartphone, Tablet, Webcam) – ganz ohne separaten Scanner.

## Kenntnisse

### Für die Installation

- Grundlegende Terminal/Kommandozeilen-Kenntnisse
- Docker-Grundlagen (wenn du Docker verwendest)
- Oder: Ein IT-affiner Mensch, der dir hilft 😊

### Für den täglichen Betrieb

- Keine besonderen IT-Kenntnisse nötig
- Die Oberfläche ist selbsterklärend
- Ehrenamtliche können nach kurzer Einweisung loslegen

## Checkliste

Bevor du mit der Installation beginnst:

- [ ] Hardware bereit (Computer, Server, oder Raspberry Pi)
- [ ] Docker installiert ODER Node.js installiert
- [ ] Netzwerk geklärt (lokal, Schulnetzwerk, Internet?)
- [ ] Barcode-Scanner vorhanden (optional)
- [ ] Zeit für die Einrichtung (~30 Minuten bis 2 Stunden)

Alles da? Dann weiter zur [Installation](../installation/index.md)!
