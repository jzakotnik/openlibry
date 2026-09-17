import Layout from "@/components/layout/Layout";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useScanSession } from "@/hooks/useScanSession";
import { t } from "@/lib/i18n";
import {
  CheckCircle2,
  Info,
  ScanBarcode,
  TriangleAlert,
  Undo2,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const TONE_ICON: Record<string, React.ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />,
  info: <Info className="h-5 w-5 text-muted-foreground shrink-0" />,
  warning: <TriangleAlert className="h-5 w-5 text-amber-500 shrink-0" />,
  error: <XCircle className="h-5 w-5 text-destructive shrink-0" />,
};

/**
 * Alternative, scan-first way to work the circulation desk (see GitHub
 * issue #480): one field decides the action itself from the scanned
 * code — rent an available book, return a rented one (no user needs to be
 * selected for that), or hand off to the new-book form for an ISBN the
 * catalog doesn't know yet. Deliberately a separate page rather than an
 * overlay on /rental — the two are independent ways to do the same job,
 * and staff can pick whichever fits how they work.
 */
export default function ScanPage() {
  const router = useRouter();
  const [scanValue, setScanValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUnknownIsbn = useCallback(
    (isbn: string) => {
      toast.info(t("scan.toastUnknownIsbnRedirect"));
      router.push(`/book/new?isbn=${isbn}`);
    },
    [router],
  );

  const { users, selectedUserId, setSelectedUserId, log, handleScan } =
    useScanSession(handleUnknownIsbn);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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

  const selectedUser = users.find((u) => String(u.id) === selectedUserId);

  return (
    <Layout>
      <div className="max-w-xl mx-auto my-4 flex flex-col gap-4">
        <div>
          <h1 className="text-lg font-semibold">{t("scan.title")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("scan.pageSubtitle")}
          </p>
        </div>

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
          {!selectedUser && (
            <p className="text-xs text-muted-foreground">
              {t("scan.userHintReturnWorksWithoutUser")}
            </p>
          )}
        </div>

        <div className="relative flex items-center">
          <ScanBarcode className="absolute left-3 h-5 w-5 text-muted-foreground pointer-events-none" />
          <Input
            ref={inputRef}
            autoFocus
            value={scanValue}
            onChange={(e) => setScanValue(e.target.value)}
            onKeyDown={handleSubmit}
            placeholder={t("scan.inputPlaceholder")}
            aria-label={t("scan.inputAria")}
            data-cy="scan_input"
            className="pl-10 h-12 text-base"
          />
        </div>

        <div className="flex flex-col gap-2" data-cy="scan_log">
          {log.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              {t("scan.logEmpty")}
            </p>
          )}
          {log.map((entry) => (
            <div
              key={entry.id}
              className="flex items-start gap-2 rounded-md border border-border bg-card px-3 py-2.5 text-sm"
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
    </Layout>
  );
}
