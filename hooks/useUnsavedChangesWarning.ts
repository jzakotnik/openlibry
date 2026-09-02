import { t } from "@/lib/i18n";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef } from "react";

/**
 * Warns before leaving a page with unsaved changes - both for in-app
 * navigation (Next.js router) and for closing/reloading the browser tab.
 *
 * Call `allowNextNavigation()` right before a navigation the page itself
 * triggers intentionally (e.g. after a successful save/delete), so that
 * one doesn't immediately trip the same guard it just satisfied.
 */
export function useUnsavedChangesWarning(dirty: boolean) {
  const router = useRouter();
  const suppressRef = useRef(false);

  const allowNextNavigation = useCallback(() => {
    suppressRef.current = true;
  }, []);

  useEffect(() => {
    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = "";
    };

    const routeChangeStart = () => {
      if (suppressRef.current) {
        suppressRef.current = false;
        return;
      }
      if (!dirty) return;
      if (window.confirm(t("common.unsavedChangesWarning"))) return;
      router.events.emit("routeChangeError");
      throw "Route change aborted by unsaved-changes guard.";
    };

    window.addEventListener("beforeunload", beforeUnload);
    router.events.on("routeChangeStart", routeChangeStart);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      router.events.off("routeChangeStart", routeChangeStart);
    };
  }, [dirty, router]);

  return { allowNextNavigation };
}
