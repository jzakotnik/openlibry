# ISBN-Lookup-Architektur

OpenLibry verwendet eine modulare Architektur für die ISBN-basierte Buchsuche. Diese ermöglicht die Nutzung mehrerer Datenquellen und gewährleistet eine hohe Trefferquote bei der automatischen Bucherfassung.

## Überblick

```
┌─────────────────────────────────────────────────────────────┐
│                    Benutzeroberfläche                       │
│              (Stapelerfassung / Einzelbucherfassung)        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    ISBN-Validierung                         │
│          (ISBN-10 → ISBN-13 Konvertierung, Prüfziffer)     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 ISBN Service Chain                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  1. DNB SRU Service                                  │   │
│  │     - Offizieller SRU-Webservice der DNB            │   │
│  │     - Strukturierte XML-Daten                        │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  2. DNB Portal Scraping                              │   │
│  │     - Fallback für fehlende SRU-Einträge            │   │
│  │     - RDF/Turtle-Daten vom Portal                    │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  3. Google Books API                                 │   │
│  │     - Internationale Bücher                          │   │
│  │     - Gute Cover-Verfügbarkeit                       │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  4. Open Library API                                 │   │
│  │     - Freie Datenbank                                │   │
│  │     - Ältere und internationale Werke                │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  5. ISBNSearch.org                                   │   │
│  │     - Breite Abdeckung                               │   │
│  │     - Last-Resort Fallback                           │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Daten-Sanitierung                           │
│          (Eingabevalidierung, XSS-Schutz, Normalisierung)  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    BookFormData                             │
│       (Einheitliches Format für alle Datenquellen)         │
└─────────────────────────────────────────────────────────────┘
```

## ISBN-Services im Detail

### DNB SRU Service

Der offizielle Search/Retrieve via URL (SRU) Dienst der Deutschen Nationalbibliothek.

**Datei**: `lib/isbn-services/DnbSruService.ts`

**Eigenschaften**:
- Strukturierte XML-Antworten
- Vollständige bibliografische Metadaten
- Ideal für deutsche Publikationen

**Rückgabe-Felder**:
- Titel, Untertitel
- Autor(en)
- Verlag, Verlagsort, Erscheinungsjahr
- Seitenanzahl, Abmessungen
- Altersempfehlung

### DNB Portal Scraping

Fallback-Service, der das DNB-Portal scrapt und RDF/Turtle-Daten extrahiert.

**Datei**: `lib/isbn-services/DnbScrapingService.ts`

**Eigenschaften**:
- Verwendet N3-Parser für RDF-Turtle
- Greift auf Portal-Daten zu, die nicht via SRU verfügbar sind
- Konfigurierbare Prädikat-Mappings

**Konfiguration**: `lib/isbn-services/predicates.config.json`

### Google Books API

Integration mit der Google Books API für internationale Bücher.

**Datei**: `lib/isbn-services/GoogleBooksService.ts`

**Eigenschaften**:
- Kostenlose API (mit Rate-Limits)
- Gute Cover-Bild-Verfügbarkeit
- Internationale Bücher

**Rückgabe-Felder**:
- Titel, Untertitel
- Autor(en)
- Verlag, Erscheinungsjahr
- Beschreibung
- Cover-URL

### Open Library API

Integration mit der freien Open Library Datenbank.

**Datei**: `lib/isbn-services/OpenLibraryService.ts`

**Eigenschaften**:
- Vollständig kostenlos
- Große Sammlung älterer Werke
- Community-gepflegt

### ISBNSearch.org Service

Last-Resort-Fallback für ISBNs, die in anderen Quellen nicht gefunden werden.

**Datei**: `lib/isbn-services/IsbnSearchService.ts`

**Eigenschaften**:
- Breite Abdeckung
- Web-Scraping-basiert
- Fallback wenn andere Services fehlschlagen

## Datenmodell

Alle Services geben Daten im einheitlichen `BookFormData`-Format zurück:

**Datei**: `lib/isbn-services/types.ts`

```typescript
interface BookFormData {
  title?: string;
  subtitle?: string;
  author?: string;
  isbn?: string;
  publisherName?: string;
  publisherLocation?: string;
  publisherDate?: string;
  pages?: number;
  summary?: string;
  minAge?: string;
  maxAge?: string;
  price?: string;
  externalLinks?: string;
  otherPhysicalAttributes?: string;
  physicalSize?: string;
  imageLink?: string;
}
```

## Sicherheit

### Eingabe-Sanitierung

Alle externen Daten werden vor der Verwendung sanitiert:

**Datei**: `lib/isbn-services/sanitize.ts`

**Maßnahmen**:
- HTML-Tag-Entfernung
- XSS-Schutz
- Längen-Validierung
- Zeichensatz-Normalisierung

### ISBN-Validierung

**Funktionen in `lib/isbn-services/types.ts`**:
- `normalizeIsbn()`: Entfernt Bindestriche, normalisiert Format
- `isIsbnLike()`: Prüft auf gültiges ISBN-Format
- ISBN-10 zu ISBN-13 Konvertierung

## Erweiterbarkeit

Neue ISBN-Services können einfach hinzugefügt werden:

1. Erstellen Sie eine neue Service-Datei in `lib/isbn-services/`
2. Implementieren Sie das `IsbnLookupService`-Interface:

```typescript
interface IsbnLookupService {
  name: string;
  fetch: (isbn: string) => Promise<BookFormData | null>;
}
```

3. Fügen Sie den Service zur Lookup-Chain hinzu

## Konfiguration

### Prädikat-Konfiguration (DNB Scraping)

Die RDF-Prädikat-Mappings können in `predicates.config.json` angepasst werden:

```json
{
  "title": ["http://purl.org/dc/elements/1.1/title"],
  "author": ["http://purl.org/dc/elements/1.1/creator"],
  "isbn": ["http://purl.org/ontology/bibo/isbn"],
  ...
}
```

### Rate-Limiting

Externe APIs haben Rate-Limits. OpenLibry implementiert:
- Sequentielle Anfragen (keine Parallelität)
- Timeout-Handling
- Graceful Degradation bei Fehlern
