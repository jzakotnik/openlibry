# OpenLibry Documentation

Diese Dokumentation wird mit [MkDocs](https://www.mkdocs.org/) und dem [Material Theme](https://squidfunk.github.io/mkdocs-material/) erstellt.

## Lokale Entwicklung

```bash
# Python-Abhängigkeiten installieren
pip install -r requirements.txt

# Entwicklungsserver starten
mkdocs serve

# Öffne http://localhost:8000
```

## Build

```bash
mkdocs build
```

Die statischen Dateien werden in `site/` erstellt.

## Deployment

```bash
# Zu GitHub Pages deployen
mkdocs gh-deploy
```

## Struktur

- `mkdocs.yml` – Konfiguration
- `docs/` – Markdown-Quelldateien
- `docs/assets/` – Bilder und andere Assets
