/**
 * ISBNSearch.org Scraping Service
 * 
 * Scrapes book metadata from isbnsearch.org website.
 * 
 * Best for: International books, good general coverage
 * Rate limits: Be respectful, include proper User-Agent
 * Website: https://isbnsearch.org/
 */

import * as cheerio from "cheerio";
import fetch from "node-fetch";
import {
  BookFormData,
  IsbnLookupService,
  normalizeIsbn,
} from "./types";

const SERVICE_NAME = "ISBNSearch.org";
const BASE_URL = "https://isbnsearch.org/isbn";
const USER_AGENT = "Mozilla/5.0 (compatible; OpenLibry/1.0; +https://github.com/jzakotnik/openlibry)";

/**
 * Extract info from page by looking for labeled fields
 */
function getInfoByLabel($: cheerio.CheerioAPI, label: string): string | undefined {
  let value: string | undefined;
  
  $(".bookinfo p, .bookinfo div, p, li").each((_, el) => {
    const text = $(el).text();
    if (text.toLowerCase().includes(label.toLowerCase())) {
      // Try to extract value after colon
      const colonMatch = text.match(new RegExp(label + "\\s*:?\\s*(.+)", "i"));
      if (colonMatch) {
        value = colonMatch[1].trim();
        return false; // break
      }
    }
  });
  
  return value;
}

/**
 * Fetch book data by scraping ISBNSearch.org
 */
async function fetchFromIsbnSearch(isbn: string): Promise<BookFormData | null> {
  const cleanIsbn = normalizeIsbn(isbn);
  const url = `${BASE_URL}/${cleanIsbn}`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "de,en;q=0.5",
      },
    });

    if (!response.ok) {
      console.error(`[${SERVICE_NAME}] HTTP ${response.status}`);
      return null;
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Check if book was found
    const bookInfo = $(".bookinfo");
    if (!bookInfo.length) {
      return null;
    }

    // Extract title from h1 or booktitle class
    const title = $("h1").first().text().trim() || 
                  $(".booktitle").first().text().trim();

    if (!title) {
      return null;
    }

    // Extract data using label matching (supports English and German)
    const author = getInfoByLabel($, "Author") || getInfoByLabel($, "Authors") || 
                   getInfoByLabel($, "Autor") || getInfoByLabel($, "Autoren");
    
    const publisher = getInfoByLabel($, "Publisher") || getInfoByLabel($, "Verlag");
    
    const publishedDate = getInfoByLabel($, "Published") || getInfoByLabel($, "Publication") ||
                          getInfoByLabel($, "Year") || getInfoByLabel($, "Erschienen");
    
    const pages = getInfoByLabel($, "Pages") || getInfoByLabel($, "Seiten");
    
    const binding = getInfoByLabel($, "Binding") || getInfoByLabel($, "Format") ||
                    getInfoByLabel($, "Einband");

    // Try to find ISBN-13 on page
    let foundIsbn = cleanIsbn;
    const isbn13Match = html.match(/(?:ISBN-?13|ISBN13)\s*:?\s*(97[89]\d{10})/i);
    if (isbn13Match) {
      foundIsbn = isbn13Match[1];
    }

    return {
      title,
      author,
      isbn: foundIsbn,
      editionDescription: binding,
      publisherName: publisher,
      publisherDate: publishedDate,
      pages,
      externalLinks: url,
    };
  } catch (err) {
    console.error(`[${SERVICE_NAME}] Fetch error:`, err);
    return null;
  }
}

/**
 * ISBNSearch.org Service implementation
 */
export const IsbnSearchService: IsbnLookupService = {
  name: SERVICE_NAME,
  fetch: fetchFromIsbnSearch,
};

export default IsbnSearchService;
