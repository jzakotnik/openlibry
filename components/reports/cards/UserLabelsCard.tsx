import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { type TopicCount } from "./cardConstants";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";

type UserLabelsCardProps = {
  title: string;
  subtitle: string;
  link: string;
  startLabel: number;
  setStartLabel: (value: number) => void;
  totalNumber: number;
  startUserId: number;
  setStartUserId: (value: number) => void;
  endUserId: number;
  setEndUserId: (value: number) => void;
  idUserFilter: number;
  setIdUserFilter: (value: number) => void;
  topicsFilter: TopicCount | null;
  setTopicsFilter: (value: TopicCount | null) => void;
  allTopics: TopicCount[];
};

export default function UserLabelsCard({
  title,
  subtitle,
  link,
  startLabel,
  totalNumber,
  setStartLabel,
  idUserFilter,
  setIdUserFilter,
  startUserId,
  setStartUserId,
  endUserId,
  setEndUserId,
  topicsFilter,
  setTopicsFilter,
  allTopics,
}: UserLabelsCardProps) {
  const [comboboxOpen, setComboboxOpen] = useState(false);

  const getUserUrl = () => {
    return (
      "/?" +
      (startLabel > 0 ? "start=0" + "&end=" + Math.floor(startLabel) : "") +
      (startUserId > 0 || endUserId > 0
        ? "&startId=" + startUserId + "&endId=" + endUserId
        : "") +
      (idUserFilter > 0 ? "&id=" + idUserFilter : "") +
      (topicsFilter ? "&schoolGrade=" + topicsFilter.topic : "")
    );
  };

  return (
    <Card
      className="overflow-hidden border-0 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.10),0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-200"
      data-cy="user-labels-card"
    >
      {/* Accent bar — secondary */}
      <div className="h-1 w-full bg-gradient-to-r from-secondary to-secondary/50" />

      <CardHeader className="pb-2">
        <CardTitle
          className="text-lg text-muted-foreground"
          data-cy="user-labels-title"
        >
          {title}
        </CardTitle>
        {subtitle && <CardDescription>{subtitle}</CardDescription>}
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Count */}
        <div className="space-y-1.5">
          <Label htmlFor="user-label-count">Anzahl Etiketten</Label>
          <Input
            id="user-label-count"
            type="number"
            value={startLabel}
            onChange={(e) => setStartLabel(parseInt(e.target.value))}
            className={
              startLabel > totalNumber
                ? "border-destructive focus-visible:ring-destructive/20"
                : ""
            }
            data-cy="user-labels-count-input"
          />
          {startLabel > totalNumber && (
            <p className="text-xs text-destructive">So viele gibt es nicht?</p>
          )}
        </div>

        <Separator />

        {/* ID Range */}
        <p className="text-[0.6875rem] font-semibold text-muted-foreground uppercase tracking-wider">
          ID-Bereich
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="idUserRangeFrom">Von ID</Label>
            <Input
              id="idUserRangeFrom"
              type="number"
              value={startUserId}
              onChange={(e) => setStartUserId(parseInt(e.target.value))}
              data-cy="user-labels-start-id"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="idUserRangeTo">Bis ID</Label>
            <Input
              id="idUserRangeTo"
              type="number"
              value={endUserId}
              onChange={(e) => setEndUserId(parseInt(e.target.value))}
              data-cy="user-labels-end-id"
            />
          </div>
        </div>

        <Separator />

        {/* Filters */}
        <p className="text-[0.6875rem] font-semibold text-muted-foreground uppercase tracking-wider">
          Filter
        </p>

        <div className="space-y-1.5">
          <Label htmlFor="user-label-single-id">Etikett für UserID</Label>
          <Input
            id="user-label-single-id"
            type="number"
            value={idUserFilter}
            onChange={(e) => setIdUserFilter(parseInt(e.target.value))}
            data-cy="user-labels-user-id-filter"
          />
        </div>

        {/* School grade combobox */}
        <div className="space-y-1.5">
          <Label>Klassen Filter</Label>
          <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={comboboxOpen}
                className="w-full justify-between font-normal"
                data-cy="user-labels-schoolgrade-filter"
              >
                {topicsFilter
                  ? `${topicsFilter.topic} (${topicsFilter.count})`
                  : "Klasse auswählen…"}
                <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
              <Command>
                <CommandInput placeholder="Suche Klasse…" />
                <CommandList>
                  <CommandEmpty>Keine Klasse gefunden.</CommandEmpty>
                  <CommandGroup>
                    {topicsFilter && (
                      <CommandItem
                        value="__clear__"
                        onSelect={() => {
                          setTopicsFilter(null);
                          setComboboxOpen(false);
                        }}
                        className="text-muted-foreground italic"
                      >
                        Filter zurücksetzen
                      </CommandItem>
                    )}
                    {allTopics.map((option) => (
                      <CommandItem
                        key={option.topic}
                        value={option.topic}
                        onSelect={() => {
                          setTopicsFilter(option);
                          setComboboxOpen(false);
                        }}
                      >
                        <Check
                          className={`mr-2 size-4 ${
                            topicsFilter?.topic === option.topic
                              ? "opacity-100"
                              : "opacity-0"
                          }`}
                        />
                        {option.topic}
                        <span className="ml-auto text-muted-foreground">
                          {option.count}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.open(link + getUserUrl(), "_blank")}
          className="text-primary hover:bg-primary/5 font-semibold"
          data-cy="user-labels-generate-button"
        >
          Erzeuge PDF
        </Button>
      </CardFooter>
    </Card>
  );
}
