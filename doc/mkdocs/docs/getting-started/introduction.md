# Einführung

## Was ist OpenLibry?

OpenLibry ist eine moderne, kostenlose Software zur Verwaltung von Schulbibliotheken. Sie wurde entwickelt, um den Alltag in kleinen Bibliotheken einfacher zu machen – besonders dort, wo ehrenamtliche Helfer wie Eltern die Ausleihe betreuen.

![OpenLibry Start-Screen](../assets/titel1.png)

## Die Geschichte dahinter

OpenLibry entstand aus einem echten Bedürfnis: Eine Grundschule in Deutschland nutzte das alte OpenBiblio, das seit Jahren nicht mehr weiterentwickelt wurde. Die Software war langsam, kompliziert und sah aus wie aus den 90ern. 

Die Idee war einfach: **Eine moderne Software, die nur das kann, was man wirklich braucht** – und das richtig gut.

## Für wen ist OpenLibry?

OpenLibry ist perfekt für:

- **Schulbibliotheken** in Grundschulen und weiterführenden Schulen
- **Kleine Büchereien** in Gemeinden oder Vereinen
- **Ehrenamtliche Teams**, die keine IT-Experten sind
- **Alle**, die eine einfache, kostenlose Lösung suchen

## Was kann OpenLibry?

### Bücher verwalten

- Bücher erfassen mit Titel, Autor, ISBN und mehr
- Cover-Bilder hinzufügen (automatisch per ISBN möglich)
- Schlagworte für einfaches Filtern
- Barcode-Etiketten drucken

### Nutzer verwalten

- Schüler und andere Ausleiher anlegen
- Klassenweise organisieren
- Nutzerausweise drucken

### Ausleihe

- Schnelle Ausleihe per Barcode-Scanner
- Rückgabe mit einem Klick
- Automatische Berechnung der Leihfrist
- Verlängerung möglich
- Überfällige Bücher auf einen Blick

### Reports & mehr

- Mahnschreiben automatisch erstellen
- Excel-Export aller Daten
- Statistiken und Übersichten
- Antolin-Integration

## Was OpenLibry *nicht* ist

Ehrlichkeit ist wichtig. OpenLibry ist **nicht** gedacht für:

- **Große Bibliotheken** mit zehntausenden Büchern (es funktioniert, aber es gibt bessere Tools dafür)
- **Komplexe Workflows** mit Vormerkungen, Gebühren, etc.
- **Mehrere Standorte** mit zentraler Verwaltung

Wenn du eine dieser Anforderungen hast, schau dir vielleicht [Koha](https://koha-community.org/) an – das ist ebenfalls Open Source, aber deutlich mächtiger (und komplexer).

## Der Tech-Stack

Falls es dich interessiert – OpenLibry basiert auf modernen Technologien:

| Komponente | Technologie |
|------------|-------------|
| Frontend | React mit Material-UI |
| Backend | Next.js (Node.js) |
| Datenbank | SQLite (über Prisma ORM) |
| Deployment | Docker, Bare Metal, oder beides |

Das bedeutet:

- ✅ Läuft auf einem einfachen Raspberry Pi
- ✅ Keine separate Datenbank-Installation nötig
- ✅ Die Daten liegen in einer einzigen Datei
- ✅ Einfache Backups

## Screenshots

### Ausleih-Screen

Hier passiert die tägliche Arbeit – Nutzer scannen, Bücher scannen, fertig.

![Ausleih-Screen](../assets/screen1.jpg)

### Bücherverwaltung

Alle Bücher auf einen Blick, mit Suche und Filtern.

![Bücherverwaltung](../assets/buch1.jpg)

### Buch bearbeiten

Detailansicht mit allen Feldern – nur ausfüllen, was du brauchst.

![Buch bearbeiten](../assets/buchedit1.jpg)

## Nächste Schritte

Bereit loszulegen?

- [Schnellstart](quickstart.md) – Probier OpenLibry in 5 Minuten aus
- [Voraussetzungen](requirements.md) – Was du brauchst
- [Installation](../installation/index.md) – Vollständige Installationsanleitung
