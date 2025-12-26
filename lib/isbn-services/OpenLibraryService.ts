/**
 * Open Library API Service
 * 
 * Queries the Open Library API (part of Internet Archive) for book metadata.
 * 
 * Best for: International books, open source, 40M+ records
 * Rate limits: Free, please be respectful
 * Documentation: https://openlibrary.org/dev/docs/api/books
 */

import fetch from "node-fetch";
import {
  BookFormData,
  IsbnLookupService,
  normalizeIsbn,
} from "./types";

const SERVICE_NAME = "Open Library";
const API_BASE_URL = "https://openlibrary.org/api/books";

/**
 * Open Library API response types
 */
interface OpenLibraryBook {
  title?: string;
  subtitle?: string;
  authors?: Array<{ name: string }>;
  publishers?: Array<{ name: string }>;
  publish_date?: string;
  publish_places?: Array<{ name: string }>;
  number_of_pages?: number;
  subjects?: Array<{ name: string }>;
  notes?: string;
  identifiers?: {
    isbn_13?: string[];
    isbn_10?: string[];
  };
}

interface OpenLibraryResponse {
  [key: string]: OpenLibraryBook;
}

/**
 * Fetch book data from Open Library API
 */
async function fetchFromOpenLibrary(isbn: string): Promise<BookFormData | null> {
  const cleanIsbn = normalizeIsbn(isbn);
  const url = `${API_BASE_URL}?bibkeys=ISBN:${cleanIsbn}&format=json&jscmd=data`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`[${SERVICE_NAME}] HTTP ${response.status}`);
      return null;
    }

    const data = (await response.json()) as OpenLibraryResponse;
    const bookKey = `ISBN:${cleanIsbn}`;
    const book = data[bookKey];

    if (!book) {
      return null;
    }

    // Extract ISBN-13 if available
    let foundIsbn = cleanIsbn;
    if (book.identifiers?.isbn_13?.length) {
      foundIsbn = book.identifiers.isbn_13[0];
    } else if (book.identifiers?.isbn_10?.length && foundIsbn.length !== 13) {
      foundIsbn = book.identifiers.isbn_10[0];
    }

    return {
      title: book.title,
      author: book.authors?.map((a) => a.name).join(", "),
      subtitle: book.subtitle,
      summary: book.notes,
      isbn: foundIsbn,
      publisherName: book.publishers?.map((p) => p.name).join(", "),
      publisherLocation: book.publish_places?.map((p) => p.name).join(", "),
      publisherDate: book.publish_date,
      pages: book.number_of_pages?.toString(),
      topics: book.subjects?.map((s) => s.name).join(", "),
    };
  } catch (err) {
    console.error(`[${SERVICE_NAME}] Fetch error:`, err);
    return null;
  }
}

/**
 * Open Library Service implementation
 */
export const OpenLibraryService: IsbnLookupService = {
  name: SERVICE_NAME,
  fetch: fetchFromOpenLibrary,
};

export default OpenLibraryService;
