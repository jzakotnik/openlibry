import { BookType } from "@/entities/BookType";
import { RentalsUserType } from "@/entities/RentalsUserType";
import { UserType } from "@/entities/UserType";
import { t } from "@/lib/i18n";
import { playSound } from "@/lib/utils/audioutils";
import { classifyScan, findBookForScan } from "@/lib/utils/scanClassifier";
import {
  BookOpen,
  CheckCircle2,
  LogOut,
  ScanBarcode,
  TriangleAlert,
  XCircle,
} from "lucide-react";
import Head from "next/head";
import { useCallback, useEffect, useRef, useState } from "react";
import useSWR from "swr";

/** Seconds without a scan before a logged-in session resets itself. */
const IDLE_TIMEOUT_MS = 45_000;
/** How long a rent/return result stays on screen before the prompt returns. */
const RESULT_TIMEOUT_MS = 6_000;

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type Tone = "success" | "warning" | "error";
interface Result {
  tone: Tone;
  title: string;
  text: string;
  bookId?: number;
}

const TONE_STYLE: Record<Tone, string> = {
  success: "bg-primary/10 border-primary text-foreground",
  warning: "bg-amber-500/10 border-amber-500 text-foreground",
  error: "bg-destructive/10 border-destructive text-foreground",
};

const TONE_ICON: Record<Tone, React.ReactNode> = {
  success: <CheckCircle2 className="h-14 w-14 text-primary shrink-0" />,
  warning: <TriangleAlert className="h-14 w-14 text-amber-500 shrink-0" />,
  error: <XCircle className="h-14 w-14 text-destructive shrink-0" />,
};

/**
 * Self-checkout screen for a barcode scanner (keyboard-wedge mode). It is
 * deliberately a standalone page without the normal Layout/navigation: the
 * only things a visitor can do are scan their library card, scan books
 * (rent or return is decided from the book's current status) and finish.
 * Pair it with a browser in kiosk mode pointed at /kiosk.
 *
 * Flow: IDLE (waiting for a card) -> LOGGED IN (scan books) -> back to IDLE
 * via the "Finish" button or after IDLE_TIMEOUT_MS without a scan.
 */
export default function KioskPage() {
  const [user, setUser] = useState<UserType | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const resultTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const { data, mutate } = useSWR("/api/rental", fetcher, {
    refreshInterval: 5000,
  });
  const books: BookType[] = data?.books ?? [];
  const users: UserType[] = data?.users ?? [];
  const rentals: RentalsUserType[] = data?.rentals ?? [];

  const showResult = useCallback((r: Result) => {
    clearTimeout(resultTimer.current);
    setResult(r);
    resultTimer.current = setTimeout(() => setResult(null), RESULT_TIMEOUT_MS);
  }, []);

  const reset = useCallback(() => {
    clearTimeout(idleTimer.current);
    clearTimeout(resultTimer.current);
    setUser(null);
    setResult(null);
    if (inputRef.current) inputRef.current.value = "";
    inputRef.current?.focus();
  }, []);

  // Auto-reset: restart the idle timer on every state change while logged in.
  useEffect(() => {
    clearTimeout(idleTimer.current);
    if (user) idleTimer.current = setTimeout(reset, IDLE_TIMEOUT_MS);
    return () => clearTimeout(idleTimer.current);
  }, [user, result, busy, reset]);

  const callApi = async (method: "POST" | "DELETE", b: number, u: number) => {
    try {
      const res = await fetch(`/api/book/${b}/user/${u}`, { method });
      return res.ok;
    } catch {
      return false;
    }
  };

  const handleUserScan = (raw: string) => {
    const c = classifyScan(raw);
    if (!c || c.type !== "id") {
      playSound("error");
      showResult({
        tone: "warning",
        title: t("kiosk.scanCardFirst"),
        text: t("kiosk.scanCardFirstText"),
      });
      return;
    }
    const found = users.find((u) => u.id === c.id);
    if (!found || !found.active) {
      playSound("error");
      showResult({
        tone: "error",
        title: t("kiosk.unknownCard"),
        text: t("kiosk.unknownCardText"),
      });
      return;
    }
    playSound("success");
    setResult(null);
    setUser(found);
  };

  const handleBookScan = async (raw: string) => {
    if (!user) return;
    const c = classifyScan(raw);
    const book = c ? findBookForScan(c, books) : undefined;
    if (!book) {
      playSound("error");
      showResult({
        tone: "error",
        title: t("kiosk.unknownBook"),
        text: t("kiosk.unknownBookText"),
      });
      return;
    }
    const title = book.title ?? "";

    if (book.rentalStatus !== "available" && book.rentalStatus !== "rented") {
      playSound("warning");
      showResult({
        tone: "warning",
        title,
        text: t("kiosk.unavailable"),
        bookId: book.id,
      });
      return;
    }

    setBusy(true);
    const renting = book.rentalStatus === "available";
    const ok = renting
      ? await callApi("POST", book.id!, user.id!)
      : await callApi("DELETE", book.id!, book.userId!);
    const fresh = await mutate().catch(() => undefined);
    setBusy(false);

    if (!ok) {
      playSound("error");
      showResult({
        tone: "error",
        title,
        text: t("kiosk.actionFailed"),
        bookId: book.id,
      });
      return;
    }
    playSound("success");
    const due = (fresh?.books as BookType[] | undefined)?.find(
      (b) => b.id === book.id,
    )?.dueDate;
    showResult({
      tone: "success",
      title: renting ? t("kiosk.rented") : t("kiosk.returned"),
      text: renting
        ? t("kiosk.rentedText", { title, due: String(due ?? "") })
        : t("kiosk.returnedText", { title }),
      bookId: book.id,
    });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    const raw = e.currentTarget.value.trim();
    e.currentTarget.value = "";
    if (!raw || busy) return;
    if (user) handleBookScan(raw);
    else handleUserScan(raw);
  };

  const myLoans = user ? rentals.filter((r) => r.userid === user.id) : [];

  return (
    <div
      className="fixed inset-0 flex flex-col bg-background text-foreground select-none"
      onContextMenu={(e) => e.preventDefault()}
      onClick={() => inputRef.current?.focus()}
      data-cy="kiosk_root"
    >
      <Head>
        <title>{t("kiosk.title")}</title>
        <meta name="robots" content="noindex" />
      </Head>

      {/* Invisible, permanently focused field that receives the scanner input. */}
      <input
        ref={inputRef}
        autoFocus
        onKeyDown={onKeyDown}
        onBlur={() => setTimeout(() => inputRef.current?.focus(), 0)}
        aria-label={t("kiosk.inputAria")}
        data-cy="kiosk_input"
        inputMode="none"
        autoComplete="off"
        className="absolute opacity-0 pointer-events-none h-0 w-0"
      />

      <header className="flex items-center justify-between px-8 py-5 border-b">
        <h1 className="text-2xl font-semibold">{t("kiosk.title")}</h1>
        {user && (
          <button
            type="button"
            onClick={reset}
            data-cy="kiosk_finish"
            className="flex items-center gap-2 rounded-lg border px-6 py-3 text-lg font-medium hover:bg-muted"
          >
            <LogOut className="h-6 w-6" />
            {t("kiosk.finish")}
          </button>
        )}
      </header>

      <main className="flex-1 flex flex-col items-center justify-center gap-8 px-8 overflow-hidden">
        {result && (
          <div
            data-cy="kiosk_result"
            className={`w-full max-w-3xl flex items-center gap-6 rounded-2xl border-2 p-8 ${TONE_STYLE[result.tone]}`}
          >
            {result.bookId !== undefined && (
              <img
                src={`/api/images/${result.bookId}`}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/coverimages/default.jpg";
                }}
                alt=""
                className="h-40 w-auto rounded-md border object-cover shadow-sm"
              />
            )}
            {TONE_ICON[result.tone]}
            <div className="min-w-0">
              <p className="text-3xl font-semibold">{result.title}</p>
              <p className="mt-2 text-xl text-muted-foreground">
                {result.text}
              </p>
            </div>
          </div>
        )}

        {!user && !result && (
          <div className="flex flex-col items-center gap-6 text-center">
            <ScanBarcode className="h-32 w-32 text-primary" />
            <p className="text-4xl font-semibold" data-cy="kiosk_prompt_card">
              {t("kiosk.promptCard")}
            </p>
          </div>
        )}

        {user && (
          <div className="w-full max-w-3xl flex flex-col items-center gap-6 text-center">
            <p className="text-3xl" data-cy="kiosk_user">
              {t("kiosk.hello", { name: user.firstName ?? "" })}
            </p>
            {!result && (
              <>
                <ScanBarcode className="h-24 w-24 text-primary" />
                <p className="text-3xl font-semibold" data-cy="kiosk_prompt_book">
                  {t("kiosk.promptBook")}
                </p>
              </>
            )}
            <div className="w-full rounded-xl border p-4 text-left">
              <p className="flex items-center gap-2 text-lg font-medium mb-2">
                <BookOpen className="h-5 w-5" />
                {t("kiosk.yourBooks", { count: myLoans.length })}
              </p>
              <ul className="text-lg space-y-1 max-h-40 overflow-hidden">
                {myLoans.slice(0, 5).map((r) => (
                  <li key={r.id} className="flex justify-between gap-4">
                    <span className="truncate">{r.title}</span>
                    <span
                      className={
                        r.remainingDays > 0
                          ? "text-destructive whitespace-nowrap"
                          : "text-muted-foreground whitespace-nowrap"
                      }
                    >
                      {String(r.dueDate)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
