# API-Referenz

REST-API Dokumentation für OpenLibry.

## Basis-URL

```
http://localhost:3000/api
```

## Bücher

### Alle Bücher abrufen

```http
GET /api/book
```

Ohne Parameter liefert der Endpunkt weiterhin die vollständige Liste als Array, damit bestehende Aufrufe unverändert funktionieren.

### Bücher seitenweise abrufen

```http
GET /api/book?pageSize=20&page=2&q=Ende
```

Sobald `pageSize` gesetzt ist, wird serverseitig geblättert und gesucht. `page` beginnt bei 1 und ist optional, `q` durchsucht Titel, Untertitel, Autor, ISBN und Schlagwörter. Die Antwort ist dann kein Array mehr, sondern ein Objekt:

```json
{
  "books": [],
  "total": 1234,
  "page": 2,
  "pageSize": 20
}
```

`total` zählt alle Treffer im Bestand, nicht nur die zurückgelieferte Seite. Damit kann der Client die Seitenzahl berechnen, ohne den gesamten Katalog zu laden.

Der öffentliche Katalog versteht dieselben Parameter:

```http
GET /api/public/books?pageSize=20&page=2&q=Ende
```

### Einzelnes Buch

```http
GET /api/book/{id}
```

### Buch anlegen

```http
POST /api/book
Content-Type: application/json

{
  "title": "Der kleine Prinz",
  "author": "Antoine de Saint-Exupéry",
  "isbn": "978-3-15-010863-0"
}
```

### Buch aktualisieren

```http
PUT /api/book/{id}
Content-Type: application/json

{
  "title": "Neuer Titel"
}
```

### Buch löschen

```http
DELETE /api/book/{id}
```

## Nutzer

### Alle Nutzer

```http
GET /api/user
```

### Einzelner Nutzer

```http
GET /api/user/{id}
```

### Nutzer anlegen

```http
POST /api/user
Content-Type: application/json

{
  "firstName": "Max",
  "lastName": "Mustermann",
  "schoolGrade": "3a"
}
```

### Nutzer aktualisieren

```http
PUT /api/user/{id}
```

### Nutzer löschen

```http
DELETE /api/user/{id}
```

## Ausleihe

### Buch ausleihen

```http
POST /api/book/{buchId}/user/{userId}
```

### Buch zurückgeben

```http
DELETE /api/book/{buchId}/user/{userId}
```

## Response-Format

Erfolgreiche Responses:

```json
{
  "id": 1,
  "title": "...",
  ...
}
```

Fehler:

```json
{
  "error": "Fehlermeldung"
}
```

## HTTP-Statuscodes

| Code | Bedeutung |
|------|-----------|
| 200 | OK |
| 201 | Erstellt |
| 400 | Ungültige Anfrage |
| 404 | Nicht gefunden |
| 500 | Serverfehler |
