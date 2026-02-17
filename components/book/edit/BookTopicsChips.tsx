import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { BookType } from "@/entities/BookType";
import { X } from "lucide-react";
import { Dispatch, useCallback, useMemo, useState } from "react";

type BookTopicsChipsProps = {
  fieldType: string;
  editable: boolean;
  setBookData: Dispatch<BookType>;
  book: BookType;
  topics: string[] | string | undefined | null;
};

function parseTopics(topics: string[] | string | undefined | null): string[] {
  if (Array.isArray(topics)) return topics;
  if (typeof topics === "string") {
    return topics
      .split(";")
      .map((t) => t.trim())
      .filter(Boolean);
  }
  return [];
}

const serializeTopics = (topics: string[]): string => topics.join(";");

export default function BookTopicsChips({
  fieldType,
  editable,
  setBookData,
  book,
  topics,
}: BookTopicsChipsProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const allOptions = useMemo(() => parseTopics(topics), [topics]);
  const currentBookTopics = useMemo(
    () => parseTopics(book.topics),
    [book.topics],
  );

  const filteredOptions = useMemo(() => {
    const query = inputValue.toLowerCase();
    return allOptions.filter(
      (opt) =>
        !currentBookTopics.includes(opt) &&
        (query === "" || opt.toLowerCase().includes(query)),
    );
  }, [allOptions, currentBookTopics, inputValue]);

  const addTopic = useCallback(
    (topic: string) => {
      const trimmed = topic.trim();
      if (!trimmed || currentBookTopics.includes(trimmed)) return;
      setBookData({
        ...book,
        [fieldType]: serializeTopics([...currentBookTopics, trimmed]),
      });
      setInputValue("");
    },
    [book, currentBookTopics, fieldType, setBookData],
  );

  const removeTopic = useCallback(
    (topic: string) => {
      if (!editable) return;
      setBookData({
        ...book,
        [fieldType]: serializeTopics(
          currentBookTopics.filter((t) => t !== topic),
        ),
      });
    },
    [book, currentBookTopics, editable, fieldType, setBookData],
  );

  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs text-muted-foreground">Schlagwörter</Label>

      {/* Chips */}
      <div className="flex flex-wrap gap-1.5 min-h-[2rem] items-start">
        {currentBookTopics.map((topic) => (
          <Badge
            key={topic}
            variant={editable ? "secondary" : "outline"}
            className="gap-1 pr-1"
          >
            {topic}
            {editable && (
              <button
                type="button"
                onClick={() => removeTopic(topic)}
                aria-label={`${topic} entfernen`}
                className="ml-0.5 rounded-sm opacity-60 hover:opacity-100 transition-opacity focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </Badge>
        ))}

        {/* Add button / combobox trigger */}
        {editable && (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-6 px-2 text-xs text-muted-foreground border-dashed"
              >
                + Schlagwort
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-56" align="start">
              <Command>
                <CommandInput
                  placeholder="Schlagwort suchen…"
                  value={inputValue}
                  onValueChange={setInputValue}
                />
                <CommandList>
                  <CommandEmpty>
                    {inputValue.trim() ? (
                      <button
                        className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-accent"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          addTopic(inputValue);
                          setOpen(false);
                        }}
                      >
                        „{inputValue}" hinzufügen
                      </button>
                    ) : (
                      <span className="text-muted-foreground px-3 py-2 text-sm">
                        Keine Optionen
                      </span>
                    )}
                  </CommandEmpty>
                  <CommandGroup>
                    {filteredOptions.slice(0, 20).map((opt) => (
                      <CommandItem
                        key={opt}
                        value={opt}
                        onSelect={(v) => {
                          addTopic(v);
                          setOpen(false);
                        }}
                      >
                        {opt}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
}
