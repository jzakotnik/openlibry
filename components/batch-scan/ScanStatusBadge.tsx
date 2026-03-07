import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  CheckCircle,
  Edit,
  Loader2,
  XCircle,
} from "lucide-react";
import { ScanStatus } from "./types";

const statusConfig = {
  found: {
    icon: CheckCircle,
    label: "Gefunden",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  edited: {
    icon: Edit,
    label: "Bearbeitet",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  not_found: {
    icon: AlertTriangle,
    label: "Nicht gefunden",
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
  error: {
    icon: XCircle,
    label: "Fehler",
    className: "bg-red-100 text-red-700 border-red-200",
  },
  loading: {
    icon: Loader2,
    label: "Suche…",
    className: "bg-gray-100 text-gray-500 border-gray-200",
  },
};

export function ScanStatusBadge({ status }: { status: ScanStatus }) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={config.className}>
      <Icon
        className={`size-3 ${status === "loading" ? "animate-spin" : ""}`}
      />
      {config.label}
    </Badge>
  );
}
