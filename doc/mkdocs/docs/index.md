# Willkommen bei OpenLibry

**OpenLibry** ist die freie, moderne Software für Schulbibliotheken. Entwickelt für den Alltag, in dem ehrenamtliche Helfer Bücher verleihen, Kinder stöbern und alles schnell gehen muss.

![OpenLibry Screenshot](assets/titel1.png)

## Was macht OpenLibry besonders?

OpenLibry entstand aus einer echten Notwendigkeit: Eine Grundschule brauchte eine zeitgemäße Alternative zum veralteten OpenBiblio. Keine komplizierte Software mit tausend Optionen, sondern ein schlankes Tool, das einfach funktioniert.

<div class="grid cards" markdown>

-   :material-gesture-tap-button:{ .lg .middle } **Wenige Klicks**

    ---

    Ausleihe und Rückgabe sind auf minimale Maus- und Tastatureingaben optimiert. Perfekt für den Einsatz mit Barcodescannern.

-   :material-cloud-circle-outline:{ .lg .middle } **Überall nutzbar**

    ---

    Läuft auf Computer, Tablet und Smartphone. Die Oberfläche passt sich automatisch an.

-   :material-cloud-off:{ .lg .middle } **Deine Daten**

    ---

    Läuft auf deinem eigenen Server oder Raspberry Pi. Keine Cloud, keine Abhängigkeiten.

-   :material-open-source-initiative:{ .lg .middle } **Open Source**

    ---

    Kostenlos und frei. Der Quellcode ist auf GitHub verfügbar.

</div>

## Schnellstart

Du willst OpenLibry einfach mal ausprobieren? Mit Docker geht's am schnellsten:

```bash
docker run -d -p 3000:3000 \
  -v $(pwd)/database:/app/database \
  -e AUTH_SECRET=changeme \
  jzakotnik/openlibry:release
```

Öffne danach [http://localhost:3000](http://localhost:3000) im Browser. Fertig!

[Zur vollständigen Installationsanleitung](installation/index.md){ .md-button .md-button--primary }

## Navigation

| Du willst... | Dann schau hier |
|--------------|-----------------|
| OpenLibry ausprobieren | [Schnellstart](getting-started/quickstart.md) |
| OpenLibry installieren | [Installation](installation/index.md) |
| Die Software konfigurieren | [Konfiguration](configuration/index.md) |
| Daten aus einem anderen System importieren | [Import](import/index.md) |
| Die tägliche Arbeit verstehen | [Benutzerhandbuch](user-guide/index.md) |
| Ein Problem lösen | [Fehlerbehebung](troubleshooting/index.md) |
| Am Projekt mitarbeiten | [Entwicklung](development/index.md) |

## Hilfe & Kontakt

- :material-email: **E-Mail**: [info@openlibry.de](mailto:info@openlibry.de)
- :material-github: **GitHub**: [jzakotnik/openlibry](https://github.com/jzakotnik/openlibry)
- :material-youtube: **Video-Tutorial**: [YouTube](https://youtu.be/2UIFdA6Lqaw)
- :material-coffee: **Unterstützen**: [Ko-Fi](https://ko-fi.com/jzakotnik)

---

!!! tip "Gefällt dir OpenLibry?"
    Du kannst das Projekt unterstützen, indem du es weiterempfiehlst, Fehler meldest oder sogar Code beiträgst. Jede Hilfe ist willkommen! ❤️
