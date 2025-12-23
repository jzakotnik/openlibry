# Ausleihe

Der Ausleih-Screen ist das Herzstück von OpenLibry. Hier passiert die tägliche Arbeit.

## Übersicht

Der Screen ist in zwei Bereiche geteilt:

| Links | Rechts |
|-------|--------|
| **Nutzersuche** | **Buchsuche** |
| Nutzer auswählen | Bücher ausleihen/zurückgeben |
| Ausgeliehene Bücher sehen | Nach Büchern suchen |

## Workflow: Ausleihe

### Mit Barcode-Scanner (empfohlen)

1. **Nutzer scannen**: Der Fokus liegt automatisch auf dem Nutzersuchfeld. Scanne den Ausweis – der Nutzer öffnet sich automatisch.

2. **Buch scannen**: Der Fokus springt automatisch zur Buchsuche. Scanne das Buch.

3. **Ausleihen**: Klicke auf das Ausleihe-Symbol ▶️ neben dem Buch.

4. **Fertig!** Das Suchfeld wird automatisch markiert – du kannst direkt das nächste Buch scannen.

!!! tip "Scanner-Einstellung"
    Die meisten Barcode-Scanner senden automatisch einen Enter-Befehl nach dem Scan. Falls nicht, aktiviere diese Einstellung im Scanner-Handbuch.

### Ohne Scanner

1. **Nutzer suchen**: Tippe den Namen ins Suchfeld. Treffer erscheinen sofort.
2. **Nutzer anklicken**: Der Nutzer öffnet sich mit seinen ausgeliehenen Büchern.
3. **Buch suchen**: Tippe Titel, Autor oder Mediennummer ins Buchsuchfeld.
4. **Ausleihen**: Klicke auf ▶️.

## Workflow: Rückgabe

### Variante 1: Über den Nutzer

1. Nutzer suchen und öffnen
2. Unter dem Namen siehst du die ausgeliehenen Bücher
3. Klicke auf das Rückgabe-Symbol ↩️ neben dem Buch

### Variante 2: Direkt über das Buch

1. Buch im rechten Bereich suchen (Titel oder Mediennummer)
2. Klicke auf ↩️ – fertig!

!!! info "Schneller Tipp"
    Für schnelle Rückgaben musst du nicht erst den Nutzer öffnen. Such einfach das Buch und gib es zurück.

## Verlängerung

Bücher können verlängert werden, solange die maximale Ausleihzeit noch nicht erreicht ist.

1. Nutzer öffnen oder Buch suchen
2. Klicke auf das Verlängerungssymbol 🔄
3. Das neue Rückgabedatum wird angezeigt

Die maximale Anzahl der Verlängerungen ist in der [Konfiguration](../configuration/environment-variables.md) einstellbar.

## Überfällige Bücher erkennen

Auf der Leihe-Seite werden überfällige Bücher farblich markiert:

- 🔴 **Rot**: Deutlich überfällig
- 🟡 **Gelb**: Bald fällig oder gerade überfällig

Im Nutzerbereich siehst du bei jedem Nutzer:
- Wie viele Bücher ausgeliehen sind
- Welche überfällig sind

## Tastatursteuerung

| Aktion | Taste |
|--------|-------|
| Nutzersuchfeld leeren | ++esc++ |
| Zur Nutzersuche zurück | ++esc++ ++esc++ |
| Suche bestätigen | ++enter++ |
| Zwischen Feldern wechseln | ++tab++ |

## Fehlermeldungen

### "Nutzer nicht gefunden"

- Prüfe die Schreibweise
- Versuche nur den Nachnamen
- Ist der Nutzer aktiv?

### "Buch bereits ausgeliehen"

- Das Buch ist schon bei jemandem
- Suche das Buch und gib es erst zurück
- Oder prüfe, ob es ein Duplikat gibt

### "Maximale Verlängerungen erreicht"

- Das Buch wurde bereits X-mal verlängert (je nach Einstellung)
- Es muss erst zurückgegeben werden

## Tipps für die Praxis

### Hoher Andrang (Pause)

- Arbeite mit Barcode-Scanner
- Nutze nur die Tastatur (kein Mausklicken)
- Lass Kinder Ausweise bereithalten

### Neue Helfer einarbeiten

- Erst Ausleihe zeigen (der wichtigste Workflow)
- Dann Rückgabe
- Verlängerung kommt später
- Bei Problemen: Einfach nochmal probieren – man kann wenig kaputt machen

### Wenn's hektisch wird

- Ruhig bleiben 😊
- Bei Problemen: Buch zur Seite legen, nächstes Kind bedienen
- Problem später lösen

## Nächste Seiten

- [Bücherverwaltung](book-management.md) – Neue Bücher anlegen
- [Nutzerverwaltung](user-management.md) – Neue Nutzer anlegen
- [Tipps & Tricks](tips-tricks.md) – Noch schneller arbeiten
