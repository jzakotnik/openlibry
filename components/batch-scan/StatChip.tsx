import { Badge } from "@/components/ui/badge";

const styles = {
  default: "border-gray-200 text-gray-600",
  success: "border-emerald-200 text-emerald-700",
  warning: "border-amber-200 text-amber-700",
  info: "border-blue-200 text-blue-700",
};

export function StatChip({
  icon: Icon,
  label,
  variant = "default",
}: {
  icon?: React.ElementType;
  label: string;
  variant?: "default" | "success" | "warning" | "info";
}) {
  return (
    <Badge variant="outline" className={styles[variant]}>
      {Icon && <Icon className="size-3" />}
      {label}
    </Badge>
  );
}
