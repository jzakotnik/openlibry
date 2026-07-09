# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OpenLibry is a school library management system built with Next.js (Pages Router), SQLite via Prisma, and NextAuth. It supports book rental management, barcode scanning, cover image fetching, and PDF/Excel report generation for small school libraries.

## Commands

```bash
# Development
npm run dev           # Start dev server with Turbopack
npm run build         # Production build
npm run lint          # Run ESLint

# E2E tests (Cypress)
npm run cypress       # Open Cypress UI
npm run cypress:headless   # Run headless
npm run test:e2e      # Start test server + run Cypress headless (uses .env.test.local)
npm run test:e2e:ui   # Start test server + open Cypress UI

# Database
npx prisma migrate dev     # Apply migrations in development
npx prisma db push         # Push schema changes without migration
npx prisma generate        # Regenerate Prisma client
npx prisma studio          # Open Prisma Studio GUI
```

## Architecture

### Layer Structure

- **`pages/`** — Next.js pages and API routes (Pages Router)
- **`entities/`** — TypeScript types (`BookType`, `UserType`, etc.), Prisma DB access functions, and `db.ts` (Prisma singleton)
- **`lib/`** — Shared utilities: i18n, logging, config, ISBN lookup services, date utils, label generation
- **`components/`** — React components organized by domain (`book/`, `rental/`, `user/`, `layout/`, `labels/`, `reports/`, `ui/`)
- **`prisma/`** — Schema and migrations; test DB at `prisma/database/automated-test-db.db`

### Data Model

Four Prisma models (SQLite):
- **`User`** — Library patrons (students), linked to rented books
- **`Book`** — Books with rental state (`rentalStatus`: `"available"` | `"rented"`, `dueDate`, `renewalCount`, `userId`)
- **`LoginUser`** — Staff credentials for NextAuth login
- **`Audit`** — Event log for business operations

### Key Patterns

**Database access** — Always import the Prisma singleton from `@/entities/db` and pass it into entity functions:
```ts
import { prisma } from "@/entities/db";
import { getAllBooks } from "@/entities/book";
const books = await getAllBooks(prisma);
```

**i18n** — Locale is fixed at build time via `NEXT_PUBLIC_OPENLIBRY_LOCALE`. Use the `t()` function everywhere (client and server):
```ts
import { t } from "@/lib/i18n";
t("home.chooseSection")
t("greeting.hello", { name: "Ada" })  // supports {placeholder} interpolation
```
Missing keys fall back to German, then to the raw key string.

**Logging** — Use structured pino loggers from `@/lib/logger`, always including a `LogEvents` enum value:
```ts
import { businessLogger, errorLogger } from "@/lib/logger";
import { LogEvents } from "@/lib/logEvents";
businessLogger.info({ event: LogEvents.BOOK_CREATED, bookId: result.id }, "Book created");
errorLogger.error({ event: LogEvents.API_ERROR, error: err.message }, "...");
```

**Configuration** — Runtime config is read from env vars. Business logic (rental durations, max extensions) comes from `lib/config/rentalConfig.ts` which reads `RENTAL_DURATION_DAYS`, `EXTENSION_DURATION_DAYS`, `MAX_EXTENSIONS`.

### ISBN Lookup

`/api/book/FillBookByIsbn` tries multiple services in cascade order: DNB SRU → Google Books → Open Library → ISBNSearch.org → DNB scraping. Services are defined in `lib/isbn-services/` and implement the `IsbnLookupService` interface.

### Authentication

NextAuth with `CredentialsProvider`. Passwords are stored hashed via `lib/utils/hashPassword.ts`. Auth can be disabled entirely via `AUTH_ENABLED=false` (development only). Session strategy is JWT with configurable timeout (`LOGIN_SESSION_TIMEOUT` env var, seconds).

### E2E Testing

Cypress uses a **separate test database** at `prisma/database/automated-test-db.db`, separate from the development DB. The `cypress.config.ts` registers custom tasks (`seedRentalData`, `resetDatabase`, `cleanupDatabase`) that operate on this test DB directly. Tests rely on `.env.test.local` for configuration. The fixture file `cypress/fixtures/automated-test-db-init.db` is the clean baseline that gets copied on reset.

## Environment Setup

Copy `.env_example` to `.env` and configure at minimum:
- `DATABASE_URL` — SQLite file path (default: `file:./database/dev.db`)
- `NEXTAUTH_SECRET` — random string for session encryption
- `COVERIMAGE_FILESTORAGE_PATH` — directory for uploaded book cover images
- `AUTH_ENABLED=false` — set during initial bootstrap to skip login

For E2E tests, create `.env.test.local` pointing to the test database:
```
DATABASE_URL=file:./prisma/database/automated-test-db.db
AUTH_ENABLED=false
```
