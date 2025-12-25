/**
 * Sanitization utilities for external API data
 *
 * Data from external sources (DNB, OpenLibrary, etc.) should never be trusted.
 * These utilities strip potentially malicious content and enforce constraints.
 */

import { decode } from "html-entities";

// ============================================================================
// Types
// ============================================================================

export interface ExternalBookData {
  title?: unknown;
  subtitle?: unknown;
  authors?: unknown;
  publisher?: unknown;
  isbn?: unknown;
  isbn13?: unknown;
  pages?: unknown;
  publishedDate?: unknown;
  coverUrl?: unknown;
}

export interface SanitizedBookData {
  title: string | null;
  subtitle: string | null;
  authors: string[];
  publisher: string | null;
  isbn: string | null;
  isbn13: string | null;
  pages: number | null;
  publishedDate: string | null;
  coverUrl: string | null;
}

// ============================================================================
// Configuration
// ============================================================================

/** Allowed domains for cover image URLs */
const ALLOWED_COVER_DOMAINS = [
  "covers.openlibrary.org",
  "portal.dnb.de",
  "d-nb.info",
];

/** Default field length limits */
const FIELD_LIMITS = {
  title: 500,
  subtitle: 500,
  author: 200,
  publisher: 200,
  publishedDate: 20,
  maxAuthors: 20,
  maxPages: 99999,
} as const;

// ============================================================================
// Core Sanitization Functions
// ============================================================================

/**
 * Sanitize a string field from external API
 * - Strips HTML tags
 * - Decodes HTML entities
 * - Removes control characters
 * - Trims and limits length
 */
export function sanitizeTextField(
  input: unknown,
  maxLength: number = 500
): string | null {
  if (input === null || input === undefined) {
    return null;
  }

  if (typeof input !== "string") {
    return null;
  }

  let sanitized = input
    // Decode HTML entities first (e.g., &amp; -> &, &#39; -> ')
    .replace(/&[#\w]+;/gi, (match) => {
      try {
        return decode(match);
      } catch {
        return "";
      }
    })
    // Strip HTML/script tags
    .replace(/<[^>]*>/g, "")
    // Remove control characters (keep newlines and tabs for multi-line fields)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    // Normalize multiple spaces to single space
    .replace(/[ \t]+/g, " ")
    // Normalize multiple newlines
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  // Enforce maximum length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength).trim();
  }

  return sanitized || null;
}

/**
 * Sanitize ISBN - should only contain digits, dashes, and possibly X (for ISBN-10 checksum)
 */
export function sanitizeIsbn(input: unknown): string | null {
  if (typeof input !== "string") {
    return null;
  }

  // Remove everything except digits, X, and dashes
  const cleaned = input.replace(/[^0-9Xx-]/g, "").toUpperCase();

  // Validate format (10 or 13 digits when dashes removed)
  const digitsOnly = cleaned.replace(/-/g, "");

  // ISBN-10: 9 digits + check digit (0-9 or X)
  // ISBN-13: 13 digits
  if (digitsOnly.length === 10) {
    // Validate ISBN-10 format: 9 digits followed by digit or X
    if (!/^\d{9}[\dX]$/.test(digitsOnly)) {
      return null;
    }
  } else if (digitsOnly.length === 13) {
    // ISBN-13 must be all digits
    if (!/^\d{13}$/.test(digitsOnly)) {
      return null;
    }
  } else {
    return null;
  }

  return cleaned;
}

/**
 * Sanitize a numeric page count
 */
export function sanitizePageCount(input: unknown): number | null {
  if (input === null || input === undefined) {
    return null;
  }

  let num: number;

  if (typeof input === "number") {
    num = input;
  } else if (typeof input === "string") {
    num = parseInt(input, 10);
  } else {
    return null;
  }

  if (!Number.isFinite(num) || num < 0) {
    return null;
  }

  // Clamp to reasonable range
  return Math.min(Math.floor(num), FIELD_LIMITS.maxPages);
}

/**
 * Sanitize array of author names
 */
export function sanitizeAuthors(
  input: unknown,
  maxAuthors: number = FIELD_LIMITS.maxAuthors
): string[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .slice(0, maxAuthors)
    .map((author) => sanitizeTextField(author, FIELD_LIMITS.author))
    .filter((author): author is string => author !== null && author.length > 0);
}

/**
 * Validate and sanitize URLs (primarily for cover images)
 * - Only allows http/https protocols
 * - Optionally restricts to known domains
 */
export function sanitizeUrl(
  input: unknown,
  options: {
    allowedDomains?: string[];
    strictDomainCheck?: boolean;
  } = {}
): string | null {
  if (typeof input !== "string") {
    return null;
  }

  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const url = new URL(trimmed);

    // Only allow http/https protocols (blocks javascript:, data:, file:, etc.)
    if (!["http:", "https:"].includes(url.protocol)) {
      return null;
    }

    // Domain validation
    const allowedDomains = options.allowedDomains ?? ALLOWED_COVER_DOMAINS;
    const domainAllowed = allowedDomains.some(
      (domain) => url.hostname === domain || url.hostname.endsWith(`.${domain}`)
    );

    if (!domainAllowed) {
      if (options.strictDomainCheck) {
        return null;
      }
      // In non-strict mode, we allow but could log a warning
      // logger.warn({ url: trimmed }, 'URL from unexpected domain');
    }

    return url.toString();
  } catch {
    return null;
  }
}

/**
 * Sanitize a cover image URL specifically
 */
export function sanitizeCoverUrl(input: unknown): string | null {
  return sanitizeUrl(input, {
    allowedDomains: ALLOWED_COVER_DOMAINS,
    strictDomainCheck: false, // Allow unknown domains with warning
  });
}

// ============================================================================
// Composite Sanitization
// ============================================================================

/**
 * Sanitize complete book data from external lookup
 */
export function sanitizeBookData(
  bookData: ExternalBookData
): SanitizedBookData {
  return {
    title: sanitizeTextField(bookData.title, FIELD_LIMITS.title),
    subtitle: sanitizeTextField(bookData.subtitle, FIELD_LIMITS.subtitle),
    authors: sanitizeAuthors(bookData.authors),
    publisher: sanitizeTextField(bookData.publisher, FIELD_LIMITS.publisher),
    isbn: sanitizeIsbn(bookData.isbn),
    isbn13: sanitizeIsbn(bookData.isbn13),
    pages: sanitizePageCount(bookData.pages),
    publishedDate: sanitizeTextField(
      bookData.publishedDate,
      FIELD_LIMITS.publishedDate
    ),
    coverUrl: sanitizeCoverUrl(bookData.coverUrl),
  };
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Check if sanitized book data has minimum required fields
 */
export function isValidSanitizedBook(data: SanitizedBookData): boolean {
  return data.title !== null && data.title.length > 0;
}

/**
 * Escape string for safe inclusion in HTML attributes
 * Use when React's default escaping isn't available
 */
export function escapeHtmlAttribute(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
