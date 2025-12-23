# Bare Metal Installation

Installation direkt auf dem System, ohne Docker. Ideal für Raspberry Pi oder wenn du volle Kontrolle brauchst.

## Voraussetzungen

- Linux-System (Ubuntu, Debian, Raspberry Pi OS)
- Internetzugang für die Installation
- Terminal-Zugang

## System vorbereiten

### System aktualisieren

```bash
sudo apt-get update
sudo apt-get upgrade -y
```

### Benötigte Pakete installieren

```bash
# Curl installieren (falls nicht vorhanden)
sudo apt install curl git -y
```

## Node.js installieren

Wir empfehlen NVM (Node Version Manager) für flexible Node.js-Versionen.

### NVM installieren

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
```

!!! warning "Terminal neu starten"
    Schließe das Terminal und öffne es neu, damit NVM verfügbar ist.

### Node.js installieren

```bash
# LTS-Version installieren (empfohlen)
nvm install --lts

# Prüfen
node --version  # Sollte v18.x oder höher zeigen
npm --version
```

## OpenLibry installieren

### Repository klonen

```bash
git clone https://github.com/jzakotnik/openlibry.git
cd openlibry
```

### Environment-Datei erstellen

```bash
cp .env_example .env
```

### Environment-Datei anpassen

Öffne die `.env`-Datei mit einem Editor:

```bash
nano .env
```

Mindestens diese Werte anpassen:

```env
# Authentifizierung erstmal deaktivieren
AUTH_ENABLED=false

# Ein sicheres Geheimnis (beliebiger langer Text)
AUTH_SECRET=hierEinLangesZufälligesGeheimnis123!

# Datenbank-Pfad
DATABASE_URL=file:./database/dev.db
```

Speichern mit ++ctrl+x++, dann ++y++, dann ++enter++.

### Node-Pakete installieren

```bash
npm install
```

Das dauert ein paar Minuten, besonders auf dem Raspberry Pi.

### Datenbank erstellen

```bash
npx prisma db push
```

## OpenLibry starten

### Entwicklungsmodus (zum Testen)

```bash
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000) oder `http://<ip-adresse>:3000`.

Beenden mit ++ctrl+c++.

### Produktionsmodus

Für den dauerhaften Betrieb:

```bash
# Einmalig: Produktions-Build erstellen
npm run build

# Starten
npm start
```

## Dauerhafter Betrieb mit pm2

pm2 ist ein Prozessmanager, der OpenLibry automatisch neu startet.

### pm2 installieren

```bash
npm install -g pm2
```

### OpenLibry mit pm2 starten

```bash
# Im openlibry-Verzeichnis
pm2 start npm --name "openlibry" -- start
```

### Autostart einrichten

```bash
# Startskript generieren
pm2 startup

# Den angezeigten Befehl ausführen (mit sudo)
# z.B.: sudo env PATH=$PATH:/home/pi/.nvm/versions/node/v18.x.x/bin pm2 startup systemd -u pi --hp /home/pi

# Aktuelle Prozesse speichern
pm2 save
```

### pm2-Befehle

```bash
# Status anzeigen
pm2 status

# Logs anzeigen
pm2 logs openlibry

# Neu starten
pm2 restart openlibry

# Stoppen
pm2 stop openlibry
```

## Raspberry Pi Besonderheiten

### Empfohlene Hardware

- Raspberry Pi 4 (2 GB RAM oder mehr)
- Schnelle SD-Karte (Class 10) oder SSD
- Aktive Kühlung empfohlen

### Performance-Tipps

1. **SSD statt SD-Karte**: Deutlich schneller und langlebiger
2. **Swap vergrößern**: Falls nur 1 GB RAM

```bash
# Swap vergrößern auf 2 GB
sudo dphys-swapfile swapoff
sudo nano /etc/dphys-swapfile
# CONF_SWAPSIZE=2048 setzen
sudo dphys-swapfile setup
sudo dphys-swapfile swapon
```

### ARM64 vs ARM32

OpenLibry läuft auf beiden Architekturen. Für beste Performance:

- **Raspberry Pi 4**: 64-bit OS verwenden
- **Raspberry Pi 3**: 32-bit OK, 64-bit möglich

## Firewall konfigurieren

Falls eine Firewall aktiv ist:

```bash
# Mit ufw
sudo ufw allow 3000/tcp

# Mit iptables
sudo iptables -A INPUT -p tcp --dport 3000 -j ACCEPT
```

## Updates

### Manuelles Update

```bash
cd openlibry

# Änderungen holen
git pull

# Abhängigkeiten aktualisieren
npm install

# Datenbank-Schema aktualisieren (falls nötig)
npx prisma db push

# Neu bauen
npm run build

# Neu starten
pm2 restart openlibry
```

### Update-Skript

Erstelle ein Skript für einfache Updates:

```bash title="update.sh"
#!/bin/bash
cd /home/pi/openlibry
git pull
npm install
npx prisma db push
npm run build
pm2 restart openlibry
echo "Update abgeschlossen!"
```

```bash
chmod +x update.sh
./update.sh
```

## Fehlerbehebung

### "ENOSPC: System limit for number of file watchers reached"

```bash
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### Node.js zu alt

```bash
nvm install --lts
nvm use --lts
```

### Datenbank-Fehler nach Update

```bash
npx prisma db push --force-reset
```

!!! danger "Vorsicht"
    `--force-reset` löscht alle Daten! Vorher Backup machen.

## Nächste Schritte

- [Erste Einrichtung](../getting-started/first-steps.md)
- [nginx & pm2](nginx-pm2.md) – Für HTTPS und eigene Domain
- [Performance](../troubleshooting/performance.md) – Wenn's langsam ist
