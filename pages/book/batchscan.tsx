import Layout from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BookType } from "@/entities/BookType";
import { currentTime } from "@/lib/utils/dateutils";
import {
  AlertTriangle,
  CheckCircle,
  Edit,
  Image,
  ImageOff,
  Loader2,
  Minus,
  Plus,
  PlusCircle,
  RefreshCw,
  Save,
  ScanBarcode,
  Trash2,
  XCircle,
} from "lucide-react";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

import { playSound } from "@/lib/utils/audioutils";
import { generateId } from "@/lib/utils/id";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type ScanStatus = "loading" | "found" | "not_found" | "edited" | "error";

interface ScannedEntry {
  id: string;
  isbn: string;
  status: ScanStatus;
  bookData: Partial<BookType>;
  errorMessage?: string;
  isEditing?: boolean;
  coverUrl?: string;
  hasCover?: boolean;
  coverBlob?: Blob;
  coverSource?: string;
  quantity: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// API helpers
// ─────────────────────────────────────────────────────────────────────────────

const checkCoverExists = async (
  isbn: string,
): Promise<{ exists: boolean; blob?: Blob; source?: string }> => {
  try {
    const response = await fetch(`/api/book/fetchCover?isbn=${isbn}`);
    if (!response.ok) return { exists: false };
    const blob = await response.blob();
    const source = response.headers.get("X-Cover-Source") || "unknown";
    return { exists: true, blob, source };
  } catch {
    return { exists: false };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Status Badge (using shadcn Badge)
// ─────────────────────────────────────────────────────────────────────────────

function ScanStatusBadge({ status }: { status: ScanStatus }) {
  const config = {
    found: {
      icon: CheckCircle,
      label: "Gefunden",
      className: "bg-emerald-100 text-emerald-700 border-emerald-200",
    },
    edited: {
      icon: Edit,
      label: "Bearbeitet",
      className: "bg-blue-100 text-blue-700 border-blue-200",
    },
    not_found: {
      icon: AlertTriangle,
      label: "Nicht gefunden",
      className: "bg-amber-100 text-amber-700 border-amber-200",
    },
    error: {
      icon: XCircle,
      label: "Fehler",
      className: "bg-red-100 text-red-700 border-red-200",
    },
    loading: {
      icon: Loader2,
      label: "Suche…",
      className: "bg-gray-100 text-gray-500 border-gray-200",
    },
  }[status];

  const Icon = config.icon;

  return (
    <Badge variant="outline" className={config.className}>
      <Icon
        className={`size-3 ${status === "loading" ? "animate-spin" : ""}`}
      />
      {config.label}
    </Badge>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Stat Chip (using shadcn Badge)
// ─────────────────────────────────────────────────────────────────────────────

function StatChip({
  icon: Icon,
  label,
  variant = "default",
}: {
  icon?: React.ElementType;
  label: string;
  variant?: "default" | "success" | "warning" | "info";
}) {
  const styles = {
    default: "border-gray-200 text-gray-600",
    success: "border-emerald-200 text-emerald-700",
    warning: "border-amber-200 text-amber-700",
    info: "border-blue-200 text-blue-700",
  };
  return (
    <Badge variant="outline" className={styles[variant]}>
      {Icon && <Icon className="size-3" />}
      {label}
    </Badge>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Quantity Control
// ─────────────────────────────────────────────────────────────────────────────

function QuantityControl({
  quantity,
  onIncrement,
  onDecrement,
  onSet,
}: {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onSet: (n: number) => void;
}) {
  return (
    <div className="inline-flex items-center gap-0.5 bg-muted rounded-lg px-1 py-0.5">
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={onDecrement}
        disabled={quantity <= 1}
      >
        <Minus className="size-3.5" />
      </Button>
      <input
        type="number"
        value={quantity}
        onChange={(e) => {
          const val = parseInt(e.target.value, 10);
          if (!isNaN(val)) onSet(val);
        }}
        min={1}
        className="w-10 text-center text-sm font-medium bg-transparent border-none outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <Button variant="ghost" size="icon-xs" onClick={onIncrement}>
        <Plus className="size-3.5" />
      </Button>
      <span className="text-xs text-muted-foreground ml-0.5">
        {quantity === 1 ? "Exemplar" : "Exemplare"}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Edit Field (using shadcn Input + Label)
// ─────────────────────────────────────────────────────────────────────────────

function EditField({
  label,
  value,
  onChange,
  required = false,
  error = false,
  errorText,
  type = "text",
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  error?: boolean;
  errorText?: string;
  type?: string;
  multiline?: boolean;
}) {
  const id = `edit-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={2}
          className="border-input placeholder:text-muted-foreground flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] resize-y aria-invalid:border-destructive"
          aria-invalid={error || undefined}
        />
      ) : (
        <Input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error || undefined}
        />
      )}
      {error && errorText && (
        <p className="text-xs text-destructive">{errorText}</p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Cover Thumbnail
// ─────────────────────────────────────────────────────────────────────────────

function CoverThumbnail({
  coverUrl,
  hasCover,
  coverSource,
}: {
  coverUrl?: string;
  hasCover?: boolean;
  coverSource?: string;
}) {
  if (hasCover && coverUrl) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative group">
            <img
              src={coverUrl}
              alt="Cover"
              className="w-20 h-[120px] rounded-lg object-cover bg-muted border"
            />
            <span className="absolute bottom-1 right-1 bg-blue-500 text-white rounded px-1 py-0.5 text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              {coverSource}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>Cover von {coverSource || "unbekannt"}</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div className="w-20 h-[120px] rounded-lg bg-muted border flex items-center justify-center">
      <ImageOff className="size-6 text-muted-foreground/40" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Entry Card (using shadcn Card + Collapsible + Tooltip + Button)
// ─────────────────────────────────────────────────────────────────────────────

interface BatchScanEntryCardProps {
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

function BatchScanEntryCard({
  entry,
  onDelete,
  onToggleEdit,
  onUpdateBookData,
  onUpdateQuantity,
  onSetQuantity,
  onRetry,
}: BatchScanEntryCardProps) {
  const borderColor = {
    found: "border-l-emerald-500",
    edited: "border-l-blue-500",
    not_found: "border-l-amber-500",
    error: "border-l-red-500",
    loading: "border-l-gray-300",
  }[entry.status];

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
                {entry.isEditing ? "Bearbeitung beenden" : "Bearbeiten"}
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

        {/* Content: Preview or Edit */}
        {entry.status !== "loading" && (
          <Collapsible open={!entry.isEditing}>
            {/* Preview Mode */}
            <CollapsibleContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="shrink-0 flex justify-center sm:justify-start">
                  <CoverThumbnail
                    coverUrl={entry.coverUrl}
                    hasCover={entry.hasCover}
                    coverSource={entry.coverSource}
                  />
                </div>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                  <div>
                    <span className="text-xs text-muted-foreground">Titel</span>
                    <p className="text-sm font-medium">
                      {entry.bookData.title || (
                        <em className="text-destructive font-normal">
                          Nicht angegeben
                        </em>
                      )}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Autor</span>
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
                      <p className="text-sm">{entry.bookData.publisherName}</p>
                    </div>
                  )}
                  {entry.bookData.publisherDate && (
                    <div>
                      <span className="text-xs text-muted-foreground">
                        Jahr
                      </span>
                      <p className="text-sm">{entry.bookData.publisherDate}</p>
                    </div>
                  )}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Edit Mode */}
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

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export default function BatchScan() {
  const router = useRouter();

  const [isbnInput, setIsbnInput] = useState("");
  const [entries, setEntries] = useState<ScannedEntry[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    return () => {
      entries.forEach((entry) => {
        if (entry.coverUrl?.startsWith("blob:")) {
          URL.revokeObjectURL(entry.coverUrl);
        }
      });
    };
  }, []);

  // ── Fetch book data ───────────────────────────────────────────────────────

  const fetchBookData = useCallback(
    async (isbn: string): Promise<Partial<BookType> | null> => {
      const cleanedIsbn = isbn.replace(/\D/g, "");
      if (!cleanedIsbn) return null;
      try {
        const response = await fetch(
          `/api/book/FillBookByIsbn?isbn=${cleanedIsbn}`,
        );
        if (!response.ok) return null;
        return await response.json();
      } catch {
        return null;
      }
    },
    [],
  );

  // ── Scan handler ──────────────────────────────────────────────────────────

  const handleScan = useCallback(async () => {
    const cleanedIsbn = isbnInput.trim().replace(/\D/g, "");

    if (!cleanedIsbn) {
      toast.warning("Bitte eine gültige ISBN eingeben");
      return;
    }

    const existingEntry = entries.find((e) => e.isbn === cleanedIsbn);

    if (existingEntry) {
      setEntries((prev) =>
        prev.map((entry) =>
          entry.isbn === cleanedIsbn
            ? { ...entry, quantity: entry.quantity + 1 }
            : entry,
        ),
      );
      playSound("scan");
      toast.success(
        `"${existingEntry.bookData.title || cleanedIsbn}" - jetzt ${existingEntry.quantity + 1} Exemplare`,
      );
      setIsbnInput("");
      inputRef.current?.focus();
      return;
    }

    playSound("scan");

    const newEntry: ScannedEntry = {
      id: generateId(),
      isbn: cleanedIsbn,
      status: "loading",
      bookData: { isbn: cleanedIsbn },
      quantity: 1,
    };

    setEntries((prev) => [newEntry, ...prev]);
    setIsbnInput("");
    inputRef.current?.focus();

    const [bookData, coverResult] = await Promise.all([
      fetchBookData(cleanedIsbn),
      checkCoverExists(cleanedIsbn),
    ]);

    const coverUrl =
      coverResult.exists && coverResult.blob
        ? URL.createObjectURL(coverResult.blob)
        : undefined;

    setEntries((prev) =>
      prev.map((entry) =>
        entry.id === newEntry.id
          ? {
              ...entry,
              status: bookData ? "found" : "not_found",
              bookData: bookData
                ? { ...bookData, isbn: cleanedIsbn }
                : {
                    isbn: cleanedIsbn,
                    title: "",
                    author: "",
                    rentalStatus: "available",
                    renewalCount: 0,
                  },
              coverUrl,
              hasCover: coverResult.exists,
              coverBlob: coverResult.blob,
              coverSource: coverResult.source,
            }
          : entry,
      ),
    );

    if (bookData) {
      playSound("success");
      const coverInfo = coverResult.exists
        ? ` (Cover von ${coverResult.source})`
        : "";
      toast.success(`"${bookData.title}" gefunden${coverInfo}`);
    } else {
      playSound("error");
      toast.warning(
        "ISBN nicht in Datenbank gefunden - manuelle Eingabe möglich",
      );
    }
  }, [isbnInput, entries, fetchBookData]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleScan();
    }
  };

  // ── Entry actions ─────────────────────────────────────────────────────────

  const handleDelete = useCallback(
    (id: string) => {
      const entry = entries.find((e) => e.id === id);
      if (entry?.coverUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(entry.coverUrl);
      }
      setEntries((prev) => prev.filter((e) => e.id !== id));
      toast.info("Eintrag gelöscht");
      inputRef.current?.focus();
    },
    [entries],
  );

  const handleToggleEdit = useCallback((id: string) => {
    setEntries((prev) =>
      prev.map((entry) =>
        entry.id === id
          ? { ...entry, isEditing: !entry.isEditing, status: "edited" }
          : entry,
      ),
    );
  }, []);

  const handleUpdateBookData = useCallback(
    (id: string, field: keyof BookType, value: string | number) => {
      setEntries((prev) =>
        prev.map((entry) =>
          entry.id === id
            ? {
                ...entry,
                bookData: { ...entry.bookData, [field]: value },
                status: "edited",
              }
            : entry,
        ),
      );
    },
    [],
  );

  const handleUpdateQuantity = useCallback((id: string, delta: number) => {
    setEntries((prev) =>
      prev.map((entry) => {
        if (entry.id !== id) return entry;
        return { ...entry, quantity: Math.max(1, entry.quantity + delta) };
      }),
    );
  }, []);

  const handleSetQuantity = useCallback((id: string, quantity: number) => {
    setEntries((prev) =>
      prev.map((entry) => {
        if (entry.id !== id) return entry;
        return { ...entry, quantity: Math.max(1, quantity) };
      }),
    );
  }, []);

  const handleRetry = useCallback(
    async (id: string, isbn: string) => {
      const oldEntry = entries.find((e) => e.id === id);
      if (oldEntry?.coverUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(oldEntry.coverUrl);
      }

      setEntries((prev) =>
        prev.map((entry) =>
          entry.id === id ? { ...entry, status: "loading" } : entry,
        ),
      );

      const [bookData, coverResult] = await Promise.all([
        fetchBookData(isbn),
        checkCoverExists(isbn),
      ]);

      const coverUrl =
        coverResult.exists && coverResult.blob
          ? URL.createObjectURL(coverResult.blob)
          : undefined;

      setEntries((prev) =>
        prev.map((entry) =>
          entry.id === id
            ? {
                ...entry,
                status: bookData ? "found" : "not_found",
                bookData: bookData
                  ? { ...bookData, isbn }
                  : { ...entry.bookData },
                coverUrl,
                hasCover: coverResult.exists,
                coverBlob: coverResult.blob,
                coverSource: coverResult.source,
              }
            : entry,
        ),
      );

      if (bookData) {
        playSound("success");
        const coverInfo = coverResult.exists
          ? ` (Cover von ${coverResult.source})`
          : "";
        toast.success(`"${bookData.title}" gefunden${coverInfo}`);
      } else {
        playSound("error");
        toast.warning("Weiterhin nicht gefunden");
      }
    },
    [entries, fetchBookData],
  );

  // ── Upload cover ──────────────────────────────────────────────────────────

  const uploadCover = async (
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

  // ── Import ────────────────────────────────────────────────────────────────

  const handleImport = useCallback(async () => {
    const validEntries = entries.filter(
      (e) =>
        (e.status === "found" || e.status === "edited") && e.bookData.title,
    );

    if (validEntries.length === 0) {
      toast.warning(
        "Keine gültigen Einträge zum Importieren (Titel erforderlich)",
      );
      return;
    }

    const totalBooks = validEntries.reduce((sum, e) => sum + e.quantity, 0);

    setIsImporting(true);
    setImportProgress(0);

    const results = {
      success: 0,
      failed: 0,
      coversUploaded: 0,
      ids: [] as number[],
    };
    let processedBooks = 0;

    for (const entry of validEntries) {
      for (let copyIndex = 0; copyIndex < entry.quantity; copyIndex++) {
        const book: BookType = {
          title: entry.bookData.title || "",
          subtitle: entry.bookData.subtitle || "",
          author: entry.bookData.author || "",
          renewalCount: 0,
          rentalStatus: "available",
          topics: entry.bookData.topics || ";",
          rentedDate: currentTime(),
          dueDate: currentTime(),
          isbn: entry.bookData.isbn,
          publisherName: entry.bookData.publisherName,
          publisherLocation: entry.bookData.publisherLocation,
          publisherDate: entry.bookData.publisherDate,
          pages: entry.bookData.pages,
          summary: entry.bookData.summary,
          minAge: entry.bookData.minAge,
          maxAge: entry.bookData.maxAge,
          price: entry.bookData.price,
          externalLinks: entry.bookData.externalLinks,
          physicalSize: entry.bookData.physicalSize,
          otherPhysicalAttributes: entry.bookData.otherPhysicalAttributes,
          editionDescription: entry.bookData.editionDescription,
        };

        try {
          const response = await fetch("/api/book", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(book),
          });

          if (response.ok) {
            const data = await response.json();
            results.success++;
            results.ids.push(data.id);
            if (entry.hasCover && entry.coverBlob && data.id) {
              const coverUploaded = await uploadCover(data.id, entry.coverBlob);
              if (coverUploaded) results.coversUploaded++;
            }
          } else {
            results.failed++;
          }
        } catch {
          results.failed++;
        }

        processedBooks++;
        setImportProgress((processedBooks / totalBooks) * 100);
      }

      if (entry.coverUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(entry.coverUrl);
      }
      if (results.failed === 0 || results.success > 0) {
        setEntries((prev) => prev.filter((e) => e.id !== entry.id));
      }
    }

    setIsImporting(false);

    if (results.success > 0) {
      playSound("success");
      const coverInfo =
        results.coversUploaded > 0
          ? ` (${results.coversUploaded} Cover hochgeladen)`
          : "";
      toast.success(
        `${results.success} Buch/Bücher erfolgreich importiert!${coverInfo}`,
      );
    }

    if (results.failed > 0) {
      toast.error(
        `${results.failed} Buch/Bücher konnten nicht importiert werden`,
      );
    }

    inputRef.current?.focus();
  }, [entries]);

  // ── Clear all ─────────────────────────────────────────────────────────────

  const handleClearAll = useCallback(() => {
    if (entries.length === 0) return;
    if (window.confirm("Alle Einträge löschen?")) {
      entries.forEach((entry) => {
        if (entry.coverUrl?.startsWith("blob:")) {
          URL.revokeObjectURL(entry.coverUrl);
        }
      });
      setEntries([]);
      toast.info("Alle Einträge gelöscht");
      inputRef.current?.focus();
    }
  }, [entries]);

  // ── Stats ─────────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const totalEntries = entries.length;
    const totalBooks = entries.reduce((sum, e) => sum + e.quantity, 0);
    const found = entries.filter(
      (e) => e.status === "found" || e.status === "edited",
    ).length;
    const foundBooks = entries
      .filter((e) => e.status === "found" || e.status === "edited")
      .reduce((sum, e) => sum + e.quantity, 0);
    const notFound = entries.filter((e) => e.status === "not_found").length;
    const loading = entries.filter((e) => e.status === "loading").length;
    const withCover = entries.filter((e) => e.hasCover).length;
    const readyToImportBooks = entries
      .filter(
        (e) =>
          (e.status === "found" || e.status === "edited") && e.bookData.title,
      )
      .reduce((sum, e) => sum + e.quantity, 0);

    return {
      totalEntries,
      totalBooks,
      found,
      foundBooks,
      notFound,
      loading,
      withCover,
      readyToImportBooks,
    };
  }, [entries]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Layout>
      <Head>
        <title>Batch-Scan | OpenLibry</title>
      </Head>

      <TooltipProvider>
        <div className="max-w-5xl mx-auto px-4 py-6">
          {/* ── Scanner Input ────────────────────────────────────── */}
          <Card className="mb-4">
            <CardContent className="pt-5">
              <h2 className="text-base font-semibold mb-3">
                ISBN scannen oder eingeben
              </h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <ScanBarcode className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground pointer-events-none" />
                  <Input
                    ref={inputRef}
                    value={isbnInput}
                    onChange={(e) => setIsbnInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    placeholder="ISBN hier scannen oder eingeben…"
                    data-cy="batch-scan-isbn-input"
                    className="pl-10 h-11"
                  />
                  <p className="text-xs text-muted-foreground mt-1.5 ml-1">
                    Gleiche ISBN mehrfach scannen erhöht die Anzahl
                  </p>
                </div>
                <Button
                  onClick={handleScan}
                  data-cy="batch-scan-add-button"
                  className="h-11 shrink-0"
                >
                  <PlusCircle />
                  Hinzufügen
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* ── Stats Bar ────────────────────────────────────────── */}
          {entries.length > 0 && (
            <Card className="mb-4">
              <CardContent className="py-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    <StatChip
                      label={`Einträge: ${stats.totalEntries} (${stats.totalBooks} Bücher)`}
                    />
                    <StatChip
                      icon={CheckCircle}
                      label={`Gefunden: ${stats.found} (${stats.foundBooks} Bücher)`}
                      variant="success"
                    />
                    <StatChip
                      icon={AlertTriangle}
                      label={`Nicht gefunden: ${stats.notFound}`}
                      variant="warning"
                    />
                    {stats.withCover > 0 && (
                      <StatChip
                        icon={Image}
                        label={`Mit Cover: ${stats.withCover}`}
                        variant="info"
                      />
                    )}
                    {stats.loading > 0 && (
                      <StatChip
                        icon={Loader2}
                        label={`Wird geladen: ${stats.loading}`}
                      />
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearAll}
                      disabled={isImporting}
                      className="text-destructive border-destructive/30 hover:bg-destructive/10"
                    >
                      Alle löschen
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleImport}
                      disabled={isImporting || stats.readyToImportBooks === 0}
                      data-cy="batch-scan-import-button"
                    >
                      {isImporting ? (
                        <>
                          <Loader2 className="animate-spin" />
                          Importiere…
                        </>
                      ) : (
                        <>
                          <Save />
                          {stats.readyToImportBooks} Bücher importieren
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Progress bar */}
                {isImporting && (
                  <div className="mt-3 w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${importProgress}%` }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* ── Entries List ──────────────────────────────────────── */}
          {entries.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <ScanBarcode className="size-20 text-muted-foreground/20 mx-auto mb-4" />
                <h3 className="text-base font-semibold text-muted-foreground mb-1">
                  Noch keine Bücher gescannt
                </h3>
                <p className="text-sm text-muted-foreground">
                  Scannen Sie einen ISBN-Barcode oder geben Sie eine ISBN
                  manuell ein
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => (
                <BatchScanEntryCard
                  key={entry.id}
                  entry={entry}
                  onDelete={handleDelete}
                  onToggleEdit={handleToggleEdit}
                  onUpdateBookData={handleUpdateBookData}
                  onUpdateQuantity={handleUpdateQuantity}
                  onSetQuantity={handleSetQuantity}
                  onRetry={handleRetry}
                />
              ))}
            </div>
          )}
        </div>
      </TooltipProvider>
    </Layout>
  );
}
