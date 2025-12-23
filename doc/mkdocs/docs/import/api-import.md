# API Import

Für Entwickler und automatisierte Workflows: Daten per REST-API importieren.

## Übersicht

OpenLibry bietet eine REST-API für programmatische Imports. Ideal für:

- Automatisierte Datenübertragung
- Integration mit anderen Systemen
- Eigene Import-Skripte
- Bulk-Operationen

## Voraussetzungen

- Laufende OpenLibry-Installation
- Grundkenntnisse in HTTP/REST
- Tool wie `curl`, Postman, oder eine Programmiersprache

## API-Endpunkte

### Bücher

| Methode | Endpunkt | Beschreibung |
|---------|----------|--------------|
| GET | `/api/book` | Alle Bücher abrufen |
| GET | `/api/book/[id]` | Ein Buch abrufen |
| POST | `/api/book` | Neues Buch anlegen |
| PUT | `/api/book/[id]` | Buch aktualisieren |
| DELETE | `/api/book/[id]` | Buch löschen |

### Nutzer

| Methode | Endpunkt | Beschreibung |
|---------|----------|--------------|
| GET | `/api/user` | Alle Nutzer abrufen |
| GET | `/api/user/[id]` | Einen Nutzer abrufen |
| POST | `/api/user` | Neuen Nutzer anlegen |
| PUT | `/api/user/[id]` | Nutzer aktualisieren |
| DELETE | `/api/user/[id]` | Nutzer löschen |

### Ausleihe

| Methode | Endpunkt | Beschreibung |
|---------|----------|--------------|
| POST | `/api/book/[buchId]/user/[userId]` | Buch ausleihen |
| DELETE | `/api/book/[buchId]/user/[userId]` | Buch zurückgeben |

## Beispiele

### Neues Buch anlegen

```bash
curl -X POST http://localhost:3000/api/book \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Der kleine Prinz",
    "author": "Antoine de Saint-Exupéry",
    "isbn": "978-3-15-010863-0",
    "publisherName": "Reclam",
    "topics": "Klassiker;Kinderbuch"
  }'
```

### Neuen Nutzer anlegen

```bash
curl -X POST http://localhost:3000/api/user \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Max",
    "lastName": "Mustermann",
    "schoolGrade": "3a"
  }'
```

### Buch ausleihen

```bash
curl -X POST http://localhost:3000/api/book/2001/user/1080
```

### Buch zurückgeben

```bash
curl -X DELETE http://localhost:3000/api/book/2001/user/1080
```

## Datenformat

### Buch (BookType)

```json
{
  "title": "string (Pflicht)",
  "author": "string (Pflicht)",
  "subtitle": "string",
  "isbn": "string",
  "topics": "string (Semikolon-getrennt)",
  "imageLink": "string (URL)",
  "editionDescription": "string",
  "publisherLocation": "string",
  "publisherName": "string",
  "publisherDate": "string",
  "pages": "number",
  "summary": "string",
  "minAge": "string",
  "maxAge": "string",
  "price": "string",
  "externalLinks": "string"
}
```

### Nutzer (UserType)

```json
{
  "firstName": "string (Pflicht)",
  "lastName": "string (Pflicht)",
  "schoolGrade": "string",
  "schoolTeacherName": "string",
  "eMail": "string",
  "active": "boolean (default: true)"
}
```

## Python-Beispiel

```python
import requests
import json

BASE_URL = "http://localhost:3000/api"

def import_book(book_data):
    """Einzelnes Buch importieren"""
    response = requests.post(
        f"{BASE_URL}/book",
        json=book_data,
        headers={"Content-Type": "application/json"}
    )
    return response.json()

def import_books_from_csv(csv_path):
    """Bücher aus CSV importieren"""
    import csv
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            book = {
                "title": row["Titel"],
                "author": row["Autor"],
                "isbn": row.get("ISBN", ""),
                "topics": row.get("Schlagworte", "")
            }
            result = import_book(book)
            print(f"Importiert: {book['title']} -> ID: {result.get('id')}")

# Verwendung
import_books_from_csv("meine_buecher.csv")
```

## JavaScript/Node.js-Beispiel

```javascript
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000/api';

async function importBook(bookData) {
  const response = await fetch(`${BASE_URL}/book`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookData)
  });
  return response.json();
}

async function importBooksFromArray(books) {
  for (const book of books) {
    const result = await importBook(book);
    console.log(`Importiert: ${book.title} -> ID: ${result.id}`);
  }
}

// Verwendung
const books = [
  { title: "Harry Potter", author: "J.K. Rowling", isbn: "978-3-551-55167-2" },
  { title: "Der Hobbit", author: "J.R.R. Tolkien", isbn: "978-3-423-21412-2" }
];

importBooksFromArray(books);
```

## Fehlerbehandlung

### HTTP-Statuscodes

| Code | Bedeutung |
|------|-----------|
| 200 | Erfolgreich |
| 201 | Erstellt |
| 400 | Ungültige Anfrage (z.B. fehlendes Pflichtfeld) |
| 404 | Nicht gefunden |
| 500 | Serverfehler |

### Fehlerantwort

```json
{
  "error": "Fehlermeldung",
  "details": "Zusätzliche Informationen"
}
```

### Robuster Import

```python
def safe_import_book(book_data):
    try:
        response = requests.post(f"{BASE_URL}/book", json=book_data)
        response.raise_for_status()
        return {"success": True, "data": response.json()}
    except requests.exceptions.HTTPError as e:
        return {"success": False, "error": str(e)}
    except Exception as e:
        return {"success": False, "error": str(e)}
```

## Rate Limiting

OpenLibry hat kein eingebautes Rate Limiting, aber:

- Bei sehr vielen Anfragen: Pausen einbauen
- Empfehlung: Max. 10 Requests pro Sekunde
- Bulk-Operationen bevorzugen

## Tipps

### Erst testen

Teste dein Script mit wenigen Datensätzen, bevor du den kompletten Import startest.

### Backup machen

```bash
cp database/dev.db database/dev.db.backup
```

### IDs beachten

- Wenn du keine ID angibst, wird automatisch eine vergeben
- Wenn du IDs vorgibst, müssen sie eindeutig sein

### Transaktionen

Die API verarbeitet jeden Request einzeln. Bei Abbruch mitten im Import:
- Bereits importierte Daten bleiben
- Nicht importierte fehlen
- Ggf. Datenbank aus Backup wiederherstellen

## Nächste Schritte

- [API-Referenz](../development/api-reference.md) – Vollständige API-Dokumentation
- [Entwicklung](../development/index.md) – Für Beiträge zum Projekt
