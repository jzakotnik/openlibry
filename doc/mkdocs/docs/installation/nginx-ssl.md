# nginx & SSL einrichten (Add-on)

Diese Anleitung zeigt, wie du OpenLibry über HTTPS mit eigener Domain erreichbar machst. Sie funktioniert **mit beiden Installationsmethoden** – ob Container oder ohne.

## Voraussetzungen

- OpenLibry läuft bereits auf `localhost:3000` (egal ob Container oder Node.js)
- Ein Server mit öffentlicher IP-Adresse
- Eine Domain, die auf diese IP zeigt (z.B. `bibliothek.schule.de`)
- Port 80 und 443 müssen offen sein

## Wie es funktioniert

```
Internet → nginx (Port 443, HTTPS) → OpenLibry (Port 3000)
```

nginx nimmt Anfragen aus dem Internet entgegen, terminiert SSL und leitet sie an OpenLibry weiter.

## Schritt 1: nginx installieren

```bash
sudo apt update
sudo apt install nginx -y

# Prüfen
sudo systemctl status nginx
```

## Schritt 2: Site-Konfiguration erstellen

Ersetze `bibliothek.schule.de` durch deine Domain:

```bash
sudo nano /etc/nginx/sites-available/openlibry
```

Inhalt:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name bibliothek.schule.de www.bibliothek.schule.de;

    # Weiterleitung zu HTTPS (wird später von Certbot aktiviert)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
    }

    # Wichtig: Große Uploads erlauben (Cover-Fotos vom Handy)
    client_max_body_size 20M;
    client_body_buffer_size 20M;
}
```

Site aktivieren:

```bash
# Symlink erstellen
sudo ln -s /etc/nginx/sites-available/openlibry /etc/nginx/sites-enabled/

# Konfiguration prüfen
sudo nginx -t

# nginx neu laden
sudo systemctl reload nginx
```

Jetzt sollte OpenLibry unter `http://bibliothek.schule.de` erreichbar sein (noch ohne HTTPS).

## Schritt 3: SSL-Zertifikat mit Let's Encrypt

Certbot installieren und Zertifikat anfordern:

```bash
# Certbot installieren
sudo apt install certbot python3-certbot-nginx -y

# Zertifikat anfordern (interaktiv)
sudo certbot --nginx -d bibliothek.schule.de -d www.bibliothek.schule.de
```

Certbot wird:
1. Ein kostenloses SSL-Zertifikat erstellen
2. Die nginx-Konfiguration automatisch anpassen
3. Automatische Erneuerung einrichten

Danach ist OpenLibry unter `https://bibliothek.schule.de` erreichbar.

## Die finale Konfiguration

Nach Certbot sieht die Konfiguration ungefähr so aus:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name bibliothek.schule.de www.bibliothek.schule.de;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name bibliothek.schule.de www.bibliothek.schule.de;

    ssl_certificate /etc/letsencrypt/live/bibliothek.schule.de/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/bibliothek.schule.de/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
    }

    client_max_body_size 20M;
    client_body_buffer_size 20M;
}
```

## Mehrere Instanzen auf einem Server

Du kannst mehrere OpenLibry-Instanzen (für verschiedene Schulen) auf demselben Server betreiben:

1. Jede Instanz läuft auf einem anderen Port (3000, 3001, 3002, ...)
2. Jede hat ihre eigene nginx-Konfiguration und Domain

Beispiel für eine zweite Schule auf Port 3001:

```nginx
server {
    listen 80;
    server_name bibliothek.andere-schule.de;

    location / {
        proxy_pass http://localhost:3001;
        # ... (Rest wie oben)
    }
}
```

## Nützliche Befehle

```bash
# nginx-Konfiguration testen
sudo nginx -t

# nginx neu laden (ohne Unterbrechung)
sudo systemctl reload nginx

# nginx neu starten
sudo systemctl restart nginx

# nginx-Status
sudo systemctl status nginx

# SSL-Zertifikat manuell erneuern
sudo certbot renew --dry-run  # Test
sudo certbot renew            # Wirklich erneuern

# Logs anzeigen
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## Fehlerbehebung

### 502 Bad Gateway

OpenLibry läuft nicht. Prüfe:

```bash
# Läuft OpenLibry?
curl http://localhost:3000

# Container-Variante
docker compose ps

# Node.js-Variante
pm2 status
```

### SSL-Zertifikat läuft ab

Certbot erneuert automatisch. Falls nicht:

```bash
sudo certbot renew
sudo systemctl reload nginx
```

### Große Uploads schlagen fehl

Erhöhe `client_max_body_size` in der nginx-Konfiguration.

### WebSocket-Fehler

Stelle sicher, dass die `Upgrade` und `Connection` Header in der Konfiguration gesetzt sind.

## Nächste Schritte

- [Konfiguration](../configuration/index.md) – Labels, Mahnungen, etc.
- [Monitoring](../operations/monitoring.md) – Logs und Überwachung
