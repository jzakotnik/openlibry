/**
 * Book filter controls for selecting which books to print labels for.
 *
 * Supports: latest N books, by topic, all books, or explicit IDs.
 */

import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { BookFilter } from "@/lib/labels/types";
import { cn } from "@/lib/utils";

interface BookFilterFormProps {
  filter: BookFilter;
  onChange: (filter: BookFilter) => void;
  /** Distinct topic strings loaded from the database. */
  topics: string[];
}

export default function BookFilterForm({
  filter,
  onChange,
  topics,
}: BookFilterFormProps) {
  const [topicOpen, setTopicOpen] = useState(false);

  const currentTopic = filter.type === "topic" ? (filter.value ?? "") : "";

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
          <Label htmlFor="filter-topic" className="font-normal shrink-0">
            Thema
          </Label>
          <Popover open={topicOpen} onOpenChange={setTopicOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={topicOpen}
                className="flex-1 h-8 justify-between font-normal"
                disabled={filter.type !== "topic"}
                data-cy="filter-topic-combobox"
              >
                <span className="truncate">
                  {currentTopic || (
                    <span className="text-muted-foreground">
                      Thema auswählen…
                    </span>
                  )}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-56" align="start">
              <Command>
                <CommandInput placeholder="Thema suchen…" />
                <CommandList>
                  <CommandEmpty>Kein Thema gefunden.</CommandEmpty>
                  <CommandGroup>
                    {topics.map((topic) => (
                      <CommandItem
                        key={topic}
                        value={topic}
                        onSelect={(selected) => {
                          onChange({ type: "topic", value: selected });
                          setTopicOpen(false);
                        }}
                        data-cy={`filter-topic-option-${topic}`}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            currentTopic === topic
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        {topic}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
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
            value={filter.type === "ids" ? (filter.ids ?? []).join(", ") : ""}
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
