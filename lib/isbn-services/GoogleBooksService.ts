/**
 * Google Books API Service
 * 
 * Queries the Google Books API for book metadata.
 * 
 * Best for: International books, good general coverage
 * Rate limits: Free for basic use, no API key required
 * Documentation: https://developers.google.com/books/docs/v1/using
 */

import fetch from "node-fetch";
import {
  BookFormData,
  IsbnLookupService,
  normalizeIsbn,
} from "./types";

const SERVICE_NAME = "Google Books";
const API_BASE_URL = "https://www.googleapis.com/books/v1/volumes";

/**
 * Google Books API response types
 */
interface GoogleBooksVolume {
  volumeInfo?: {
    title?: string;
    subtitle?: string;
    authors?: string[];
    publisher?: string;
    publishedDate?: string;
    description?: string;
    pageCount?: number;
    categories?: string[];
    industryIdentifiers?: Array<{
      type: string;
      identifier: string;
    }>;
  };
}

interface GoogleBooksResponse {
  totalItems?: number;
  items?: GoogleBooksVolume[];
}

/**
 * Fetch book data from Google Books API
 */
async function fetchFromGoogleBooks(isbn: string): Promise<BookFormData | null> {
  const cleanIsbn = normalizeIsbn(isbn);
  const url = `${API_BASE_URL}?q=isbn:${cleanIsbn}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`[${SERVICE_NAME}] HTTP ${response.status}`);
      return null;
    }

    const data = (await response.json()) as GoogleBooksResponse;

    if (!data.totalItems || !data.items || data.items.length === 0) {
      return null;
    }

    const book = data.items[0];
    const info = book.volumeInfo;

    if (!info) {
      return null;
    }

    // Extract ISBN-13 if available, fallback to ISBN-10
    let foundIsbn = cleanIsbn;
    if (info.industryIdentifiers) {
      for (const id of info.industryIdentifiers) {
        if (id.type === "ISBN_13") {
          foundIsbn = id.identifier;
          break;
        }
        if (id.type === "ISBN_10" && foundIsbn.length !== 13) {
          foundIsbn = id.identifier;
        }
      }
    }

    return {
      title: info.title,
      author: info.authors?.join(", "),
      subtitle: info.subtitle,
      summary: info.description,
      isbn: foundIsbn,
      publisherName: info.publisher,
      publisherDate: info.publishedDate,
      pages: info.pageCount?.toString(),
      topics: info.categories?.join(", "),
    };
  } catch (err) {
    console.error(`[${SERVICE_NAME}] Fetch error:`, err);
    return null;
  }
}

/**
 * Google Books Service implementation
 */
export const GoogleBooksService: IsbnLookupService = {
  name: SERVICE_NAME,
  fetch: fetchFromGoogleBooks,
};

export default GoogleBooksService;
