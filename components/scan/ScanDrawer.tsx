import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookType } from "@/entities/BookType";
import { UserType } from "@/entities/UserType";
import { useSmartScan } from "@/hooks/useSmartScan";
import { t } from "@/lib/i18n";
import { playSound } from "@/lib/utils/audioutils";
import {
  CheckCircle2,
  Info,
  ScanBarcode,
  TriangleAlert,
  Undo2,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/router";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface ScanLogEntry {
  id: string;
  tone: "success" | "info" | "warning" | "error";
  text: string;
  undo?: () => Promise<void>;
  undone?: boolean;
}

const TONE_ICON: Record<ScanLogEntry["tone"], React.ReactNode> = {
  success: <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />,
  info: <Info className="h-4 w-4 text-muted-foreground shrink-0" />,
  warning: <TriangleAlert className="h-4 w-4 text-amber-500 shrink-0" />,
  error: <XCircle className="h-4 w-4 text-destructive shrink-0" />,
};

/**
 * Central, page-independent scan entry point (see GitHub issue #480):
 * scanning a code always resolves the right action itself — rent, return,
 * or "create new book" for an unknown ISBN — instead of requiring the
 * operator to navigate to a specific page/button first. Complements (does
 * not replace) the per-page scan field in the rental screen.
 */
export default function ScanDrawer() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [scanValue, setScanValue] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [log, setLog] = useState<ScanLogEntry[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data, mutate } = useSWR(open ? "/api/rental" : null, fetcher, {
    refreshInterval: 3000,
  });

  const books: BookType[] = data?.books ?? [];
  const users: UserType[] = (data?.users ?? []).filter(
    (u: UserType) => u.active,
  );
  const userId = selectedUserId ? parseInt(selectedUserId, 10) : null;
  const selectedUser = users.find((u) => u.id === userId);

  const pushLog = useCallback((entry: Omit<ScanLogEntry, "id">) => {
    setLog((prev) => {
      // A repeat scan (or a scanner re-firing Enter) hitting the same
      // no-op case shouldn't pile up identical entries — leave the
      // existing one in place instead of stacking duplicates.
      if (prev[0] && !prev[0].undo && prev[0].tone === entry.tone && prev[0].text === entry.text) {
        return prev;
      }
      return [{ ...entry, id: crypto.randomUUID() }, ...prev].slice(0, 20);
    });
  }, []);

  const markUndone = useCallback((id: string) => {
    setLog((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, undone: true } : entry)),
    );
  }, []);

  const rentBookApi = useCallback(
    async (bookId: number, uid: number) => {
      const res = await fetch(`/api/book/${bookId}/user/${uid}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      await mutate();
      return res.ok;
    },
    [mutate],
  );

  const returnBookApi = useCallback(
    async (bookId: number, uid: number) => {
      const res = await fetch(`/api/book/${bookId}/user/${uid}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      await mutate();
      return res.ok;
    },
    [mutate],
  );

  const { handleScan } = useSmartScan({
    books,
    hasUser: userId !== null,
    onRent: useCallback(
      async (book: BookType) => {
        if (!userId || !selectedUser) return;
        const ok = await rentBookApi(book.id!, userId);
        if (ok) {
          playSound("success");
          const entryId = crypto.randomUUID();
          setLog((prev) =>
            [
              {
                id: entryId,
                tone: "success" as const,
                text: t("scan.logRented", {
                  title: book.title ?? "",
                  name: `${selectedUser.firstName} ${selectedUser.lastName}`,
                }),
                undo: async () => {
                  await returnBookApi(book.id!, userId);
                  markUndone(entryId);
                },
              },
              ...prev,
            ].slice(0, 20),
          );
        } else {
          playSound("error");
          pushLog({ tone: "error", text: t("scan.logActionFailed") });
        }
      },
      [userId, selectedUser, rentBookApi, returnBookApi, markUndone, pushLog],
    ),
    onReturn: useCallback(
      async (book: BookType) => {
        const originalUserId = book.userId!;
        const ok = await returnBookApi(book.id!, originalUserId);
        if (ok) {
          playSound("success");
          const entryId = crypto.randomUUID();
          setLog((prev) =>
            [
              {
                id: entryId,
                tone: "success" as const,
                text: t("scan.logReturned", { title: book.title ?? "" }),
                undo: async () => {
                  await rentBookApi(book.id!, originalUserId);
                  markUndone(entryId);
                },
              },
              ...prev,
            ].slice(0, 20),
          );
        } else {
          playSound("error");
          pushLog({ tone: "error", text: t("scan.logActionFailed") });
        }
      },
      [returnBookApi, rentBookApi, markUndone, pushLog],
    ),
    onUnavailable: useCallback(
      (book: BookType) => {
        playSound("warning");
        pushLog({
          tone: "warning",
          text: t("scan.logUnavailable", {
            title: book.title ?? "",
            status: book.rentalStatus,
          }),
        });
      },
      [pushLog],
    ),
    onNeedsUser: useCallback(() => {
      playSound("warning");
      pushLog({ tone: "info", text: t("scan.logNeedsUser") });
    }, [pushLog]),
    onUnknownIsbn: useCallback(
      (isbn: string) => {
        playSound("scan");
        toast.info(t("scan.toastUnknownIsbnRedirect"));
        setOpen(false);
        router.push(`/book/new?isbn=${isbn}`);
      },
      [router],
    ),
    onUnknownId: useCallback(
      (id: number) => {
        playSound("error");
        pushLog({ tone: "error", text: t("scan.logUnknownId", { id }) });
      },
      [pushLog],
    ),
  });

  const handleSubmit = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key !== "Enter") return;
      const raw = scanValue.trim();
      if (!raw) return;
      handleScan(raw);
      setScanValue("");
    },
    [scanValue, handleScan],
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setScanValue("");
          setTimeout(() => inputRef.current?.focus(), 0);
        }
      }}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        aria-label={t("scan.openAria")}
        data-cy="topbar_scan_button"
        className="ml-2 p-2 h-10 w-10 rounded-lg text-white border border-white/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/20 bg-white/10"
      >
        <ScanBarcode className="h-5 w-5" />
      </Button>

      <DialogContent
        className="sm:max-w-md"
        data-cy="scan_drawer"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          inputRef.current?.focus();
        }}
      >
        <DialogHeader>
          <DialogTitle>{t("scan.title")}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">
              {t("scan.userLabel")}
            </label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger className="w-full" data-cy="scan_user_select">
                <SelectValue placeholder={t("scan.userPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {users
                  .slice()
                  .sort((a, b) => a.lastName.localeCompare(b.lastName))
                  .map((u) => (
                    <SelectItem key={u.id} value={String(u.id)}>
                      {u.firstName} {u.lastName}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="relative flex items-center">
            <ScanBarcode className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              ref={inputRef}
              autoFocus
              value={scanValue}
              onChange={(e) => setScanValue(e.target.value)}
              onKeyDown={handleSubmit}
              placeholder={t("scan.inputPlaceholder")}
              aria-label={t("scan.inputAria")}
              data-cy="scan_input"
              className="pl-9"
            />
          </div>

          <div
            className="flex flex-col gap-2 max-h-72 overflow-y-auto"
            data-cy="scan_log"
          >
            {log.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t("scan.logEmpty")}
              </p>
            )}
            {log.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start gap-2 rounded-md border border-border bg-card px-2.5 py-2 text-sm"
              >
                {TONE_ICON[entry.tone]}
                <span className="flex-1 min-w-0">{entry.text}</span>
                {entry.undo && !entry.undone && (
                  <button
                    type="button"
                    onClick={entry.undo}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground shrink-0"
                  >
                    <Undo2 className="h-3.5 w-3.5" />
                    {t("scan.undo")}
                  </button>
                )}
                {entry.undone && (
                  <span className="text-xs text-muted-foreground shrink-0">
                    {t("scan.undone")}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
