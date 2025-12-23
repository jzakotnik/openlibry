# Tipps & Tricks

Hacks und Abkürzungen für Power-User. Damit du noch schneller arbeiten kannst!

## Tastaturkürzel

### Im Ausleih-Screen

| Taste | Funktion |
|-------|----------|
| ++esc++ | Suchfeld leeren |
| ++esc++ ++esc++ | Zurück zur Nutzersuche |
| ++enter++ | Suche bestätigen |
| ++tab++ | Zum nächsten Feld |

### Allgemein

| Taste | Funktion |
|-------|----------|
| ++ctrl+f++ | In der Seite suchen (Browser) |
| ++f5++ | Seite neu laden |

## Barcode-Scanner Tricks

### Schnelle Ausleihe

1. Nutzer scannen → Öffnet sich automatisch
2. Buch scannen → Fokus ist schon im Buchfeld
3. Ausleihen klicken → Feld wird automatisch markiert
4. Nächstes Buch scannen → Direkt weiter

**Ergebnis**: Drei Bücher in 10 Sekunden!

### Scanner-Einstellungen

Die meisten Scanner können konfiguriert werden:

- **Suffix: Enter** – Sendet Enter nach dem Scan (meist Standard)
- **Prefix: Tab** – Kann nützlich sein für bestimmte Workflows
- **Piepton** – Akustisches Feedback

### Empfohlene Scanner

Jeder USB-Scanner, der sich als Tastatur meldet, funktioniert. Beliebt sind:

- Inateck BCST-70
- Netum C750
- Oder jeder günstige Scanner von Amazon/eBay

!!! info "Preis"
    Ein einfacher Scanner kostet ca. 15-30 €. Lohnt sich!

## Workflow-Optimierung

### Pause mit vielen Kindern

1. **Vorbereitung**: OpenLibry auf Leihe-Screen öffnen
2. **Schlange bilden**: "Ausweis bereit halten!"
3. **Scan-Station**: Scanner griffbereit
4. **Zwei-Personen-System**: Eine Person scannt, eine sortiert Bücher ein

### Rückgabe-Box

Richte eine Box für Rückgaben ein:

1. Kinder werfen Bücher in die Box
2. Du bearbeitest sie gesammelt nach der Pause
3. Schneller als Einzel-Rückgaben während des Ansturms

### Neue Bücher erfassen

Bei vielen neuen Büchern:

1. **Stapel vorbereiten**: Bücher sortieren
2. **ISBN-Scanner nutzen**: Metadaten werden automatisch geladen
3. **Etiketten im Batch drucken**: Alle auf einmal, dann aufkleben

## Daten pflegen

### Schlagworte vereinheitlichen

Problem: "Abenteuer", "abenteuer", "Abenteuerbuch" sind drei verschiedene Schlagworte.

Lösung:
1. Excel-Export machen
2. In Excel: Suchen & Ersetzen
3. Import mit aktualisierten Daten

### Fehlende Cover nachladen

1. Export machen
2. Bücher ohne Cover (imageLink leer) identifizieren
3. ISBNs sammeln
4. Cover manuell oder per Script nachladen

### Jährlicher Frühjahrsputz

Empfohlene Routine am Schuljahresende:

1. ☐ Alle Bücher einsammeln (Amnestie!)
2. ☐ Fehlende Bücher als "verloren" markieren
3. ☐ Klassen hochstufen
4. ☐ Abgänger löschen
5. ☐ Backup machen
6. ☐ Excel-Export für Statistik

## Troubleshooting

### "Buch nicht gefunden" beim Scannen

- Barcode beschädigt? → Mediennummer manuell eingeben
- Buch noch nicht erfasst? → Erst anlegen

### Langsame Suche

- Zu viele Ergebnisse? → Präziser suchen
- Allgemein langsam? → Siehe [Performance](../troubleshooting/performance.md)

### Etiketten sitzen nicht richtig

- Drucker-Einstellungen prüfen (100%, keine Skalierung)
- Testdruck auf normalem Papier
- Konfiguration anpassen: [Bücherlabels](../configuration/book-labels.md)

## Versteckte Features

### Direktlinks

Du kannst direkt zu bestimmten Seiten springen:

- `/rental` – Ausleihe
- `/user` – Nutzerverwaltung
- `/book` – Bücherverwaltung
- `/reports` – Reports
- `/book/[id]` – Direkt zu einem Buch

### URL-Parameter

Manche Seiten unterstützen URL-Parameter:

```
/book?search=Harry+Potter
```

### API nutzen

Für Fortgeschrittene: OpenLibry hat eine REST-API.

```bash
# Alle Bücher als JSON
curl http://localhost:3000/api/book

# Ein bestimmtes Buch
curl http://localhost:3000/api/book/1234
```

Mehr dazu: [API-Referenz](../development/api-reference.md)

## Zeit sparen

### Die 80/20-Regel

80% der Arbeit ist Ausleihe und Rückgabe. Optimiere diese zuerst!

- Barcode-Scanner anschaffen
- Workflow üben
- Tastaturkürzel lernen

### Automatisierung

Was du automatisieren kannst:

- ✅ Cover-Bilder per ISBN laden
- ✅ Mahnschreiben generieren
- ✅ Excel-Backup per Cronjob
- ✅ Klassenerhöhung mit einem Klick

Was du nicht automatisieren solltest:

- ❌ Buch in die Hand nehmen
- ❌ Kind freundlich begrüßen
- ❌ Leseempfehlungen geben

## Community-Tipps

!!! tip "Dein Tipp?"
    Hast du einen guten Tipp gefunden? Teile ihn! Schreib uns an [info@openlibry.de](mailto:info@openlibry.de) oder erstelle einen Pull Request auf GitHub.

### Von anderen Bibliotheken

> "Wir haben die Ausweisnummern auf die Ranzen-Anhänger gedruckt. Die Kinder verlieren ihre Ausweise nicht mehr!"
> – Grundschule Beispielstadt

> "Jeden Freitag machen wir einen Mini-Backup. Hat uns schon einmal gerettet!"
> – Schulbibliothek Musterhaus
