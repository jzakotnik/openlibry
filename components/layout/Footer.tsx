import { t } from "@/lib/i18n";
import { useEffect, useState } from "react";

interface FooterProps {
  publicView?: boolean;
}

export default function Footer({ publicView = false }: FooterProps) {
  const [currentVersion, setCurrentVersion] = useState<string>("");

  useEffect(() => {
    fetch("/api/version")
      .then((res) => res.json())
      .then((data) => {
        setCurrentVersion(data.version);
      })
      .catch((err) => console.error("Failed to fetch version:", err));
  }, []);

  return (
    <footer className="text-center pt-12 pb-6">
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 text-sm">
        {publicView ? (
          // Public pages link to the internal area; internal pages link to
          // the public catalog. Each side points at the other.
          <a href="/manage" className="text-inherit hover:underline">
            {t("footer.manage")}
          </a>
        ) : (
          <a href="./catalog" className="text-inherit hover:underline">
            {t("footer.publicCatalog")}
          </a>
        )}
        <a href="https://openlibry.de" className="text-inherit hover:underline">
          {t("footer.copyright")}
        </a>
        <a href="https://openlibry.de" className="text-inherit hover:underline">
          {t("footer.imprint")}
        </a>
        <a href="https://openlibry.de" className="text-inherit hover:underline">
          {t("footer.privacy")}
        </a>
        <span className="text-inherit">v{currentVersion || "..."}</span>
      </div>
    </footer>
  );
}
