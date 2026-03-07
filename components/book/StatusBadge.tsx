import { translations } from "@/entities/fieldTranslations";
import { memo } from "react";

// =============================================================================
// Types & Config
// =============================================================================

export type RentalStatus = keyof typeof translations.rentalStatus;

const STATUS_STYLE: Record<RentalStatus, { bgClass: string; pulse: boolean }> =
  {
    available: { bgClass: "bg-success/90", pulse: true },
    rented: { bgClass: "bg-destructive/90", pulse: false },
    lost: { bgClass: "bg-orange-500/90", pulse: false },
    broken: { bgClass: "bg-yellow-500/90", pulse: false },
    presentation: { bgClass: "bg-blue-500/90", pulse: false },
    ordered: { bgClass: "bg-purple-500/90", pulse: false },
    remote: { bgClass: "bg-slate-500/90", pulse: false },
  };

const FALLBACK_STYLE = STATUS_STYLE.available;

// =============================================================================
// Component
// =============================================================================

interface StatusBadgeProps {
  rentalStatus: string | undefined | null;
}

const StatusBadge = memo(function StatusBadge({
  rentalStatus,
}: StatusBadgeProps) {
  const key = rentalStatus as RentalStatus;
  const style = STATUS_STYLE[key] ?? FALLBACK_STYLE;
  const label = translations.rentalStatus[key] ?? rentalStatus ?? "Unbekannt";

  return (
    <div
      className={`absolute top-2.5 left-2.5 z-[4] flex items-center gap-1.5
                  px-2 py-1 rounded-full backdrop-blur-lg shadow-[0_2px_8px_rgba(0,0,0,0.2)]
                  ${style.bgClass}`}
      role="status"
      aria-label={label}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full bg-white ${style.pulse ? "animate-pulse" : ""}`}
      />
      <span className="text-[0.65rem] font-semibold text-white uppercase tracking-wide">
        {label}
      </span>
    </div>
  );
});

export default StatusBadge;
