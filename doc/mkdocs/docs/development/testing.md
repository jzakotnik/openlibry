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

Erstelle `cypress.env.json`:

```json
{
  "user": "testuser",
  "password": "testpassword"
}
```

## Tests schreiben

Tests liegen in `cypress/e2e/`:

```javascript
describe("Ausleihe", () => {
  before(() => {
    cy.login();
  });

  it("sollte zur Ausleihe navigieren", () => {
    cy.visit("/");
    cy.get("[data-cy=index_rental_button]").click();
    cy.get("[data-cy=rental_input_searchuser]").should("be.visible");
  });
});
```

## data-cy Attribute

Verwende `data-cy` für stabile Selektoren:

```jsx
<Button data-cy="submit-button">Speichern</Button>
```

## Datenbank-Fixtures

Für reproduzierbare Tests: Datenbank vor Tests zurücksetzen.
