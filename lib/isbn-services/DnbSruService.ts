/**
 * DNB SRU API Service
 * 
 * Queries the Deutsche Nationalbibliothek (German National Library) via their
 * SRU (Search/Retrieve via URL) API. Returns MARC21-xml format data.
 * 
 * Best for: German books and publications
 * Rate limits: Free, no registration required
 * Documentation: https://www.dnb.de/EN/Professionell/Metadatendienste/Datenbezug/SRU/sru_node.html
 */

import * as cheerio from "cheerio";
import fetch from "node-fetch";
import {
  BookFormData,
  IsbnLookupService,
  normalizeIsbn,
  isIsbnLike,
} from "./types";

const SERVICE_NAME = "DNB SRU API";
const SRU_BASE_URL = "https://services.dnb.de/sru/dnb";

/**
 * Extract a single MARC field value
 */
function getMarcField(
  $: cheerio.CheerioAPI,
  tag: string,
  subfield?: string
): string | undefined {
  const selector = subfield
    ? `datafield[tag="${tag}"] subfield[code="${subfield}"]`
    : `datafield[tag="${tag}"] subfield`;
  const el = $(selector).first();
  return el.length ? el.text().trim() : undefined;
}

/**
 * Extract all values from a MARC field
 */
function getAllMarcFields(
  $: cheerio.CheerioAPI,
  tag: string,
  subfield?: string
): string[] {
  const selector = subfield
    ? `datafield[tag="${tag}"] subfield[code="${subfield}"]`
    : `datafield[tag="${tag}"] subfield`;
  const results: string[] = [];
  $(selector).each((_, el) => {
    const text = $(el).text().trim();
    if (text) results.push(text);
  });
  return results;
}

/**
 * Parse MARC21-xml response into BookFormData
 */
function parseMarcXml(xmlText: string, searchIsbn: string): BookFormData | null {
  try {
    const $ = cheerio.load(xmlText, { xmlMode: true });

    const numberOfRecords = $("numberOfRecords").text();
    if (numberOfRecords === "0" || !$("record").length) {
      return null;
    }

    const record = $("record").first();
    const $rec = cheerio.load(record.html() || "", { xmlMode: true });

    // Authors: 100$a = main author, 700$a = additional authors
    const authors: string[] = [];
    const mainAuthor = getMarcField($rec, "100", "a");
    if (mainAuthor) authors.push(mainAuthor);
    getAllMarcFields($rec, "700", "a").forEach((a) => {
      if (!authors.includes(a)) authors.push(a);
    });

    // Title and subtitle: 245$a and 245$b
    const title = getMarcField($rec, "245", "a")?.replace(/[\/:;]$/, "").trim();
    const subtitle = getMarcField($rec, "245", "b")?.replace(/[\/:;]$/, "").trim();

    // ISBN: 020$a
    const isbns = getAllMarcFields($rec, "020", "a");
    let isbn = searchIsbn;
    for (const i of isbns) {
      const cleaned = normalizeIsbn(i.split(" ")[0]);
      if (isIsbnLike(cleaned)) {
        isbn = cleaned;
        if (cleaned.length === 13) break; // Prefer ISBN-13
      }
    }

    // Publisher info: 264 (RDA) or 260 (AACR2)
    // $a = location, $b = name, $c = date
    let publisherLocation = getMarcField($rec, "264", "a") || getMarcField($rec, "260", "a");
    let publisherName = getMarcField($rec, "264", "b") || getMarcField($rec, "260", "b");
    let publisherDate = getMarcField($rec, "264", "c") || getMarcField($rec, "260", "c");

    // Clean up punctuation
    publisherLocation = publisherLocation?.replace(/[:\s]+$/, "").trim();
    publisherName = publisherName?.replace(/[,;\s]+$/, "").trim();
    publisherDate = publisherDate?.replace(/[.\s]+$/, "").trim();

    // Physical description: 300$a
    const extent = getMarcField($rec, "300", "a");
    
    // Edition: 250$a
    const edition = getMarcField($rec, "250", "a");
    
    // Summary: 520$a
    const summary = getMarcField($rec, "520", "a");

    // Topics/subjects: 650$a and 653$a
    const topics = [
      ...getAllMarcFields($rec, "650", "a"),
      ...getAllMarcFields($rec, "653", "a"),
    ];

    return {
      title,
      author: authors.join(", "),
      subtitle,
      summary,
      isbn,
      editionDescription: edition,
      publisherName,
      publisherLocation,
      publisherDate,
      pages: extent,
      topics: topics.length > 0 ? topics.join(", ") : undefined,
    };
  } catch (err) {
    console.error(`[${SERVICE_NAME}] Error parsing MARC XML:`, err);
    return null;
  }
}

/**
 * Fetch book data from DNB SRU API
 */
async function fetchFromDnbSru(isbn: string): Promise<BookFormData | null> {
  const cleanIsbn = normalizeIsbn(isbn);
  const sruUrl = `${SRU_BASE_URL}?version=1.1&operation=searchRetrieve&query=NUM%3D${cleanIsbn}&recordSchema=MARC21-xml&maximumRecords=1`;

  try {
    const response = await fetch(sruUrl);
    if (!response.ok) {
      console.error(`[${SERVICE_NAME}] HTTP ${response.status}`);
      return null;
    }

    const xmlText = await response.text();
    return parseMarcXml(xmlText, isbn);
  } catch (err) {
    console.error(`[${SERVICE_NAME}] Fetch error:`, err);
    return null;
  }
}

/**
 * DNB SRU Service implementation
 */
export const DnbSruService: IsbnLookupService = {
  name: SERVICE_NAME,
  fetch: fetchFromDnbSru,
};

export default DnbSruService;
