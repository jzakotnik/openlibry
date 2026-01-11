# Installation ohne Container (Node.js)

Diese Anleitung führt dich durch die Installation von OpenLibry direkt auf dem System – ideal für Raspberry Pi oder wenn du volle Kontrolle brauchst.

**Willst du HTTPS mit eigener Domain?** Folge erst dieser Anleitung, dann [nginx & SSL](nginx-ssl.md).

## Voraussetzungen

- Linux-System (Ubuntu, Debian, Raspberry Pi OS)
- Mindestens 1 GB RAM (2 GB empfohlen)
- 2 GB freier Speicherplatz

## Schritt 1: System vorbereiten

```bash
# System aktualisieren
sudo apt-get update
sudo apt-get upgrade -y

# Benötigte Pakete installieren
sudo apt install curl git -y
```

## Schritt 2: Node.js installieren

Wir nutzen den Node Version Manager (nvm) für eine saubere Installation:

```bash
# nvm installieren
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash

# Terminal neu starten oder:
source ~/.bashrc

# Node.js LTS installieren
nvm install --lts

# Prüfen
node --version
npm --version
```

## Schritt 3: OpenLibry herunterladen

```bash
# Repository klonen
git clone https://github.com/jzakotnik/openlibry.git
cd openlibry

# Environment-Datei erstellen
cp .env_example .env
```

## Schritt 4: Environment konfigurieren

Bearbeite die `.env`-Datei:

```bash
nano .env
```

Wichtige Einstellungen:

```env
AUTH_ENABLED=false
NEXTAUTH_SECRET=dein-geheimer-schluessel-hier
DATABASE_URL=file:./database/dev.db
```

**Tipp**: Generiere einen sicheren NEXTAUTH_SECRET mit `openssl rand -base64 32`.

## Schritt 5: Abhängigkeiten installieren

```bash
npm install
```

Auf einem Raspberry Pi kann das einige Minuten dauern.

## Schritt 6: Datenbank einrichten

```bash
npx prisma db push
```

## Schritt 7: OpenLibry starten

### Zum Testen (Entwicklungsmodus)

```bash
npm run dev
```

Öffne `http://localhost:3000` im Browser. Mit `Strg+C` beenden.

### Für Produktion

Für den Dauerbetrieb nutzen wir pm2 als Prozess-Manager:

```bash
# pm2 global installieren
npm install -g pm2

# Produktions-Build erstellen
npm run build

# Mit pm2 starten
pm2 start npm --name "openlibry" -- start

# Autostart nach Neustart aktivieren
pm2 startup
pm2 save
```

## Schritt 8: Ersten Benutzer anlegen

1. Öffne `http://localhost:3000/auth/register`
2. Erstelle einen Admin-Benutzer
3. Bearbeite die `.env` und setze `AUTH_ENABLED=true`
4. Neu starten: `pm2 restart openlibry`

## pm2-Befehle

```bash
# Status anzeigen
pm2 status

# Logs anzeigen
pm2 logs openlibry

# Neu starten
pm2 restart openlibry

# Stoppen
pm2 stop openlibry

# Aus pm2 entfernen
pm2 delete openlibry
```

## Port-Freigabe

Falls eine Firewall installiert ist, muss Port 3000 freigegeben sein:

```bash
# Mit ufw (Ubuntu)
sudo ufw allow 3000

# Prüfen
sudo ufw status
```

Dann erreichbar unter `http://<IP-ADRESSE>:3000`.

## Raspberry Pi: Performance-Tipps

Auf einem Raspberry Pi kann OpenLibry etwas langsamer sein. Einige Tipps:

1. **Swap erhöhen** (bei wenig RAM):
   ```bash
   sudo nano /etc/dphys-swapfile
   # CONF_SWAPSIZE=1024 setzen
   sudo systemctl restart dphys-swapfile
   ```

2. **Build auf schnellerem Rechner**: Du kannst den Build auf einem schnelleren Computer erstellen und dann nur die fertigen Dateien auf den Pi kopieren.

3. **Caching**: Nach dem ersten Laden sind die meisten Seiten schneller, da Next.js cacht.

## Updates installieren

```bash
cd ~/openlibry

# Neueste Version holen
git pull

# Abhängigkeiten aktualisieren
npm install

# Datenbank-Schema aktualisieren
npx prisma db push

# Neu bauen und starten
npm run build
pm2 restart openlibry
```

## Nächste Schritte

- [nginx & SSL einrichten](nginx-ssl.md) – Für HTTPS und eigene Domain
- [Konfiguration](../configuration/index.md) – Labels, Mahnungen, etc.
- [Upgrading](upgrading.md) – Auf neue Versionen aktualisieren
