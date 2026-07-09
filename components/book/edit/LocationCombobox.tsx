import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { LocationEntry } from "@/pages/api/book/locations";
import { MapPin, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface LocationComboboxProps {
  value: string;
  onChange: (v: string) => void;
  label?: string;
  autoFocus?: boolean;
}

export default function LocationCombobox({
  value,
  onChange,
  label = "Standort",
  autoFocus = false,
}: LocationComboboxProps) {
  const [allLocations, setAllLocations] = useState<LocationEntry[]>([]);
  const [open, setOpen] = useState(false);
  const [locked, setLocked] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/book/locations")
      .then((r) => r.json())
      .then((data: LocationEntry[]) => setAllLocations(data))
      .catch(() => {});
  }, []);

  // Sync locked state whenever value or known locations change
  useEffect(() => {
    if (!allLocations.length) return;
    const isKnown =
      value.trim() !== "" &&
      allLocations.some(
        (l) => l.location.toLowerCase() === value.trim().toLowerCase(),
      );
    setLocked(isKnown);
  }, [value, allLocations]);

  const filtered = value.trim()
    ? allLocations.filter((l) =>
        l.location.toLowerCase().includes(value.toLowerCase()),
      )
    : allLocations;

  const exactMatch = allLocations.find(
    (l) => l.location.toLowerCase() === value.trim().toLowerCase(),
  );

  const hint =
    locked || value.trim() === ""
      ? null
      : exactMatch
        ? null // locked state handles this case
        : `Neuer Standort wird erstellt: „${value.trim()}"`;

  const handleSelect = (loc: LocationEntry) => {
    onChange(loc.location);
    setLocked(true);
    setOpen(false);
  };

  const handleUnlock = () => {
    onChange("");
    setLocked(false);
    setOpen(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>

      {locked ? (
        /* ── Locked tag ── */
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md
                       bg-primary/10 border border-primary/25 text-sm font-medium text-primary"
          >
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {value}
          </span>
          <button
            type="button"
            onClick={handleUnlock}
            aria-label="Standort zurücksetzen"
            className="flex items-center justify-center h-6 w-6 rounded-full
                       text-muted-foreground hover:text-destructive hover:bg-destructive/10
                       transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        /* ── Input mode ── */
        <>
          <div className="relative">
            <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              ref={inputRef}
              value={value}
              autoFocus={autoFocus}
              placeholder="z. B. Regal B-03"
              className="pl-8"
              onChange={(e) => {
                onChange(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setOpen(false);
              }}
            />
          </div>

          {hint && (
            <p className="text-xs text-warning leading-tight">{hint}</p>
          )}

          {open && filtered.length > 0 && (
            <ul
              className="absolute z-50 top-full mt-1 w-full rounded-md border border-border
                         bg-popover shadow-md overflow-hidden"
              role="listbox"
            >
              {filtered.map((loc) => (
                <li
                  key={loc.location}
                  role="option"
                  aria-selected={loc.location === value}
                  className="flex items-center justify-between px-3 py-2 text-sm
                             cursor-pointer hover:bg-muted select-none"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(loc);
                  }}
                >
                  <span>{loc.location}</span>
                  <span className="text-xs text-muted-foreground">
                    {loc.count} {loc.count === 1 ? "Buch" : "Bücher"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
