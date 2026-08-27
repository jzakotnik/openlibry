# Tests

OpenLibry verwendet Cypress für End-to-End-Tests.

## Cypress starten

```bash
# Interaktiver Modus
npx cypress open

# Headless (für CI)
npx cypress run
```

## Test-Konfiguration

Es wird keine `cypress.env.json` mit Zugangsdaten benötigt. Der Test-Admin-Account wird automatisch beim Datenbank-Reset angelegt.

Die Zugangsdaten für den Test-Account lauten:

- **Benutzername:** `cypress_test_admin`
- **Passwort:** `CypressTest1234!`

## Datenbank-Reset

Vor jedem Test-Suite wird die Datenbank automatisch zurückgesetzt und mit Fixture-Daten befüllt. Die Fixtures liegen in `cypress/fixtures/`:

| Datei | Inhalt |
|---|---|
| `seed-login-users.json` | Admin-Login-Account |
| `seed-users.json` | Bibliotheksnutzer (Schüler) |
| `seed-books.json` | Bücher in verschiedenen Zuständen |

```typescript
describe("Meine Tests", () => {
  before(() => {
    cy.resetAndSeed(); // Datenbank zurücksetzen und Fixtures einspielen
  });

  after(() => {
    cy.clearDatabase(); // Datenbank nach Tests leeren
  });

  // ...
});
```

`cy.resetAndSeed()` gibt die IDs der angelegten Datensätze zurück, falls ein Test direkt darauf zugreifen muss:

```typescript
before(() => {
  cy.resetAndSeed().then((data) => {
    cy.wrap(data.bookIdByLabel["bookDorf"]).as("bookDorfId");
    cy.wrap(data.userId).as("rentaltestUserId");
  });
});
```

## Login

Der `cy.login()` Befehl meldet sich automatisch mit dem Test-Admin-Account an:

```typescript
beforeEach(() => {
  cy.session("meine-session", () => {
    cy.login();
  });
});
```

## Tests schreiben

Tests liegen in `cypress/e2e/`:

```typescript
describe("Ausleihe", () => {
  before(() => {
    cy.resetAndSeed();
  });

  after(() => {
    cy.clearDatabase();
  });

  beforeEach(() => {
    cy.session("rental-session", () => {
      cy.login();
    });
    cy.visit("/");
    cy.get("[data-cy=indexpage]").should("be.visible");
  });

  it("sollte zur Ausleihe navigieren", () => {
    cy.get("[data-cy=index_rental_button]").click();
    cy.get("[data-cy=rental_input_searchuser]").should("be.visible");
  });
});
```

## data-cy Attribute

Verwende `data-cy` für stabile Selektoren statt Text- oder CSS-Selektoren:

```jsx
<Button data-cy="submit-button">Speichern</Button>
```

```typescript
cy.get("[data-cy=submit-button]").click();
```

## Fixture-Daten erweitern

Neue Testdaten können direkt in den Fixture-Dateien in `cypress/fixtures/` ergänzt werden — ohne Änderungen an `cypress.config.ts`. Bücher unterstützen die Felder `rentedDaysAgo`, `dueDaysAgo` und `renterLastName` für vorkonfigurierte Ausleihen:

```json
{
  "_label": "meinTestBuch",
  "title": "Mein Testbuch",
  "author": "Test Autor",
  "rentalStatus": "rented",
  "renewalCount": 0,
  "rentedDaysAgo": 7,
  "dueDaysAgo": 1,
  "renterLastName": "Rentaltest"
}
```