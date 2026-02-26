import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BookType } from "@/entities/BookType";
import { AlertTriangle, Edit, Image, RefreshCw, Trash2 } from "lucide-react";

import { CoverThumbnail } from "./CoverThumbnail";
import { EditField } from "./EditField";
import { InlineChipRow } from "./InlineChipRow";
import { QuantityControl } from "./QuantityControl";
import { ScanStatusBadge } from "./ScanStatusBadge";
import { ScannedEntry } from "./types";

export interface BatchScanEntryCardProps {
  entry: ScannedEntry;
  onDelete: (id: string) => void;
  onToggleEdit: (id: string) => void;
  onUpdateBookData: (
    id: string,
    field: keyof BookType,
    value: string | number,
  ) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onSetQuantity: (id: string, quantity: number) => void;
  onRetry: (id: string, isbn: string) => void;
}

const borderColors = {
  found: "border-l-emerald-500",
  edited: "border-l-blue-500",
  not_found: "border-l-amber-500",
  error: "border-l-red-500",
  loading: "border-l-gray-300",
};

export function BatchScanEntryCard({
  entry,
  onDelete,
  onToggleEdit,
  onUpdateBookData,
  onUpdateQuantity,
  onSetQuantity,
  onRetry,
}: BatchScanEntryCardProps) {
  const borderColor = borderColors[entry.status];
  const isValid = !!entry.bookData.title;

  return (
    <Card
      className={`py-0 border-l-4 ${borderColor} hover:shadow-md transition-shadow`}
      data-cy="batch-scan-entry"
    >
      <CardContent className="p-4">
        {/* Header: ISBN + Status + Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <ScanStatusBadge status={entry.status} />
            <span className="text-sm font-bold font-mono">
              ISBN: {entry.isbn}
            </span>
            {entry.status === "loading" && (
              <span className="text-xs text-muted-foreground">
                Suche in Datenbank…
              </span>
            )}
            {entry.hasCover && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Image className="size-4 text-blue-400" />
                </TooltipTrigger>
                <TooltipContent>
                  Cover von {entry.coverSource || "unbekannt"}
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          <div className="flex items-center gap-1 flex-wrap">
            {entry.status !== "loading" && (
              <QuantityControl
                quantity={entry.quantity}
                onIncrement={() => onUpdateQuantity(entry.id, 1)}
                onDecrement={() => onUpdateQuantity(entry.id, -1)}
                onSet={(n) => onSetQuantity(entry.id, n)}
              />
            )}

            {entry.status === "not_found" && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onRetry(entry.id, entry.isbn)}
                    className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                  >
                    <RefreshCw className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Erneut suchen</TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onToggleEdit(entry.id)}
                  disabled={entry.status === "loading"}
                  className={
                    entry.isEditing
                      ? "text-blue-600 bg-blue-50"
                      : "text-muted-foreground"
                  }
                >
                  <Edit className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {entry.isEditing
                  ? "Bearbeitung beenden"
                  : "Alle Felder bearbeiten"}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onDelete(entry.id)}
                  className="text-destructive/60 hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Löschen</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Preview Mode */}
        {entry.status !== "loading" && (
          <Collapsible open={!entry.isEditing}>
            <CollapsibleContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="shrink-0 flex justify-center sm:justify-start">
                  <CoverThumbnail
                    coverUrl={entry.coverUrl}
                    hasCover={entry.hasCover}
                    coverSource={entry.coverSource}
                  />
                </div>
                <div className="flex-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                    <div>
                      <span className="text-xs text-muted-foreground">
                        Titel
                      </span>
                      <p className="text-sm font-medium">
                        {entry.bookData.title || (
                          <em className="text-destructive font-normal">
                            Nicht angegeben
                          </em>
                        )}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">
                        Autor
                      </span>
                      <p className="text-sm">
                        {entry.bookData.author || (
                          <em className="text-destructive font-normal">
                            Nicht angegeben
                          </em>
                        )}
                      </p>
                    </div>
                    {entry.bookData.publisherName && (
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Verlag
                        </span>
                        <p className="text-sm">
                          {entry.bookData.publisherName}
                        </p>
                      </div>
                    )}
                    {entry.bookData.publisherDate && (
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Jahr
                        </span>
                        <p className="text-sm">
                          {entry.bookData.publisherDate}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Inline chip row for quick edits */}
                  <InlineChipRow
                    entry={entry}
                    onUpdateBookData={onUpdateBookData}
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Full Edit Mode */}
        {entry.status !== "loading" && entry.isEditing && (
          <>
            <Separator className="my-3" />
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="shrink-0 flex justify-center sm:justify-start">
                <CoverThumbnail
                  coverUrl={entry.coverUrl}
                  hasCover={entry.hasCover}
                  coverSource={entry.coverSource}
                />
              </div>
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <EditField
                  label="Titel"
                  value={entry.bookData.title || ""}
                  onChange={(v) => onUpdateBookData(entry.id, "title", v)}
                  required
                  error={!entry.bookData.title}
                  errorText="Titel erforderlich"
                />
                <EditField
                  label="Autor"
                  value={entry.bookData.author || ""}
                  onChange={(v) => onUpdateBookData(entry.id, "author", v)}
                  required
                />
                <EditField
                  label="Untertitel"
                  value={entry.bookData.subtitle || ""}
                  onChange={(v) => onUpdateBookData(entry.id, "subtitle", v)}
                />
                <EditField
                  label="Verlag"
                  value={entry.bookData.publisherName || ""}
                  onChange={(v) =>
                    onUpdateBookData(entry.id, "publisherName", v)
                  }
                />
                <EditField
                  label="Verlagsort"
                  value={entry.bookData.publisherLocation || ""}
                  onChange={(v) =>
                    onUpdateBookData(entry.id, "publisherLocation", v)
                  }
                />
                <EditField
                  label="Erscheinungsjahr"
                  value={entry.bookData.publisherDate || ""}
                  onChange={(v) =>
                    onUpdateBookData(entry.id, "publisherDate", v)
                  }
                />
                <EditField
                  label="Themen"
                  value={entry.bookData.topics || ""}
                  onChange={(v) => onUpdateBookData(entry.id, "topics", v)}
                />
                <EditField
                  label="Seiten"
                  value={String(entry.bookData.pages || "")}
                  onChange={(v) =>
                    onUpdateBookData(entry.id, "pages", parseInt(v) || 0)
                  }
                  type="number"
                />
                <EditField
                  label="Preis"
                  value={entry.bookData.price || ""}
                  onChange={(v) => onUpdateBookData(entry.id, "price", v)}
                />
                <EditField
                  label="Ab Alter"
                  value={String(entry.bookData.minAge || "")}
                  onChange={(v) =>
                    onUpdateBookData(entry.id, "minAge", v || "")
                  }
                  type="number"
                />
                <EditField
                  label="Bis Alter"
                  value={String(entry.bookData.maxAge || "")}
                  onChange={(v) =>
                    onUpdateBookData(entry.id, "maxAge", v || "")
                  }
                  type="number"
                />
                <div className="sm:col-span-2">
                  <EditField
                    label="Zusammenfassung"
                    value={entry.bookData.summary || ""}
                    onChange={(v) => onUpdateBookData(entry.id, "summary", v)}
                    multiline
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>

      {/* Validation warning */}
      {!isValid && entry.status !== "loading" && (
        <CardFooter className="px-4 pb-3 pt-0">
          <div className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700">
            <AlertTriangle className="size-3.5 shrink-0" />
            Titel und Autor sind für den Import erforderlich
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
