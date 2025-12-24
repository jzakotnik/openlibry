# Architektur

Technischer Überblick über OpenLibry.

## Tech-Stack

| Schicht | Technologie |
|---------|-------------|
| **Frontend** | React 19, Material-UI 7 |
| **Backend** | Next.js 15 (Pages Router) |
| **Datenbank** | SQLite via Prisma ORM 7 |
| **PDF-Generierung** | @react-pdf/renderer |
| **Authentifizierung** | NextAuth.js |

## Projektstruktur

```
openlibry/
├── components/        # React-Komponenten
│   ├── book/         # Bücher-Komponenten
│   ├── user/         # Nutzer-Komponenten
│   ├── rental/       # Ausleihe-Komponenten
│   └── layout/       # Layout-Komponenten
├── pages/            # Next.js Pages
│   ├── api/          # API-Routen
│   │   ├── book/     # Buch-Endpunkte
│   │   ├── user/     # Nutzer-Endpunkte
│   │   └── report/   # Report-Endpunkte
│   ├── book/         # Bücher-Seiten
│   ├── user/         # Nutzer-Seiten
│   ├── rental/       # Ausleihe-Seiten
│   └── reports/      # Report-Seiten
├── entities/         # Datenbank-Typen und Queries
├── prisma/           # Prisma Schema und Migrationen
├── public/           # Statische Dateien
├── utils/            # Hilfsfunktionen
├── cypress/          # E2E-Tests
└── database/         # SQLite-Datenbank
```

## Datenfluss

```
Browser → Next.js Page → API Route → Prisma → SQLite
```

## Wichtige Konzepte

### Server-Side Rendering

Seiten werden serverseitig gerendert (`getServerSideProps`), was die initiale Ladezeit verbessert.

### API-Routes

Alle Datenoperationen laufen über `/api/*`-Endpunkte.

### Prisma ORM

Datenbank-Zugriff über typsicheres Prisma-Schema.

## Datenmodell

Hauptentitäten:

- **Book**: Bücher mit allen Metadaten
- **User**: Bibliotheksnutzer
- **Rental**: Ausleihen (als Status in Book)
- **Audit**: Aktivitätsprotokoll

Siehe [Datenmodell](../reference/data-model.md) für Details.
