# Datenmodell

Datenbank-Schema von OpenLibry.

## Bücher (Book)

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| id | Int | Mediennummer (Primary Key) |
| createdAt | DateTime | Erstellt am |
| updatedAt | DateTime | Aktualisiert am |
| title | String | Titel (Pflicht) |
| subtitle | String? | Untertitel |
| author | String | Autor (Pflicht) |
| topics | String? | Schlagworte (;-getrennt) |
| imageLink | String? | Cover-URL |
| isbn | String? | ISBN |
| editionDescription | String? | Ausgabe |
| publisherLocation | String? | Verlagsort |
| publisherName | String? | Verlag |
| publisherDate | String? | Erscheinungsjahr |
| pages | Int? | Seitenzahl |
| summary | String? | Zusammenfassung |
| minAge | String? | Mindestalter |
| maxAge | String? | Höchstalter |
| price | String? | Preis |
| rentalStatus | String | Status (available, rented, ...) |
| rentedDate | DateTime? | Ausleihdatum |
| dueDate | DateTime? | Rückgabedatum |
| renewalCount | Int | Anzahl Verlängerungen |
| userId | Int? | Ausgeliehen von (FK) |

## Nutzer (User)

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| id | Int | Ausweisnummer (Primary Key) |
| createdAt | DateTime | Erstellt am |
| updatedAt | DateTime | Aktualisiert am |
| firstName | String | Vorname (Pflicht) |
| lastName | String | Nachname (Pflicht) |
| schoolGrade | String? | Klasse |
| schoolTeacherName | String? | Lehrkraft |
| eMail | String? | E-Mail |
| active | Boolean | Aktiv? |
| books | Book[] | Ausgeliehene Bücher |

## Ausleihstatus

| Status | Bedeutung |
|--------|-----------|
| available | Verfügbar |
| rented | Ausgeliehen |
| broken | Beschädigt |
| lost | Verloren |
| ordered | Bestellt |
| presentation | Vorführung |
| remote | Andere Bibliothek |
