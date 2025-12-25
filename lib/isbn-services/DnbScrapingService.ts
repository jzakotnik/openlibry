/**
 * DNB Portal Scraping Service
 * 
 * Scrapes book metadata from the DNB (Deutsche Nationalbibliothek) portal
 * by parsing RDF Turtle data.
 * 
 * Best for: German books, last resort fallback
 * Rate limits: Be respectful
 * Website: https://portal.dnb.de/
 */

import * as cheerio from "cheerio";
import { Parser } from "n3";
import fetch from "node-fetch";
import {
  BookFormData,
  IsbnLookupService,
  normalizeIsbn,
  isIsbnLike,
} from "./types";

// Import predicate configuration
import predicateConfig from "./predicates.config.json";

const SERVICE_NAME = "DNB Portal";
const PORTAL_URL = "https://portal.dnb.de";
const SEARCH_URL = `${PORTAL_URL}/opac/simpleSearch`;

// Predicate mapping from config
const P = predicateConfig as Record<string, string[]>;

/**
 * Get first matching value from RDF triples
 */
function getFirstMatching(
  triples: any[],
  predicates: string[]
): string | undefined {
  // Try exact match first
  for (const pred of predicates) {
    const found = triples.find((triple) => triple.predicate.value === pred);
    if (found) return found.object.value;
  }
  
  // Try local name match
  for (const pred of predicates) {
    const localName = pred.split(/[\/#]/).pop();
    const found = triples.find(
      (triple) =>
        triple.predicate.value.endsWith("/" + localName) ||
        triple.predicate.value.endsWith("#" + localName)
    );
    if (found) return found.object.value;
  }
  
  return undefined;
}

/**
 * Get all matching values from RDF triples
 */
function getAllMatching(triples: any[], predicates: string[]): string[] {
  const values: string[] = [];
  
  for (const pred of predicates) {
    values.push(
      ...triples
        .filter((triple) => triple.predicate.value === pred)
        .map((triple) => triple.object.value)
    );
    
    const localName = pred.split(/[\/#]/).pop();
    values.push(
      ...triples
        .filter(
          (triple) =>
            triple.predicate.value.endsWith("/" + localName) ||
            triple.predicate.value.endsWith("#" + localName)
        )
        .map((triple) => triple.object.value)
    );
  }
  
  return Array.from(new Set(values));
}

/**
 * Get all matching literal values (non-URL) from RDF triples
 */
function getAllMatchingLiterals(
  triples: any[],
  predicates: string[]
): string[] {
  const values: string[] = [];
  
  for (const pred of predicates) {
    values.push(
      ...triples
        .filter(
          (triple) =>
            triple.predicate.value === pred &&
            typeof triple.object.value === "string" &&
            !/^https?:\/\//.test(triple.object.value)
        )
        .map((triple) => triple.object.value)
    );
    
    const localName = pred.split(/[\/#]/).pop();
    values.push(
      ...triples
        .filter(
          (triple) =>
            (triple.predicate.value.endsWith("/" + localName) ||
              triple.predicate.value.endsWith("#" + localName)) &&
            typeof triple.object.value === "string" &&
            !/^https?:\/\//.test(triple.object.value)
        )
        .map((triple) => triple.object.value)
    );
  }
  
  return Array.from(new Set(values));
}

/**
 * Extract ISBN from RDF triples
 */
function extractIsbn(triples: any[], searchIsbn: string): string {
  // Try specific ISBN predicates first
  const specificIsbn = getFirstMatching(triples, P.isbn);
  if (specificIsbn && isIsbnLike(specificIsbn)) {
    return normalizeIsbn(specificIsbn);
  }

  const allSpecificIsbns = getAllMatchingLiterals(triples, P.isbn);
  for (const isbn of allSpecificIsbns) {
    if (isIsbnLike(isbn)) {
      return normalizeIsbn(isbn);
    }
  }

  // Try fallback predicates
  if (P.isbnFallback) {
    const fallbackValues = getAllMatchingLiterals(triples, P.isbnFallback);
    for (const value of fallbackValues) {
      if (isIsbnLike(value)) {
        return normalizeIsbn(value);
      }
    }
  }

  return searchIsbn;
}

/**
 * Fetch book data by scraping DNB Portal
 */
async function fetchFromDnbPortal(isbn: string): Promise<BookFormData | null> {
  try {
    // Step 1: Search for the ISBN
    const searchUrl = `${SEARCH_URL}?query=${isbn}`;
    const searchResp = await fetch(searchUrl);
    const searchHtml = await searchResp.text();

    // Step 2: Find the RDF Turtle link
    const $ = cheerio.load(searchHtml);
    let turtleLink = "";
    
    $("a").each((_, el) => {
      if ($(el).text().includes("RDF (Turtle)-Repräsentation dieses Datensatzes")) {
        turtleLink = $(el).attr("href") ?? "";
      }
    });

    if (!turtleLink) {
      return null;
    }

    // Make URL absolute if relative
    if (turtleLink.startsWith("/")) {
      turtleLink = PORTAL_URL + turtleLink;
    }

    // Step 3: Fetch and parse the Turtle data
    const turtleResp = await fetch(turtleLink);
    const turtleText = await turtleResp.text();

    const parser = new Parser();
    const triples = parser.parse(turtleText);

    // Step 4: Extract book data from triples
    return {
      title: getFirstMatching(triples, P.title),
      author: getAllMatchingLiterals(triples, P.author).join(", "),
      subtitle: getFirstMatching(triples, P.subtitle),
      summary: getFirstMatching(triples, P.summary),
      isbn: extractIsbn(triples, isbn),
      publisherName: getFirstMatching(triples, P.publisherName),
      publisherLocation: getFirstMatching(triples, P.publisherLocation),
      publisherDate: getFirstMatching(triples, P.publisherDate),
      minAge: getFirstMatching(triples, P.minAge),
      price: getFirstMatching(triples, P.price),
      externalLinks: getAllMatching(triples, P.externalLinks).join(", "),
      otherPhysicalAttributes: getFirstMatching(triples, P.otherPhysicalAttributes),
      physicalSize: getFirstMatching(triples, P.physicalSize),
    };
  } catch (err) {
    console.error(`[${SERVICE_NAME}] Scraping error:`, err);
    return null;
  }
}

/**
 * DNB Portal Scraping Service implementation
 */
export const DnbScrapingService: IsbnLookupService = {
  name: SERVICE_NAME,
  fetch: fetchFromDnbPortal,
};

export default DnbScrapingService;
