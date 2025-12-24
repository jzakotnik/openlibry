# Erste Schritte

Du bist neu bei OpenLibry? Perfekt, hier bist du richtig! Diese Sektion führt dich durch die ersten Schritte – vom ersten Ausprobieren bis zur fertigen Einrichtung deiner Schulbibliothek.

## Der schnellste Weg

Wenn du OpenLibry einfach mal sehen willst, ohne viel zu installieren:

```bash
docker run -d -p 3000:3000 \
  -v $(pwd)/database:/app/database \
  -e AUTH_SECRET=changeme \
  jzakotnik/openlibry:release
```

Öffne [http://localhost:3000](http://localhost:3000) – fertig! 🎉

## Schritt für Schritt

<div class="grid cards" markdown>

-   :material-information:{ .lg .middle } **[Einführung](introduction.md)**

    ---

    Was ist OpenLibry? Für wen ist es gedacht? Was kann es – und was nicht?

-   :material-rocket-launch:{ .lg .middle } **[Schnellstart](quickstart.md)**

    ---

    In 5 Minuten zur laufenden Installation. Ideal zum Ausprobieren.

-   :material-clipboard-check:{ .lg .middle } **[Voraussetzungen](requirements.md)**

    ---

    Was brauchst du? Hardware, Software, Kenntnisse.

-   :material-cog:{ .lg .middle } **[Erste Einrichtung](first-steps.md)**

    ---

    Der erste Nutzer, die ersten Bücher, die erste Ausleihe.

</div>

## Noch Fragen?

Falls du nicht weiterkommst, schau in die [Fehlerbehebung](../troubleshooting/index.md) oder schreib uns eine [E-Mail](mailto:info@openlibry.de). Wir helfen gerne!
