/**
 * Format an author string so it starts with the surname ("Nachname, Vorname"),
 * which makes spine labels sortable by author.
 *
 * - Names that already contain a comma are assumed to be surname-first
 *   (e.g. DNB data) and are returned unchanged.
 * - Multiple authors separated by ";" are converted individually.
 * - "Vorname Nachname" becomes "Nachname, Vorname".
 */
export function authorSurnameFirst(author: string | null | undefined): string {
  if (!author) return "";
  return author
    .split(";")
    .map((name) => {
      const trimmed = name.trim();
      if (!trimmed || trimmed.includes(",")) return trimmed;
      const parts = trimmed.split(/\s+/);
      if (parts.length < 2) return trimmed;
      const surname = parts[parts.length - 1];
      return `${surname}, ${parts.slice(0, -1).join(" ")}`;
    })
    .filter(Boolean)
    .join("; ");
}
