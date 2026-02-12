import { Check, ChevronsUpDown } from "lucide-react";
import { useRouter } from "next/router";
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

type BookLabelCardProps = {
  title: string;
  subtitle: string;
  unit: string;
  link: string;
  startLabel: number;
  setStartLabel: any;
  startId: number;
  setStartId: any;
  endId: number;
  setEndId?: any;
  totalNumber: number;
  idFilter: number;
  setIdFilter: any;
  topicsFilter: TopicCount | null;
  setTopicsFilter: (value: TopicCount | null) => void;
  allTopics: TopicCount[];
};

export default function BookLabelCard({
  title,
  subtitle,
  link,
  startLabel,
  totalNumber,
  setStartLabel,
  idFilter,
  setIdFilter,
  startId,
  setStartId,
  endId,
  setEndId,
  topicsFilter,
  setTopicsFilter,
  allTopics,
}: BookLabelCardProps) {
  const router = useRouter();
  const [comboboxOpen, setComboboxOpen] = useState(false);

  const getBookUrl = () => {
    return (
      "/?" +
      (startLabel > 0 ? "start=0&end=" + Math.floor(startLabel!) : "") +
      (startId > 0 || endId > 0
        ? "&startId=" + startId + "&endId=" + endId
        : "") +
      (idFilter ? "&id=" + idFilter : "") +
      (topicsFilter ? "&topic=" + topicsFilter.topic : "")
    );
  };

  return (
    <Card
      className="overflow-hidden border-0 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.10),0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-200"
      data-cy="book-labels-card"
    >
      {/* Accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-info to-info/50" />

      <CardHeader className="pb-2">
        <CardTitle
          className="text-lg text-muted-foreground"
          data-cy="book-labels-title"
        >
          {title}
        </CardTitle>
        {subtitle && <CardDescription>{subtitle}</CardDescription>}
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Count filter */}
        <div className="space-y-1.5">
          <Label htmlFor="book-label-count">Anzahl (neueste) Etiketten</Label>
          <Input
            id="book-label-count"
            type="number"
            value={startLabel}
            onChange={(e) => setStartLabel(parseInt(e.target.value))}
            className={
              startLabel > totalNumber
                ? "border-destructive focus-visible:ring-destructive/20"
                : ""
            }
            data-cy="book-labels-count-input"
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
            <Label htmlFor="idRangeFrom">Von ID</Label>
            <Input
              id="idRangeFrom"
              type="number"
              value={startId}
              onChange={(e) => setStartId(parseInt(e.target.value))}
              data-cy="book-labels-start-id"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="idRangeTo">Bis ID</Label>
            <Input
              id="idRangeTo"
              type="number"
              value={endId}
              onChange={(e) => setEndId(parseInt(e.target.value))}
              data-cy="book-labels-end-id"
            />
          </div>
        </div>

        <Separator />

        {/* Single ID + Topic filter */}
        <p className="text-[0.6875rem] font-semibold text-muted-foreground uppercase tracking-wider">
          Filter
        </p>

        <div className="space-y-1.5">
          <Label htmlFor="book-label-single-id">Etikett für MedienID</Label>
          <Input
            id="book-label-single-id"
            type="number"
            value={idFilter}
            onChange={(e) => setIdFilter(parseInt(e.target.value))}
            data-cy="book-labels-id-filter"
          />
        </div>

        {/* Topic combobox — shadcn Popover + Command */}
        <div className="space-y-1.5">
          <Label>Schlagwort Filter</Label>
          <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={comboboxOpen}
                className="w-full justify-between font-normal"
                data-cy="book-labels-topic-filter"
              >
                {topicsFilter
                  ? `${topicsFilter.topic} (${topicsFilter.count})`
                  : "Schlagwort auswählen…"}
                <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
              <Command>
                <CommandInput placeholder="Suche Schlagwort…" />
                <CommandList>
                  <CommandEmpty>Kein Schlagwort gefunden.</CommandEmpty>
                  <CommandGroup>
                    {/* Clear option */}
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

      <CardFooter className="gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.open(link + getBookUrl(), "_blank")}
          className="text-primary hover:bg-primary/5 font-semibold"
          data-cy="book-labels-pdf-button"
        >
          Erzeuge PDF
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("reports/print" + getBookUrl())}
          className="text-muted-foreground hover:bg-muted font-semibold"
          data-cy="book-labels-skip-button"
        >
          Überspringe Label
        </Button>
      </CardFooter>
    </Card>
  );
}
