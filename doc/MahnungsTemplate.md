## Verfügbare Platzhalter für das Mahnungs-Template

### Dokument-Ebene (einmal pro Dokument)
- `{#alleMahnungen}` ... `{/alleMahnungen}` - Schleife über alle Mahnungen

### Pro Mahnung
| Platzhalter | Beschreibung | Beispiel |
|-------------|--------------|----------|
| `{school_name}` | Name der Schule | "Grundschule Mammolshain" |
| `{overdue_username}` | Name des Kindes | "Max Mustermann" |
| `{schoolGrade}` | Klasse des Kindes | "3a" |
| `{reminder_min_count}` | Mindest-Verlängerungen | "5" |
| `{responsible_name}` | Unterschrift | "Fr. Schmidt" |
| `{responsible_contact_email}` | Kontakt-E-Mail | "buecherei@schule.de" |

### Pro Buch (innerhalb `{#book_list}` ... `{/book_list}`)
| Platzhalter | Beschreibung | Beispiel |
|-------------|--------------|----------|
| `{title}` | Buchtitel | "Harry Potter" |
| `{author}` | Autor | "J.K. Rowling" |
| `{rentedDate}` | Ausleihdatum | "15.03.2024" |