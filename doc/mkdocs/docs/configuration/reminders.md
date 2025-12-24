# Mahnschreiben konfigurieren

Automatisierte Mahnungen für überfällige Bücher erstellen.

## Übersicht

OpenLibry erstellt Mahnschreiben als Word-Dokument (.docx), das du ausdrucken und an Eltern verteilen kannst.

## Template-Datei

Mahnschreiben basieren auf einer Template-Datei. Eine Beispieldatei findest du unter:

```
public/mahnung-template.docx
```

## Platzhalter

Im Template kannst du Platzhalter verwenden, die automatisch ersetzt werden:

| Platzhalter | Wird ersetzt durch |
|-------------|-------------------|
| `{firstName}` | Vorname des Nutzers |
| `{lastName}` | Nachname des Nutzers |
| `{schoolGrade}` | Klasse |
| `{bookTitle}` | Titel des überfälligen Buchs |
| `{dueDate}` | Rückgabedatum |
| `{schoolName}` | Name der Schule |
| `{currentDate}` | Aktuelles Datum |

## Eigenes Template erstellen

1. Öffne die Beispiel-Datei `mahnung-template.docx`
2. Passe Text und Layout an
3. Füge Platzhalter in geschweiften Klammern ein
4. Speichere als neue Datei im `public/`-Ordner
5. Setze den Dateinamen in der `.env`:

```env
REMINDER_TEMPLATE=meine-mahnung.docx
```

## Beispiel-Template

```
MAHNUNG

Sehr geehrte Eltern von {firstName} {lastName} (Klasse {schoolGrade}),

das folgende Buch ist seit dem {dueDate} überfällig:

    {bookTitle}

Bitte geben Sie das Buch bis spätestens [Datum] in der Schulbibliothek ab.

Mit freundlichen Grüßen
Das Bibliotheksteam der {schoolName}

{currentDate}
```

## Schulinformationen

Setze diese Variablen in der `.env`:

```env
SCHOOL_NAME="Grundschule Beispielstadt"
SCHOOL_ADDRESS="Schulstraße 1"
SCHOOL_CITY="12345 Beispielstadt"
```

## Mahnungen erstellen

1. Gehe zu **Reports**
2. Klicke auf **Mahnungen** oder **Überfällige Bücher**
3. Wähle die Ausleihen aus
4. Klicke **Mahnschreiben erstellen**
5. Ein Word-Dokument wird heruntergeladen

## Tipps

### Sammelmahnungen

Hat ein Kind mehrere überfällige Bücher, werden sie in einer Mahnung zusammengefasst.

### Per E-Mail

Das generierte Dokument kannst du auch als E-Mail-Anhang versenden (falls E-Mail-Adressen gepflegt sind).

### Freundlicher Ton

Denk daran: Kinder vergessen Bücher, das ist normal. Ein freundlicher Ton hilft mehr als strenge Worte!

## Nächste Schritte

- [Reports](../user-guide/reports.md) – Mahnungen erstellen
- [Nutzerverwaltung](../user-guide/user-management.md) – E-Mail-Adressen pflegen
