# Antolin-Integration

Verbinde OpenLibry mit der Antolin-Datenbank für Leseförderung.

## Was ist Antolin?

[Antolin](https://antolin.westermann.de/) ist ein Leseförderungsprogramm des Westermann Verlags. Schüler können zu gelesenen Büchern Quizfragen beantworten und Punkte sammeln.

## So funktioniert die Integration

OpenLibry kann Bücher mit Antolin-Informationen anreichern:

- Beim Bearbeiten eines Buchs siehst du, ob es bei Antolin verfügbar ist
- Passende Antolin-Klassenstufen werden angezeigt
- Du kannst Schlagworte automatisch ergänzen

## Einrichtung

### 1. Antolin-Daten besorgen

Der Westermann Verlag stellt eine CSV-Datei mit allen Antolin-Büchern bereit:

1. Kontaktiere Westermann/Antolin
2. Frage nach dem Download-Link für die Gesamtliste
3. Lade die CSV-Datei herunter

### 2. Datei einbinden

1. Erstelle den Ordner `/public/antolin/`
2. Speichere die Datei als `antolingesamt.csv`

```bash
mkdir -p public/antolin
cp downloaded_file.csv public/antolin/antolingesamt.csv
```

### 3. OpenLibry neu starten

```bash
pm2 restart openlibry
# oder
docker restart openlibry
```

## Verwendung

Nach der Einrichtung:

1. Öffne ein Buch zur Bearbeitung
2. Unter den Buchdetails erscheint ein Antolin-Bereich
3. Du siehst:
   - Ob das Buch bei Antolin vorhanden ist
   - Für welche Klassenstufen
   - Ähnliche Bücher aus der Antolin-Datenbank

## Matching

OpenLibry sucht nach Übereinstimmungen bei:

- **Autor** (teilweise Übereinstimmung)
- **Titel** (teilweise Übereinstimmung)

!!! info "Nicht 100% genau"
    Das automatische Matching funktioniert gut, aber nicht perfekt. Prüfe die Vorschläge manuell.

## Schlagworte hinzufügen

Du kannst Antolin-Klassenstufen als Schlagworte hinzufügen:

- `Antolin-1` für 1. Klasse
- `Antolin-2` für 2. Klasse
- etc.

So können Kinder (oder Helfer) leicht nach passenden Büchern filtern.

## Ohne Antolin-Abo?

Du kannst die Integration trotzdem nutzen, um zu sehen, welche Bücher bei Antolin verfügbar sind – auch ohne selbst ein Antolin-Abo zu haben.

## Tipps

### Regelmäßig aktualisieren

Westermann aktualisiert die Antolin-Datenbank regelmäßig. Lade etwa einmal im Jahr eine neue CSV herunter.

### Kennzeichnung in der Bibliothek

Viele Schulen kleben einen Antolin-Aufkleber auf Bücher, die in Antolin verfügbar sind.

## Nächste Schritte

- [Bücherverwaltung](../user-guide/book-management.md) – Bücher bearbeiten
- [Schlagworte](../user-guide/book-management.md#schlagworte) – Bücher organisieren
