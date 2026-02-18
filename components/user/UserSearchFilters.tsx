import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Filter,
  GraduationCap,
  RotateCcw,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

interface UserSearchFiltersProps {
  grades: string[];
  onFilterChange: (filterString: string) => void;
}

export default function UserSearchFilters({
  grades,
  onFilterChange,
}: UserSearchFiltersProps) {
  const [isOverdue, setIsOverdue] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<string>("");

  useEffect(() => {
    const parts: string[] = [];
    if (isOverdue) parts.push("fällig?");
    if (selectedGrade) parts.push(`klasse?${selectedGrade}`);
    onFilterChange(parts.join(" "));
  }, [isOverdue, selectedGrade, onFilterChange]);

  const handleReset = () => {
    setIsOverdue(false);
    setSelectedGrade("");
  };

  const hasActiveFilters = isOverdue || selectedGrade !== "";

  const sortedGrades = [...grades].sort((a, b) => {
    const numA = parseInt(a);
    const numB = parseInt(b);
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    return a.localeCompare(b);
  });

  return (
    <TooltipProvider delayDuration={300}>
      <div>
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-primary" />
            <span className="text-sm font-semibold text-primary">Filter</span>
            {hasActiveFilters && (
              <Badge
                variant="secondary"
                className="h-[18px] bg-primary/15 px-1.5 text-[0.65rem] text-primary"
              >
                Aktiv
              </Badge>
            )}
          </div>

          {hasActiveFilters && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="h-6 gap-1.5 px-2 text-xs text-muted-foreground"
                >
                  <RotateCcw size={12} />
                  Zurücksetzen
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Filter zurücksetzen</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Filter Options */}
        <div className="flex flex-col gap-3 sm:flex-row">
          {/* Overdue Toggle */}
          <div className="flex-1">
            <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Status
            </Label>
            <Toggle
              pressed={isOverdue}
              onPressedChange={setIsOverdue}
              className={cn(
                "h-auto w-full justify-start gap-2 rounded-lg border px-3 py-2 text-sm font-medium",
                "data-[state=off]:bg-transparent data-[state=off]:border-primary/20 data-[state=off]:text-muted-foreground",
                "data-[state=on]:bg-warning/10 data-[state=on]:border-warning data-[state=on]:text-warning",
              )}
            >
              <AlertTriangle size={16} />
              Nur überfällige
            </Toggle>
          </div>

          {/* Grade Dropdown */}
          <div className="flex-1">
            <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Klasse
            </Label>
            <Select
              value={selectedGrade || "__all__"}
              onValueChange={(v) => setSelectedGrade(v === "__all__" ? "" : v)}
            >
              <SelectTrigger
                className={cn(
                  "rounded-lg",
                  selectedGrade
                    ? "border-primary bg-primary/5"
                    : "border-primary/20",
                )}
              >
                <div className="flex items-center gap-2">
                  <GraduationCap
                    size={16}
                    className={
                      selectedGrade
                        ? "text-primary"
                        : "text-muted-foreground/50"
                    }
                  />
                  <SelectValue placeholder="Alle Klassen" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">
                  <span className="text-muted-foreground">Alle Klassen</span>
                </SelectItem>
                {sortedGrades.map((grade) => (
                  <SelectItem key={grade} value={grade}>
                    Klasse {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {isOverdue && (
              <Badge
                variant="secondary"
                className="gap-1 bg-warning/10 pr-1 text-warning"
              >
                Überfällig
                <button
                  type="button"
                  onClick={() => setIsOverdue(false)}
                  className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-black/10"
                >
                  <X size={12} />
                </button>
              </Badge>
            )}
            {selectedGrade && selectedGrade !== "__all__" && (
              <Badge
                variant="secondary"
                className="gap-1 bg-primary/10 pr-1 text-primary"
              >
                Klasse {selectedGrade}
                <button
                  type="button"
                  onClick={() => setSelectedGrade("")}
                  className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-black/10"
                >
                  <X size={12} />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
