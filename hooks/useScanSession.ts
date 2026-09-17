import { BookType } from "@/entities/BookType";
import { RentalsUserType } from "@/entities/RentalsUserType";
import { UserType } from "@/entities/UserType";
import { t } from "@/lib/i18n";
import { playSound } from "@/lib/utils/audioutils";
import { useCallback, useState } from "react";
import useSWR from "swr";
import { useSmartScan } from "./useSmartScan";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export type ScanLogTone = "success" | "info" | "warning" | "error";

export interface ScanLogEntry {
  id: string;
  tone: ScanLogTone;
  text: string;
  undo?: () => Promise<void>;
  undone?: boolean;
  /** Tags the "please select a user" entry so it can be cleared once one is picked. */
  kind?: "needs-user";
}

/**
 * All the state and side-effects behind the smart-scan workflow (issue
 * #480): scanning a code rents an available book, returns a rented one (no
 * user needs to be selected for that), or — for an unrecognized ISBN —
 * hands back the isbn so the caller can route to the new-book form.
 *
 * Kept separate from any particular UI (see pages/scan/index.tsx) so the
 * same session logic could back more than one surface if needed later.
 */
export function useScanSession(onUnknownIsbn: (isbn: string) => void) {
  const [selectedUserId, setSelectedUserId] = useState<number | false>(false);
  const [log, setLog] = useState<ScanLogEntry[]>([]);

  const { data, mutate } = useSWR("/api/rental", fetcher, {
    refreshInterval: 1000,
  });

  const books: BookType[] = data?.books ?? [];
  const users: UserType[] = (data?.users ?? []).filter(
    (u: UserType) => u.active,
  );
  const rentals: RentalsUserType[] = data?.rentals ?? [];
  const userId = selectedUserId === false ? null : selectedUserId;
  const selectedUser = users.find((u) => u.id === userId);

  const pushLog = useCallback((entry: Omit<ScanLogEntry, "id">) => {
    setLog((prev) => {
      // A repeat scan (or a scanner re-firing Enter) hitting the same
      // no-op case shouldn't pile up identical entries — leave the
      // existing one in place instead of stacking duplicates.
      if (
        prev[0] &&
        !prev[0].undo &&
        prev[0].tone === entry.tone &&
        prev[0].text === entry.text
      ) {
        return prev;
      }
      return [{ ...entry, id: crypto.randomUUID() }, ...prev].slice(0, 30);
    });
  }, []);

  const markUndone = useCallback((id: string) => {
    setLog((prev) =>
      prev.map((entry) =>
        entry.id === id ? { ...entry, undone: true } : entry,
      ),
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
            ].slice(0, 30),
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
            ].slice(0, 30),
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
      pushLog({
        tone: "info",
        text: t("scan.logNeedsUser"),
        kind: "needs-user",
      });
    }, [pushLog]),
    onUnknownIsbn: useCallback(
      (isbn: string) => {
        playSound("scan");
        onUnknownIsbn(isbn);
      },
      [onUnknownIsbn],
    ),
    onUnknownId: useCallback(
      (id: number) => {
        playSound("error");
        pushLog({ tone: "error", text: t("scan.logUnknownId", { id }) });
      },
      [pushLog],
    ),
  });

  const clearLog = useCallback(() => setLog([]), []);

  // Picking a user resolves the "please select a user first" warning, if
  // one is showing — it shouldn't linger in the log once it no longer
  // applies.
  const selectUser = useCallback((id: number) => {
    setSelectedUserId(id);
    setLog((prev) => prev.filter((entry) => entry.kind !== "needs-user"));
  }, []);

  return {
    books,
    users,
    rentals,
    selectedUserId,
    setSelectedUserId,
    selectUser,
    log,
    clearLog,
    handleScan,
  };
}
