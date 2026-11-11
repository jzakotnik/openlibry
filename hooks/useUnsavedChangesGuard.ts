import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";

export interface UnsavedChangesGuard {
  /** True while the confirmation dialog should be shown. */
  open: boolean;
  /** Dismiss the dialog and stay on the page. */
  stay: () => void;
  /** Dismiss the dialog and continue to the page the user wanted. */
  leave: () => void;
  /** Call right before an intentional navigation (e.g. after saving). */
  allowNavigation: () => void;
}

/**
 * Blocks in-app navigation while `dirty` is true and exposes state for a
 * custom confirmation dialog (instead of window.confirm).
 *
 * Browser reload / tab close can't be customised, so for those we fall back
 * to the browser's native `beforeunload` prompt.
 */
export function useUnsavedChangesGuard(dirty: boolean): UnsavedChangesGuard {
  const router = useRouter();
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const bypassRef = useRef(false);
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!dirtyRef.current || bypassRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    };

    const onRouteChangeStart = (url: string) => {
      if (!dirtyRef.current || bypassRef.current) return;
      setPendingUrl(url);
      // Next.js pages router has no official way to cancel a navigation:
      // emitting routeChangeError and throwing aborts it.
      router.events.emit("routeChangeError");
      throw "Route change aborted because of unsaved changes.";
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    router.events.on("routeChangeStart", onRouteChangeStart);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      router.events.off("routeChangeStart", onRouteChangeStart);
    };
  }, [router]);

  const stay = useCallback(() => setPendingUrl(null), []);

  const leave = useCallback(() => {
    const url = pendingUrl;
    setPendingUrl(null);
    bypassRef.current = true;
    if (url) router.push(url);
  }, [pendingUrl, router]);

  const allowNavigation = useCallback(() => {
    bypassRef.current = true;
  }, []);

  return { open: pendingUrl !== null, stay, leave, allowNavigation };
}
