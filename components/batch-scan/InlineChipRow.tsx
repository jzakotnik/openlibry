import { BookType } from "@/entities/BookType";
import { MapPin } from "lucide-react";
import { InlineChipField } from "./InlineChipField";
import { ScannedEntry } from "./types";

function formatTopics(v: string): string {
  return v.split(";").filter(Boolean).join(", ") || "";
}

export function InlineChipRow({
  entry,
  onUpdateBookData,
}: {
  entry: ScannedEntry;
  onUpdateBookData: (
    id: string,
    field: keyof BookType,
    value: string | number,
  ) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2.5 border-t border-dashed border-gray-100">
      {entry.bookData.location && (
        <span className="inline-flex items-center gap-1 rounded-md border border-primary/25 bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
          <MapPin className="size-3 shrink-0" />
          {entry.bookData.location}
        </span>
      )}
      <InlineChipField
        label="Schlagwörter"
        value={entry.bookData.topics || ""}
        onChange={(v) => onUpdateBookData(entry.id, "topics", v)}
        placeholder="Abenteuer;Fantasy"
        formatDisplay={formatTopics}
      />
      <InlineChipField
        label="Seiten"
        value={String(entry.bookData.pages || "")}
        onChange={(v) => onUpdateBookData(entry.id, "pages", parseInt(v) || 0)}
        placeholder="256"
        type="number"
      />
      <InlineChipField
        label="Preis"
        value={entry.bookData.price || ""}
        onChange={(v) => onUpdateBookData(entry.id, "price", v)}
        placeholder="12,99"
      />
      <InlineChipField
        label="Ab Alter"
        value={String(entry.bookData.minAge || "")}
        onChange={(v) => onUpdateBookData(entry.id, "minAge", v || "")}
        placeholder="6"
        type="string"
      />
      <InlineChipField
        label="Bis Alter"
        value={String(entry.bookData.maxAge || "")}
        onChange={(v) => onUpdateBookData(entry.id, "maxAge", v || "")}
        placeholder="10"
        type="string"
      />
    </div>
  );
}
