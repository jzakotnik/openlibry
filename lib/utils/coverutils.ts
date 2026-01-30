/**
 * Shared utilities for handling book cover images
 * Used by batch scan and new book creation
 */

/**
 * Build OpenLibrary cover URL for a given ISBN
 */
export const getOpenLibraryCoverUrl = (
  isbn: string,
  size: "S" | "M" | "L" = "M",
): string => {
  return `https://covers.openlibrary.org/b/isbn/${isbn}-${size}.jpg`;
};

/**
 * Check if a cover exists at OpenLibrary and fetch it
 * Returns the blob if found, null otherwise
 *
 * OpenLibrary returns a 1x1 pixel image if no cover exists,
 * so we check if the image is larger than ~1000 bytes
 */
export const fetchCoverFromOpenLibrary = async (
  isbn: string,
): Promise<{ exists: boolean; blob?: Blob; url?: string }> => {
  try {
    const cleanedIsbn = isbn.replace(/[^0-9X]/gi, "");
    if (!cleanedIsbn) {
      return { exists: false };
    }

    const url = getOpenLibraryCoverUrl(cleanedIsbn, "M");
    const response = await fetch(url);

    if (!response.ok) {
      return { exists: false };
    }

    const blob = await response.blob();

    // OpenLibrary returns a 1x1 pixel image if no cover exists
    // Check if the image is larger than ~1000 bytes
    if (blob.size < 1000) {
      return { exists: false };
    }

    return { exists: true, blob, url };
  } catch {
    return { exists: false };
  }
};

/**
 * Upload a cover image blob to the server for a specific book
 */
export const uploadCoverBlob = async (
  bookId: number,
  coverBlob: Blob,
): Promise<boolean> => {
  try {
    const formData = new FormData();
    formData.set("cover", coverBlob, "cover.jpg");

    const response = await fetch(`/api/book/cover/${bookId}`, {
      method: "POST",
      body: formData,
    });

    return response.ok;
  } catch {
    return false;
  }
};

/**
 * Create an object URL for a blob (for preview display)
 * Remember to revoke with URL.revokeObjectURL when done
 */
export const createCoverPreviewUrl = (blob: Blob): string => {
  return URL.createObjectURL(blob);
};
