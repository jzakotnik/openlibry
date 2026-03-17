/**
 * Book filter controls for selecting which books to print labels for.
 *
 * Supports: latest N books, by topic, all books, or explicit IDs.
 */

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { BookFilter } from "@/lib/labels/types";

interface BookFilterFormProps {
  filter: BookFilter;
  onChange: (filter: BookFilter) => void;
}

export default function BookFilterForm({
  filter,
  onChange,
}: BookFilterFormProps) {
  return (
    <div className="space-y-3">
      <Label>Bücher auswählen</Label>
      <RadioGroup
        value={filter.type}
        onValueChange={(type) => {
          const newFilter: BookFilter = { type: type as BookFilter["type"] };
          if (type === "latest") newFilter.count = filter.count ?? 24;
          if (type === "topic") newFilter.value = filter.value ?? "";
          if (type === "ids") newFilter.ids = filter.ids ?? [];
          onChange(newFilter);
        }}
        data-cy="book-filter-radio"
      >
        {/* Latest N */}
        <div className="flex items-center gap-3">
          <RadioGroupItem value="latest" id="filter-latest" />
          <Label htmlFor="filter-latest" className="font-normal">
            Neueste
          </Label>
          <Input
            type="number"
            min={1}
            className="w-20 h-8"
            value={filter.type === "latest" ? (filter.count ?? 24) : 24}
            onChange={(e) =>
              onChange({
                type: "latest",
                count: parseInt(e.target.value) || 1,
              })
            }
            disabled={filter.type !== "latest"}
            data-cy="filter-latest-count"
          />
          <span className="text-sm text-muted-foreground">Bücher</span>
        </div>

        {/* By topic */}
        <div className="flex items-center gap-3">
          <RadioGroupItem value="topic" id="filter-topic" />
          <Label htmlFor="filter-topic" className="font-normal">
            Thema
          </Label>
          <Input
            type="text"
            className="flex-1 h-8"
            placeholder="z.B. Abenteuer"
            value={filter.type === "topic" ? (filter.value ?? "") : ""}
            onChange={(e) =>
              onChange({ type: "topic", value: e.target.value })
            }
            disabled={filter.type !== "topic"}
            data-cy="filter-topic-input"
          />
        </div>

        {/* All books */}
        <div className="flex items-center gap-3">
          <RadioGroupItem value="all" id="filter-all" />
          <Label htmlFor="filter-all" className="font-normal">
            Alle Bücher
          </Label>
        </div>

        {/* Explicit IDs */}
        <div className="flex items-center gap-3">
          <RadioGroupItem value="ids" id="filter-ids" />
          <Label htmlFor="filter-ids" className="font-normal">
            Buch-IDs
          </Label>
          <Input
            type="text"
            className="flex-1 h-8"
            placeholder="z.B. 1, 5, 12, 42"
            value={
              filter.type === "ids"
                ? (filter.ids ?? []).join(", ")
                : ""
            }
            onChange={(e) => {
              const ids = e.target.value
                .split(",")
                .map((s) => parseInt(s.trim()))
                .filter((n) => !isNaN(n));
              onChange({ type: "ids", ids });
            }}
            disabled={filter.type !== "ids"}
            data-cy="filter-ids-input"
          />
        </div>
      </RadioGroup>
    </div>
  );
}
