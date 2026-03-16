# Schnellstart

Du willst OpenLibry in 5 Minuten ausprobieren? Los geht's!

## Voraussetzung: Docker

Du brauchst Docker auf deinem Computer. Falls noch nicht installiert:

=== "Windows"

    Lade [Docker Desktop](https://www.docker.com/products/docker-desktop/) herunter und installiere es.

=== "macOS"

    Lade [Docker Desktop](https://www.docker.com/products/docker-desktop/) herunter und installiere es.
    
    Oder mit Homebrew:
    ```bash
    brew install --cask docker
    ```

=== "Linux"

    ```bash
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker $USER
    # Abmelden und wieder anmelden
    ```

## OpenLibry starten

Öffne ein Terminal und führe folgende Befehle aus:
```bash
docker run --rm -p 3000:3000 \
  --name openlibry \
  -e NEXTAUTH_SECRET=wunschpunsch \
  -e SECURITY_HEADERS=insecure \
  -e COVERIMAGE_FILESTORAGE_PATH=/app/database \
  jzakotnik/openlibry:release
```

!!! info "Was macht dieser Befehl?"
    - `--rm` – Entfernt den Container automatisch beim Beenden
    - `-p 3000:3000` – Macht Port 3000 erreichbar
    - `-e ...` – Setzt temporäre Umgebungsvariablen für die Konfiguration
    - `jzakotnik/openlibry:release` – Das offizielle OpenLibry-Image

Achtung, das ist keine permanente Installation sondern nur eine temporäre "Spiel-Installation". Wenn der Docker Container beendet wird, sind auch die Daten weg.

Falls Du noch ein paar Beispiel-Daten (10 Bücher, 5 User, 2 Ausleihen) in der Installation haben möchtest, führe diesen Docker Container aus, der diese über die OpenLibry API anlegt:
```bash
docker run --rm --network host jzakotnik/openlibry-demoseeder:release
```

## OpenLibry öffnen

Öffne deinen Browser und gehe zu:

**[http://localhost:3000](http://localhost:3000)** oder zu der Domain/IP wo es installiert ist

🎉 **Geschafft!** Du solltest jetzt die OpenLibry-Startseite sehen.

## Erste Schritte in OpenLibry

### 1. Einen Testnutzer anlegen

1. Klicke auf **Nutzer** in der Navigation
2. Klicke auf das **+** Symbol
3. Gib einen Namen ein, z.B. "Max Mustermann"
4. Wähle eine Klasse, z.B. "3a"
5. Speichern

### 2. Ein Testbuch anlegen

1. Klicke auf **Bücher** in der Navigation
2. Klicke auf das **+** Symbol
3. Gib einen Titel ein, z.B. "Die kleine Raupe Nimmersatt"
4. Gib einen Autor ein, z.B. "Eric Carle"
5. Speichern

### 3. Eine Ausleihe durchführen

1. Klicke auf **Leihe** in der Navigation
2. Suche links den Nutzer "Max Mustermann"
3. Klicke auf den Nutzer, um ihn zu öffnen
4. Suche rechts das Buch "Raupe"
5. Klicke auf das Ausleihe-Symbol ▶️

**Das war's!** Das Buch ist jetzt an Max Mustermann ausgeliehen.

### 4. Öffentlichen Katalog ansehen

OpenLibry hat eine öffentliche Katalogseite, die **ohne Login** erreichbar ist:

**[http://localhost:3000/catalog](http://localhost:3000/catalog)**

Dort können Schülerinnen und Schüler den Buchbestand durchsuchen und sehen, ob ein Buch gerade verfügbar oder ausgeliehen ist — ohne Zugang zum Verwaltungsbereich zu brauchen. Du kannst den Link z.B. auf der Schulwebseite oder im Klassenzimmer aushängen.

!!! tip "Katalog teilen"
    Der Katalog zeigt nur Buchtitel, Autor, Themen und den Verfügbarkeitsstatus. Keine Nutzerdaten, keine Ausleihhistorie.

## Beenden und aufräumen

### OpenLibry stoppen

In der Testinstallation kann man den Docker container mit `Ctrl-C` beenden oder:

```bash
docker stop $(docker ps -q --filter ancestor=jzakotnik/openlibry:release)
```

### Komplett entfernen

```bash
# Container stoppen und löschen
docker rm -f $(docker ps -aq --filter ancestor=jzakotnik/openlibry:release)

# Image löschen (optional)
docker rmi jzakotnik/openlibry:release

# Datenbank löschen (optional)
rm -rf database/
```

## Wie geht's weiter?

Du hast OpenLibry ausprobiert und bist überzeugt? Super!

- [Voraussetzungen](requirements.md) – Was du für eine richtige Installation brauchst
- [Docker-Installation](../installation/container.md) – Produktive Docker-Installation
- [Bare Metal](../installation/ohne-container.md) – Installation ohne Docker (z.B. Raspberry Pi)
- [Erste Einrichtung](first-steps.md) – Deine Bibliothek einrichten