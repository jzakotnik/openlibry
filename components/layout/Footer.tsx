import { useEffect, useState } from "react";

export default function Footer() {
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
        <a href="https://openlibry.de" className="text-inherit hover:underline">
          Copyright
        </a>
        <a href="https://openlibry.de" className="text-inherit hover:underline">
          Impressum
        </a>
        <a href="https://openlibry.de" className="text-inherit hover:underline">
          Datenschutz
        </a>
        <span className="text-inherit">v{currentVersion || "..."}</span>
      </div>
    </footer>
  );
}
