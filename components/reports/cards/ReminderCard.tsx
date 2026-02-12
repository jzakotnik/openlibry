import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export type ReminderMode = "all" | "non-extendable";

type ReminderCardProps = {
  title: string;
  subtitle: string;
  link: string;
  overdueCount: number;
  nonExtendableCount: number;
};

export default function ReminderCard({
  title,
  subtitle,
  link,
  overdueCount,
  nonExtendableCount,
}: ReminderCardProps) {
  const [mode, setMode] = useState<ReminderMode>("all");

  const getReminderUrl = () => {
    return `${link}?mode=${mode}`;
  };

  const currentCount = mode === "all" ? overdueCount : nonExtendableCount;

  const handleGenerateClick = () => {
    if (currentCount === 0) {
      const message =
        mode === "all"
          ? "Keine überfälligen Ausleihen vorhanden."
          : "Keine nicht verlängerbaren überfälligen Ausleihen vorhanden.";
      toast.info(message);
      return;
    }
    window.open(getReminderUrl(), "_blank");
  };

  return (
    <Card
      className="overflow-hidden border-0 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.10),0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-200"
      data-cy="reminder-card"
    >
      {/* Accent bar — destructive/error */}
      <div className="h-1 w-full bg-gradient-to-r from-destructive to-destructive/50" />

      <CardHeader className="pb-2">
        <CardTitle
          className="text-lg text-muted-foreground"
          data-cy="reminder-card-title"
        >
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Metric */}
        <div className="flex items-baseline gap-2 mb-2">
          <span
            className={`text-3xl font-bold leading-tight ${
              currentCount > 0 ? "text-destructive" : "text-success"
            }`}
            data-cy="reminder-card-count"
          >
            {currentCount}
          </span>
          <span className="text-sm font-medium text-disabled">
            {currentCount === 1 ? "Mahnung" : "Mahnungen"}
          </span>
        </div>

        {/* Mode toggle */}
        <ToggleGroup
          type="single"
          value={mode}
          onValueChange={(value) => {
            if (value) setMode(value as ReminderMode);
          }}
          className="justify-start"
          data-cy="reminder-mode-toggle"
        >
          <ToggleGroupItem
            value="all"
            size="sm"
            className="text-xs px-3 rounded-lg data-[state=on]:bg-primary/10 data-[state=on]:text-primary data-[state=on]:font-semibold"
            data-cy="reminder-mode-all"
          >
            Alle Mahnungen
          </ToggleGroupItem>
          <ToggleGroupItem
            value="non-extendable"
            size="sm"
            className="text-xs px-3 rounded-lg data-[state=on]:bg-primary/10 data-[state=on]:text-primary data-[state=on]:font-semibold"
            data-cy="reminder-mode-non-extendable"
          >
            Nur nicht verlängerbare
          </ToggleGroupItem>
        </ToggleGroup>

        <p
          className="text-sm text-disabled leading-relaxed"
          data-cy="reminder-card-subtitle"
        >
          {subtitle}
        </p>
      </CardContent>

      <CardFooter>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleGenerateClick}
          className="text-primary hover:bg-primary/5 font-semibold"
          data-cy="reminder-card-button"
        >
          Erzeuge Word
        </Button>
      </CardFooter>
    </Card>
  );
}
