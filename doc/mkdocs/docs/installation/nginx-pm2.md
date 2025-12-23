# Installation mit nginx & pm2

Für den professionellen Produktivbetrieb: HTTPS, eigene Domain, mehrere Instanzen.

## Übersicht

Diese Anleitung zeigt dir, wie du OpenLibry mit:

- **nginx** als Reverse Proxy
- **pm2** als Prozessmanager
- **Let's Encrypt** für kostenlose SSL-Zertifikate

betreibst.

![Architektur-Diagramm](../assets/openlibryinstall.png)

## Voraussetzungen

- Ein Server mit öffentlicher IP-Adresse
- Eine eigene Domain (z.B. `bibliothek.deine-schule.de`)
- DNS-Eintrag, der auf deinen Server zeigt
- Ubuntu/Debian als Betriebssystem

## 1. Grundinstallation

Folge zunächst der [Bare Metal Installation](bare-metal.md) bis zum Punkt "OpenLibry starten".

## 2. nginx installieren

```bash
sudo apt install nginx -y
```

### nginx starten und aktivieren

```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

## 3. Certbot installieren

Certbot erstellt kostenlose SSL-Zertifikate von Let's Encrypt.

```bash
sudo apt install certbot python3-certbot-nginx -y
```

## 4. nginx konfigurieren

### Konfigurationsdatei erstellen

Ersetze `bibliothek.deine-schule.de` mit deiner Domain:

```bash
sudo nano /etc/nginx/sites-available/openlibry
```

```nginx title="/etc/nginx/sites-available/openlibry"
# HTTP -> HTTPS Weiterleitung
server {
    listen 80;
    listen [::]:80;
    server_name bibliothek.deine-schule.de www.bibliothek.deine-schule.de;
    
    return 301 https://bibliothek.deine-schule.de$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl;
    server_name bibliothek.deine-schule.de;
    
    # Wichtig: Größere Uploads erlauben (z.B. Cover-Bilder)
    client_max_body_size 20M;
    client_body_buffer_size 20M;
    
    # SSL-Zertifikate (werden von Certbot eingefügt)
    # ssl_certificate /etc/letsencrypt/live/bibliothek.deine-schule.de/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/bibliothek.deine-schule.de/privkey.pem;
    
    location / {
        # Reverse Proxy zu OpenLibry
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        
        # WebSocket-Support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Header weiterleiten
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
    }
}
```

### Konfiguration aktivieren

```bash
# Symlink erstellen
sudo ln -s /etc/nginx/sites-available/openlibry /etc/nginx/sites-enabled/

# Konfiguration testen
sudo nginx -t

# nginx neu laden
sudo systemctl reload nginx
```

## 5. SSL-Zertifikat erstellen

```bash
sudo certbot --nginx -d bibliothek.deine-schule.de
```

Certbot wird:

1. Deine Domain verifizieren
2. Ein Zertifikat erstellen
3. Die nginx-Konfiguration automatisch anpassen

!!! tip "Automatische Erneuerung"
    Certbot richtet automatisch einen Cronjob ein, der das Zertifikat vor Ablauf erneuert.

## 6. pm2 einrichten

Falls noch nicht geschehen:

```bash
npm install -g pm2
```

### OpenLibry mit pm2 starten

```bash
cd /pfad/zu/openlibry
pm2 start npm --name "openlibry" -- start
```

### Autostart einrichten

```bash
pm2 startup
# Führe den angezeigten Befehl aus
pm2 save
```

## 7. Testen

Öffne `https://bibliothek.deine-schule.de` im Browser.

Du solltest:

- ✅ HTTPS (grünes Schloss) sehen
- ✅ OpenLibry laden
- ✅ Keine Zertifikatswarnungen bekommen

## Mehrere Instanzen

Du kannst mehrere Schulen auf einem Server betreiben:

### Verzeichnisstruktur

```
/var/www/
├── schule-nord/
│   ├── openlibry/
│   └── .env
├── schule-sued/
│   ├── openlibry/
│   └── .env
└── schule-ost/
    ├── openlibry/
    └── .env
```

### pm2 Ecosystem-Datei

```javascript title="ecosystem.config.js"
module.exports = {
  apps: [
    {
      name: 'openlibry-nord',
      cwd: '/var/www/schule-nord/openlibry',
      script: 'npm',
      args: 'start',
      env: {
        PORT: 3001
      }
    },
    {
      name: 'openlibry-sued',
      cwd: '/var/www/schule-sued/openlibry',
      script: 'npm',
      args: 'start',
      env: {
        PORT: 3002
      }
    },
    {
      name: 'openlibry-ost',
      cwd: '/var/www/schule-ost/openlibry',
      script: 'npm',
      args: 'start',
      env: {
        PORT: 3003
      }
    }
  ]
};
```

```bash
pm2 start ecosystem.config.js
pm2 save
```

### nginx für mehrere Instanzen

Erstelle für jede Subdomain eine eigene nginx-Konfiguration:

```nginx title="/etc/nginx/sites-available/openlibry-nord"
server {
    listen 443 ssl;
    server_name nord.bibliothek.de;
    
    ssl_certificate /etc/letsencrypt/live/nord.bibliothek.de/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/nord.bibliothek.de/privkey.pem;
    
    client_max_body_size 20M;
    
    location / {
        proxy_pass http://localhost:3001;  # Port für nord
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Fehlerbehebung

### 502 Bad Gateway

OpenLibry läuft nicht. Prüfe:

```bash
pm2 status
pm2 logs openlibry
```

### Zertifikat abgelaufen

```bash
sudo certbot renew
sudo systemctl reload nginx
```

### Große Dateien werden blockiert

Erhöhe `client_max_body_size` in der nginx-Konfiguration.

### WebSocket-Fehler

Stelle sicher, dass die `proxy_set_header`-Zeilen für Upgrade und Connection vorhanden sind.

## Backup-Strategie

Bei einem professionellen Setup solltest du regelmäßige Backups einrichten:

```bash title="backup.sh"
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=/var/backups/openlibry

mkdir -p $BACKUP_DIR

# Datenbank sichern
cp /var/www/openlibry/database/dev.db $BACKUP_DIR/dev_$DATE.db

# Alte Backups löschen (älter als 30 Tage)
find $BACKUP_DIR -name "*.db" -mtime +30 -delete
```

```bash
# Täglich um 3 Uhr ausführen
echo "0 3 * * * /var/www/openlibry/backup.sh" | sudo crontab -
```

## Nächste Schritte

- [Umgebungsvariablen](../configuration/environment-variables.md) – Alle Einstellungen
- [Backup & Restore](../export/backup-restore.md) – Datensicherung
- [Performance](../troubleshooting/performance.md) – Optimierung
