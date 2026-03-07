import type { ScannedEntry } from "@/components/batch-scan";
import {
  BatchScanEntryCard,
  StatChip,
  checkCoverExists,
  fetchBookDataByIsbn,
  uploadCover,
} from "@/components/batch-scan";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BookType } from "@/entities/BookType";
import { playSound } from "@/lib/utils/audioutils";
import { currentTime } from "@/lib/utils/dateutils";
import { generateId } from "@/lib/utils/id";
import {
  AlertTriangle,
  CheckCircle,
  Image,
  Loader2,
  PlusCircle,
  Save,
  ScanBarcode,
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
      fetchBookDataByIsbn(cleanedIsbn),
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
  }, [isbnInput, entries]);

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
        fetchBookDataByIsbn(isbn),
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
    [entries],
  );

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
        { duration: 10000 },
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
          {/* Scanner Input */}
          <Card className="mb-4">
            <CardContent className="pt-5">
              <h2 className="text-base font-semibold mb-3">
                ISBN scannen oder eingeben
              </h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <div className="relative">
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
                  </div>
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

          {/* Stats Bar */}
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

          {/* Entries List */}
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
