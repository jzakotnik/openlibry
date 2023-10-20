# Eigene Installation auf einem Server mit Subdomain 

Für eine Installation auf einer Subdomain mit `nginx` als Web-Server, `certbot` für SSL Zertifikate, und `pm2` als node manager, diese Schritte befolgen:

- Allgemeiner [Guide](https://dev.to/knowbee/how-to-setup-secure-subdomains-using-nginx-and-certbot-on-a-vps-4m8h) um eine Subdomain und Certbot in Nginx zu konfigurieren, das ist recht praktisch.

- In dem allgemeinen Guide wird eine Subdomain in `/sites-available` in `nginx` angelegt. Beispielhaft ein config file für `sandbox.openlibry.de`. In `<port>` den entsprechenden Port des Node Servers anlegen.

```nginx
# sandbox.openlibry.de subdomain server block
server {
    listen 80;
    listen [::]:80;
    server_name sandbox.openlibry.de www.sandbox.openlibry.de;
    error_page 497 https://sandbox.openlibry.de$request_uri;
    return 301 https://sandbox.openlibry.de$request_uri;
}

server {
    listen 443 ssl;
    root /var/www/sandbox.openlibry.de;
    index index.html index.htm;
    server_name www.sandbox.openlibry.de;

    # ssl configuration;
    ssl_certificate /etc/letsencrypt/live/sandbox.openlibry.de/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/sandbox.openlibry.de/privkey.pem;

    return 301 https:/sandbox.openlibry.de$request_uri;
}
server {
    listen 443 ssl;
    root /var/www/sandbox.openlibry.de;
    index index.html index.htm;
    server_name sandbox.openlibry.de;

    location / {
    # Reverse proxy for Next server
    proxy_pass http://localhost:<port>;
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

    # ssl configuration;
    ssl_certificate /etc/letsencrypt/live/sandbox.openlibry.de/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/sandbox.openlibry.de/privkey.pem;
}
```


- `git clone` ins repository mit den Installationen

- Anpassen der `.env` Datei im Projektverzeichnis:
```
NEXT_PUBLIC_API_URL=http://<domain>:<port>
DATABASE_URL  = file:./database/dev.db
```

- Falls mehrere node Instanzen laufen, am Besten den Port ändern in `package.json`:
```json
{
  "name": "openlibry",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "PORT=3020 next start",
    "lint": "next lint"
  }
}
```
- Dependencies installieren mit `npm install`
- Leere Datenbank erzeugen mit `npx prisma db push`
- Falls eine Datenbank verfügbar ist, diese kopieren
- Next Build erzeugen mit `npm run build`
- Mit `npm start` den build testen.
- Damit die app auch nach restart startet, am Besten bei `pm2` registrieren und mit dem entsprechenden port starten `NODE_PORT=3020 HOST=0.0.0.0 && pm2 start npm --name "sandboxopenlibry" -- start`
- Mit `pm2 list` sollte die App sichtbar sein

