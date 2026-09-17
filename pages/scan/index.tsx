import Layout from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useScanSession } from "@/hooks/useScanSession";
import { t } from "@/lib/i18n";
import { filterUsers } from "@/lib/utils/searchUtils";
import {
  CheckCircle2,
  Info,
  RotateCcw,
  ScanBarcode,
  TriangleAlert,
  Undo2,
  User,
  X,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

const TONE_ICON: Record<string, React.ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />,
  info: <Info className="h-5 w-5 text-muted-foreground shrink-0" />,
  warning: <TriangleAlert className="h-5 w-5 text-amber-500 shrink-0" />,
  error: <XCircle className="h-5 w-5 text-destructive shrink-0" />,
};

const USER_RESULTS_LIMIT = 8;

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
  const [userSearchInput, setUserSearchInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const userSearchRef = useRef<HTMLInputElement>(null);

  const handleUnknownIsbn = useCallback(
    (isbn: string) => {
      toast.info(t("scan.toastUnknownIsbnRedirect"));
      router.push(`/book/new?isbn=${isbn}`);
    },
    [router],
  );

  const {
    users,
    rentals,
    selectedUserId,
    setSelectedUserId,
    log,
    clearLog,
    handleScan,
  } = useScanSession(handleUnknownIsbn);

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

  const selectedUser =
    selectedUserId !== false ? users.find((u) => u.id === selectedUserId) : null;

  // Same fuzzy/name/id/grade search used on the rental page's user list —
  // matters here just as much, since a school can have hundreds of users
  // and a dropdown wouldn't scale.
  const [filteredUsers, exactMatchUserId] = useMemo(
    () => filterUsers(users, userSearchInput, rentals, false),
    [users, userSearchInput, rentals],
  );
  const visibleUsers = filteredUsers.slice(0, USER_RESULTS_LIMIT);

  const selectUser = (id: number) => {
    setSelectedUserId(id);
    setUserSearchInput("");
    inputRef.current?.focus();
  };

  const handleUserSearchKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && exactMatchUserId > -1) {
      selectUser(exactMatchUserId);
    } else if (e.key === "Escape") {
      setUserSearchInput("");
    }
  };

  const clearSelectedUser = () => {
    setSelectedUserId(false);
    userSearchRef.current?.focus();
  };

  // For when the next person steps up to the desk: clear the selected
  // user, any in-progress search, and the scan log, without touching the
  // book data itself.
  const handleReset = () => {
    setSelectedUserId(false);
    setUserSearchInput("");
    setScanValue("");
    clearLog();
    userSearchRef.current?.focus();
  };

  return (
    <Layout>
      <div className="max-w-xl mx-auto my-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">{t("scan.title")}</h1>
          <button
            type="button"
            onClick={handleReset}
            aria-label={t("scan.resetAria")}
            data-cy="scan_reset_button"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {t("scan.resetButton")}
          </button>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">
            {t("scan.userLabel")}
          </label>

          {selectedUser ? (
            <Badge
              variant="secondary"
              onClick={clearSelectedUser}
              data-cy="scan_user_selected"
              className="w-fit cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              {selectedUser.firstName} {selectedUser.lastName}
              <X className="ml-1 h-3 w-3" />
            </Badge>
          ) : (
            <>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  ref={userSearchRef}
                  value={userSearchInput}
                  onChange={(e) => setUserSearchInput(e.target.value)}
                  onKeyUp={handleUserSearchKeyUp}
                  placeholder={t("scan.userPlaceholder")}
                  aria-label={t("rental.searchUsersAria")}
                  data-cy="scan_user_search_input"
                  className="pl-9"
                />
              </div>

              {userSearchInput && (
                <div
                  className="rounded-md border border-border divide-y divide-border overflow-hidden"
                  data-cy="scan_user_results"
                >
                  {visibleUsers.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-2.5">
                      {t("rental.noUsersFound")}
                    </p>
                  ) : (
                    visibleUsers.map((u) => (
                      <button
                        type="button"
                        key={u.id}
                        onClick={() => selectUser(u.id!)}
                        data-cy={`scan_user_result_${u.id}`}
                        className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-left hover:bg-muted/50"
                      >
                        <span className="truncate">
                          {u.firstName} {u.lastName}
                        </span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {t("rental.userMetaPrefix")} {u.id},{" "}
                          {t("rental.userMetaGrade")} {u.schoolGrade}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </>
          )}

          <p className="text-xs text-muted-foreground">
            {t("scan.userHintReturnWorksWithoutUser")}
          </p>
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
