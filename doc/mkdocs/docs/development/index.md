# Entwicklung

Informationen für Entwickler, die OpenLibry verstehen, erweitern oder verbessern wollen.

## Übersicht

| Thema | Beschreibung |
|-------|--------------|
| [Architektur](architecture.md) | Tech-Stack und Projektstruktur |
| [API-Referenz](api-reference.md) | REST-API Dokumentation |
| [Lokale Entwicklung](local-development.md) | Dev-Environment aufsetzen |
| [Tests](testing.md) | End-to-End-Tests mit Cypress einrichten, ausführen und schreiben |
| [Beitragen](contributing.md) | Zum Projekt beitragen |

## Tech-Stack

| Komponente | Technologie |
|------------|-------------|
| Frontend | React 19, Shadcn/ui, Tailwind |
| Backend | Next.js 15 |
| Datenbank | SQLite via Prisma 7 |
| Sprache | TypeScript |
| Tests | Cypress |

## Schnellstart für Entwickler

```bash
# Repository klonen
git clone https://github.com/jzakotnik/openlibry.git
cd openlibry

# Dependencies installieren
npm install

# Umgebung einrichten
cp .env_example .env

# Datenbank erstellen
npx prisma db push

# Entwicklungsserver starten
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000).

## Tests ausführen

```bash
# Einmalig: Test-Umgebung anlegen
cp .env.test.local.example .env.test.local

# Alle Tests
npm run test:e2e

# Eine einzelne Datei
SPEC=cypress/e2e/rental.cy.ts npm run test:e2e:spec
```

Die Befehle bereiten eine eigene Test-Datenbank vor, starten die App und beenden sie wieder. Ablauf, Testdaten und das Schreiben neuer Tests stehen im [Test-Leitfaden](testing.md).

## Mitmachen

Wir freuen uns über Beiträge! Siehe [Contributing Guide](contributing.md).
