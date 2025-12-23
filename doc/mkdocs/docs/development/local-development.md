# Lokale Entwicklung

So richtest du eine Entwicklungsumgebung ein.

## Voraussetzungen

- Node.js 18+ (LTS empfohlen)
- npm
- Git
- IDE (VS Code empfohlen)

## Setup

```bash
# Repository klonen
git clone https://github.com/jzakotnik/openlibry.git
cd openlibry

# Dependencies installieren
npm install

# Environment einrichten
cp .env_example .env

# Datenbank initialisieren
npx prisma db push

# Entwicklungsserver starten
npm run dev
```

## Entwicklungsserver

```bash
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000).

Hot-Reload ist aktiv: Änderungen werden sofort sichtbar.

## Nützliche Befehle

```bash
# Build für Produktion
npm run build

# Produktionsserver starten
npm start

# Prisma Studio (Datenbank-Browser)
npx prisma studio

# TypeScript-Check
npx tsc --noEmit

# Linting
npm run lint
```

## VS Code Extensions

Empfohlen:

- Prisma
- ESLint
- TypeScript
- GitLens

## Datenbank

### Prisma Studio

```bash
npx prisma studio
```

Öffnet einen Browser mit Datenbank-Viewer.

### Schema ändern

1. `prisma/schema.prisma` bearbeiten
2. `npx prisma db push` ausführen
3. Types werden automatisch generiert

## Testdaten

Du kannst Testdaten per Excel-Import oder API laden.
