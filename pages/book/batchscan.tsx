import Layout from "@/components/layout/Layout";
import { BookType } from "@/entities/BookType";
import { currentTime } from "@/lib/utils/dateutils";
import AddIcon from "@mui/icons-material/Add";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ErrorIcon from "@mui/icons-material/Error";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import ImageIcon from "@mui/icons-material/Image";
import ImageNotSupportedIcon from "@mui/icons-material/ImageNotSupported";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import RemoveIcon from "@mui/icons-material/Remove";
import SaveIcon from "@mui/icons-material/Save";
import UndoIcon from "@mui/icons-material/Undo";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  IconButton,
  InputAdornment,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/router";
import { useSnackbar } from "notistack";
import {
  KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { playSound } from "@/lib/utils/audioutils";
import { generateId } from "@/lib/utils/idutils";

// Status types for each scanned entry
type ScanStatus = "loading" | "found" | "not_found" | "edited" | "error";

interface ScannedEntry {
  id: string; // unique identifier for React keys
  isbn: string;
  status: ScanStatus;
  bookData: Partial<BookType>;
  errorMessage?: string;
  isEditing?: boolean;
  coverUrl?: string; // Object URL for the cover image blob
  hasCover?: boolean; // Whether a cover was found
  coverBlob?: Blob; // The actual cover image data for upload
  coverSource?: string; // Source of the cover (DNB, OpenLibrary)
  quantity: number; // Number of copies to import
}

// Check if a cover exists (checks DNB first, then OpenLibrary via server-side API)
// When called without bookId, fetchCover returns the image directly instead of saving
const checkCoverExists = async (
  isbn: string,
): Promise<{ exists: boolean; blob?: Blob; source?: string }> => {
  try {
    const response = await fetch(`/api/book/fetchCover?isbn=${isbn}`);

    if (!response.ok) {
      return { exists: false };
    }

    const blob = await response.blob();
    const source = response.headers.get("X-Cover-Source") || "unknown";

    return { exists: true, blob, source };
  } catch {
    return { exists: false };
  }
};

export default function BatchScan() {
  const theme = useTheme();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const [isbnInput, setIsbnInput] = useState("");
  const [entries, setEntries] = useState<ScannedEntry[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount and after actions
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Cleanup object URLs when entries change
  useEffect(() => {
    return () => {
      // Cleanup object URLs on unmount
      entries.forEach((entry) => {
        if (entry.coverUrl?.startsWith("blob:")) {
          URL.revokeObjectURL(entry.coverUrl);
        }
      });
    };
  }, []);

  // Fetch book data from DNB API
  const fetchBookData = useCallback(
    async (isbn: string): Promise<Partial<BookType> | null> => {
      const cleanedIsbn = isbn.replace(/\D/g, "");
      if (!cleanedIsbn) return null;

      try {
        const response = await fetch(
          `/api/book/FillBookByIsbn?isbn=${cleanedIsbn}`,
        );
        if (!response.ok) {
          return null;
        }
        return await response.json();
      } catch {
        return null;
      }
    },
    [],
  );

  // Handle ISBN scan/input
  const handleScan = useCallback(async () => {
    const cleanedIsbn = isbnInput.trim().replace(/\D/g, "");

    if (!cleanedIsbn) {
      enqueueSnackbar("Bitte eine gültige ISBN eingeben", {
        variant: "warning",
      });
      return;
    }

    // Check for existing entry with same ISBN
    const existingEntry = entries.find((e) => e.isbn === cleanedIsbn);

    if (existingEntry) {
      // Increment quantity of existing entry (preserves any manual edits)
      setEntries((prev) =>
        prev.map((entry) =>
          entry.isbn === cleanedIsbn
            ? { ...entry, quantity: entry.quantity + 1 }
            : entry,
        ),
      );
      playSound("scan");
      enqueueSnackbar(
        `"${existingEntry.bookData.title || cleanedIsbn}" - jetzt ${existingEntry.quantity + 1} Exemplare`,
        { variant: "success" },
      );
      setIsbnInput("");
      inputRef.current?.focus();
      return;
    }

    playSound("scan");

    // Add new entry with loading status
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

    // Fetch book data and cover in parallel
    const [bookData, coverResult] = await Promise.all([
      fetchBookData(cleanedIsbn),
      checkCoverExists(cleanedIsbn),
    ]);

    // Create object URL for cover preview if found
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
      enqueueSnackbar(`"${bookData.title}" gefunden${coverInfo}`, {
        variant: "success",
      });
    } else {
      playSound("error");
      enqueueSnackbar(
        "ISBN nicht in Datenbank gefunden - manuelle Eingabe möglich",
        {
          variant: "warning",
        },
      );
    }
  }, [isbnInput, entries, fetchBookData, enqueueSnackbar]);

  // Handle Enter key for barcode scanner
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleScan();
    }
  };

  // Delete an entry
  const handleDelete = useCallback(
    (id: string) => {
      // Cleanup object URL before deleting
      const entry = entries.find((e) => e.id === id);
      if (entry?.coverUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(entry.coverUrl);
      }
      setEntries((prev) => prev.filter((entry) => entry.id !== id));
      enqueueSnackbar("Eintrag gelöscht", { variant: "info" });
      inputRef.current?.focus();
    },
    [entries, enqueueSnackbar],
  );

  // Toggle edit mode for an entry
  const handleToggleEdit = useCallback((id: string) => {
    setEntries((prev) =>
      prev.map((entry) =>
        entry.id === id
          ? { ...entry, isEditing: !entry.isEditing, status: "edited" }
          : entry,
      ),
    );
  }, []);

  // Update book data for an entry
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

  // Update quantity for an entry
  const handleUpdateQuantity = useCallback((id: string, delta: number) => {
    setEntries((prev) =>
      prev.map((entry) => {
        if (entry.id !== id) return entry;
        const newQuantity = Math.max(1, entry.quantity + delta);
        return { ...entry, quantity: newQuantity };
      }),
    );
  }, []);

  // Set quantity directly for an entry
  const handleSetQuantity = useCallback((id: string, quantity: number) => {
    setEntries((prev) =>
      prev.map((entry) => {
        if (entry.id !== id) return entry;
        const newQuantity = Math.max(1, quantity);
        return { ...entry, quantity: newQuantity };
      }),
    );
  }, []);

  // Retry fetching data for an entry
  const handleRetry = useCallback(
    async (id: string, isbn: string) => {
      // Cleanup old object URL
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

      // Create object URL for cover preview if found
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
        enqueueSnackbar(`"${bookData.title}" gefunden${coverInfo}`, {
          variant: "success",
        });
      } else {
        playSound("error");
        enqueueSnackbar("Weiterhin nicht gefunden", { variant: "warning" });
      }
    },
    [entries, fetchBookData, enqueueSnackbar],
  );

  // Upload cover image for a book
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

  // Import all valid entries to database
  const handleImport = useCallback(async () => {
    const validEntries = entries.filter(
      (e) =>
        (e.status === "found" || e.status === "edited") && e.bookData.title,
    );

    if (validEntries.length === 0) {
      enqueueSnackbar(
        "Keine gültigen Einträge zum Importieren (Titel und Autor erforderlich)",
        { variant: "warning" },
      );
      return;
    }

    // Calculate total books to import (sum of quantities)
    const totalBooks = validEntries.reduce((sum, e) => sum + e.quantity, 0);

    setIsImporting(true);
    setImportProgress(0);

    const results: {
      success: number;
      failed: number;
      coversUploaded: number;
      ids: number[];
    } = {
      success: 0,
      failed: 0,
      coversUploaded: 0,
      ids: [],
    };

    let processedBooks = 0;

    for (const entry of validEntries) {
      // Import each copy of this book
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

            // Upload cover for each copy (each book has its own ID)
            if (entry.hasCover && entry.coverBlob && data.id) {
              const coverUploaded = await uploadCover(data.id, entry.coverBlob);
              if (coverUploaded) {
                results.coversUploaded++;
              }
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

      // Cleanup object URL and remove successfully imported entry
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
      enqueueSnackbar(
        `${results.success} Buch/Bücher erfolgreich importiert!${coverInfo}`,
        { variant: "success" },
      );
    }

    if (results.failed > 0) {
      enqueueSnackbar(
        `${results.failed} Buch/Bücher konnten nicht importiert werden`,
        {
          variant: "error",
        },
      );
    }

    inputRef.current?.focus();
  }, [entries, enqueueSnackbar]);

  // Clear all entries
  const handleClearAll = useCallback(() => {
    if (entries.length === 0) return;

    if (window.confirm("Alle Einträge löschen?")) {
      // Cleanup all object URLs
      entries.forEach((entry) => {
        if (entry.coverUrl?.startsWith("blob:")) {
          URL.revokeObjectURL(entry.coverUrl);
        }
      });
      setEntries([]);
      enqueueSnackbar("Alle Einträge gelöscht", { variant: "info" });
      inputRef.current?.focus();
    }
  }, [entries, enqueueSnackbar]);

  // Stats for the summary bar
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
    const readyToImport = entries.filter(
      (e) =>
        (e.status === "found" || e.status === "edited") && e.bookData.title,
    ).length;
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
      readyToImport,
      readyToImportBooks,
    };
  }, [entries]);

  return (
    <Layout>
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: "auto" }}>
        {/* Scanner Input */}
        <Paper sx={{ p: 3, mb: 3 }} elevation={2}>
          <Typography variant="h6" gutterBottom>
            ISBN scannen oder eingeben
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              inputRef={inputRef}
              fullWidth
              label="ISBN"
              placeholder="ISBN hier scannen oder eingeben..."
              value={isbnInput}
              onChange={(e) => setIsbnInput(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              data-cy="batch-scan-isbn-input"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <QrCodeScannerIcon color="action" />
                  </InputAdornment>
                ),
              }}
              helperText="Gleiche ISBN mehrfach scannen erhöht die Anzahl"
            />
            <Button
              variant="contained"
              startIcon={<AddCircleOutlineIcon />}
              onClick={handleScan}
              sx={{ minWidth: 150, height: 56 }}
              data-cy="batch-scan-add-button"
            >
              Hinzufügen
            </Button>
          </Stack>
        </Paper>

        {/* Stats Bar */}
        {entries.length > 0 && (
          <Paper sx={{ p: 2, mb: 3 }} elevation={1}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems="center"
              justifyContent="space-between"
            >
              <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                <Chip
                  label={`Einträge: ${stats.totalEntries} (${stats.totalBooks} Bücher)`}
                  variant="outlined"
                  size="small"
                />
                <Chip
                  icon={<CheckCircleIcon />}
                  label={`Gefunden: ${stats.found} (${stats.foundBooks} Bücher)`}
                  color="success"
                  variant="outlined"
                  size="small"
                />
                <Chip
                  icon={<ErrorIcon />}
                  label={`Nicht gefunden: ${stats.notFound}`}
                  color="warning"
                  variant="outlined"
                  size="small"
                />
                {stats.withCover > 0 && (
                  <Chip
                    icon={<ImageIcon />}
                    label={`Mit Cover: ${stats.withCover}`}
                    color="info"
                    variant="outlined"
                    size="small"
                  />
                )}
                {stats.loading > 0 && (
                  <Chip
                    icon={<HourglassEmptyIcon />}
                    label={`Wird geladen: ${stats.loading}`}
                    variant="outlined"
                    size="small"
                  />
                )}
              </Stack>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={handleClearAll}
                  disabled={isImporting}
                >
                  Alle löschen
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={
                    isImporting ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <SaveIcon />
                    )
                  }
                  onClick={handleImport}
                  disabled={isImporting || stats.readyToImportBooks === 0}
                  data-cy="batch-scan-import-button"
                >
                  {isImporting
                    ? "Importiere..."
                    : `${stats.readyToImportBooks} Bücher importieren`}
                </Button>
              </Stack>
            </Stack>
            {isImporting && (
              <LinearProgress
                variant="determinate"
                value={importProgress}
                sx={{ mt: 2 }}
              />
            )}
          </Paper>
        )}

        {/* Entries List */}
        {entries.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: "center" }} elevation={0}>
            <QrCodeScannerIcon
              sx={{ fontSize: 80, color: theme.palette.grey[300], mb: 2 }}
            />
            <Typography variant="h6" color="text.secondary">
              Noch keine Bücher gescannt
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Scannen Sie einen ISBN-Barcode oder geben Sie eine ISBN manuell
              ein
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={2}>
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
          </Stack>
        )}
      </Box>
    </Layout>
  );
}

// Entry Card Component
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
  const theme = useTheme();

  const getStatusColor = () => {
    switch (entry.status) {
      case "found":
        return theme.palette.success.main;
      case "edited":
        return theme.palette.info.main;
      case "not_found":
        return theme.palette.warning.main;
      case "error":
        return theme.palette.error.main;
      default:
        return theme.palette.grey[400];
    }
  };

  const getStatusIcon = () => {
    switch (entry.status) {
      case "found":
        return <CheckCircleIcon color="success" />;
      case "edited":
        return <EditIcon color="info" />;
      case "not_found":
        return <ErrorIcon color="warning" />;
      case "error":
        return <ErrorIcon color="error" />;
      default:
        return <CircularProgress size={20} />;
    }
  };

  const isValid = entry.bookData.title;

  return (
    <Card
      elevation={2}
      sx={{
        borderLeft: `4px solid ${getStatusColor()}`,
        transition: "all 0.2s ease",
        "&:hover": {
          boxShadow: 4,
        },
      }}
      data-cy="batch-scan-entry"
    >
      <CardContent sx={{ pb: 1 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={1}
          sx={{ mb: 2 }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            {getStatusIcon()}
            <Typography variant="subtitle1" fontWeight="bold">
              ISBN: {entry.isbn}
            </Typography>
            {entry.status === "loading" && (
              <Typography variant="body2" color="text.secondary">
                Suche in Datenbank...
              </Typography>
            )}
            {entry.hasCover && (
              <Tooltip title={`Cover von ${entry.coverSource || "unbekannt"}`}>
                <ImageIcon color="info" fontSize="small" />
              </Tooltip>
            )}
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            {/* Quantity Controls */}
            {entry.status !== "loading" && (
              <Stack
                direction="row"
                spacing={0.5}
                alignItems="center"
                sx={{
                  bgcolor: theme.palette.grey[100],
                  borderRadius: 1,
                  px: 1,
                  py: 0.5,
                }}
              >
                <IconButton
                  size="small"
                  onClick={() => onUpdateQuantity(entry.id, -1)}
                  disabled={entry.quantity <= 1}
                  sx={{ p: 0.5 }}
                >
                  <RemoveIcon fontSize="small" />
                </IconButton>
                <TextField
                  size="small"
                  type="number"
                  value={entry.quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val)) {
                      onSetQuantity(entry.id, val);
                    }
                  }}
                  inputProps={{
                    min: 1,
                    style: {
                      textAlign: "center",
                      width: 40,
                      padding: "4px",
                    },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { border: "none" },
                    },
                  }}
                />
                <IconButton
                  size="small"
                  onClick={() => onUpdateQuantity(entry.id, 1)}
                  sx={{ p: 0.5 }}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ ml: 0.5 }}
                >
                  {entry.quantity === 1 ? "Exemplar" : "Exemplare"}
                </Typography>
              </Stack>
            )}

            {entry.status === "not_found" && (
              <Tooltip title="Erneut suchen">
                <IconButton
                  size="small"
                  onClick={() => onRetry(entry.id, entry.isbn)}
                  color="primary"
                >
                  <UndoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip
              title={entry.isEditing ? "Bearbeitung beenden" : "Bearbeiten"}
            >
              <IconButton
                size="small"
                onClick={() => onToggleEdit(entry.id)}
                color={entry.isEditing ? "primary" : "default"}
                disabled={entry.status === "loading"}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Löschen">
              <IconButton
                size="small"
                onClick={() => onDelete(entry.id)}
                color="error"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        {entry.status !== "loading" && (
          <>
            {/* Preview/Edit Mode */}
            <Collapse in={!entry.isEditing}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                {/* Cover Image Preview */}
                <Box
                  sx={{
                    flexShrink: 0,
                    display: "flex",
                    justifyContent: { xs: "center", sm: "flex-start" },
                  }}
                >
                  {entry.hasCover && entry.coverUrl ? (
                    <Avatar
                      variant="rounded"
                      src={entry.coverUrl}
                      alt="Cover"
                      sx={{
                        width: 80,
                        height: 120,
                        bgcolor: theme.palette.grey[200],
                      }}
                    >
                      <ImageIcon />
                    </Avatar>
                  ) : (
                    <Avatar
                      variant="rounded"
                      sx={{
                        width: 80,
                        height: 120,
                        bgcolor: theme.palette.grey[100],
                      }}
                    >
                      <ImageNotSupportedIcon color="disabled" />
                    </Avatar>
                  )}
                </Box>

                {/* Book Details */}
                <Grid container spacing={2} sx={{ flexGrow: 1 }}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Titel
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {entry.bookData.title || (
                        <em style={{ color: "red" }}>Nicht angegeben</em>
                      )}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Autor
                    </Typography>
                    <Typography variant="body1">
                      {entry.bookData.author || (
                        <em style={{ color: "red" }}>Nicht angegeben</em>
                      )}
                    </Typography>
                  </Grid>
                  {entry.bookData.publisherName && (
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        Verlag
                      </Typography>
                      <Typography variant="body1">
                        {entry.bookData.publisherName}
                      </Typography>
                    </Grid>
                  )}
                  {entry.bookData.publisherDate && (
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        Jahr
                      </Typography>
                      <Typography variant="body1">
                        {entry.bookData.publisherDate}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Stack>
            </Collapse>

            {/* Edit Mode */}
            <Collapse in={entry.isEditing}>
              <Divider sx={{ my: 2 }} />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                {/* Cover Image Preview in Edit Mode */}
                <Box
                  sx={{
                    flexShrink: 0,
                    display: "flex",
                    justifyContent: { xs: "center", sm: "flex-start" },
                  }}
                >
                  {entry.hasCover && entry.coverUrl ? (
                    <Avatar
                      variant="rounded"
                      src={entry.coverUrl}
                      alt="Cover"
                      sx={{
                        width: 80,
                        height: 120,
                        bgcolor: theme.palette.grey[200],
                      }}
                    >
                      <ImageIcon />
                    </Avatar>
                  ) : (
                    <Avatar
                      variant="rounded"
                      sx={{
                        width: 80,
                        height: 120,
                        bgcolor: theme.palette.grey[100],
                      }}
                    >
                      <ImageNotSupportedIcon color="disabled" />
                    </Avatar>
                  )}
                </Box>

                {/* Edit Fields */}
                <Grid container spacing={2} sx={{ flexGrow: 1 }}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Titel *"
                      value={entry.bookData.title || ""}
                      onChange={(e) =>
                        onUpdateBookData(entry.id, "title", e.target.value)
                      }
                      error={!entry.bookData.title}
                      helperText={!entry.bookData.title && "Titel erforderlich"}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Autor *"
                      value={entry.bookData.author || ""}
                      onChange={(e) =>
                        onUpdateBookData(entry.id, "author", e.target.value)
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Untertitel"
                      value={entry.bookData.subtitle || ""}
                      onChange={(e) =>
                        onUpdateBookData(entry.id, "subtitle", e.target.value)
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Verlag"
                      value={entry.bookData.publisherName || ""}
                      onChange={(e) =>
                        onUpdateBookData(
                          entry.id,
                          "publisherName",
                          e.target.value,
                        )
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Verlagsort"
                      value={entry.bookData.publisherLocation || ""}
                      onChange={(e) =>
                        onUpdateBookData(
                          entry.id,
                          "publisherLocation",
                          e.target.value,
                        )
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Erscheinungsjahr"
                      value={entry.bookData.publisherDate || ""}
                      onChange={(e) =>
                        onUpdateBookData(
                          entry.id,
                          "publisherDate",
                          e.target.value,
                        )
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Seiten"
                      type="number"
                      value={entry.bookData.pages || ""}
                      onChange={(e) =>
                        onUpdateBookData(
                          entry.id,
                          "pages",
                          parseInt(e.target.value) || 0,
                        )
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Preis"
                      value={entry.bookData.price || ""}
                      onChange={(e) =>
                        onUpdateBookData(entry.id, "price", e.target.value)
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Zusammenfassung"
                      multiline
                      rows={2}
                      value={entry.bookData.summary || ""}
                      onChange={(e) =>
                        onUpdateBookData(entry.id, "summary", e.target.value)
                      }
                    />
                  </Grid>
                </Grid>
              </Stack>
            </Collapse>
          </>
        )}
      </CardContent>

      <CardActions sx={{ justifyContent: "flex-end", pt: 0 }}>
        {!isValid && entry.status !== "loading" && (
          <Alert severity="warning" sx={{ flexGrow: 1, py: 0 }}>
            Titel und Autor sind für den Import erforderlich
          </Alert>
        )}
      </CardActions>
    </Card>
  );
}
