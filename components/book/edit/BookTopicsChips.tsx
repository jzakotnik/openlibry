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
import { Loader2, Sparkles, X } from "lucide-react";
import { Dispatch, useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

type TagSuggestion = { tag: string; isNew: boolean };

type BookTopicsChipsProps = {
  fieldType: string;
  editable: boolean;
  setBookData: Dispatch<BookType>;
  book: BookType;
  topics: string[] | string | undefined | null;
  /** When true, render the AI "suggest tags" button (provider key configured). */
  aiTaggingEnabled?: boolean;
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
  aiTaggingEnabled = false,
}: BookTopicsChipsProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<TagSuggestion[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);

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

  // ── AI suggestions ─────────────────────────────────────────────────────────

  const handleSuggest = useCallback(async () => {
    setIsSuggesting(true);
    try {
      const res = await fetch("/api/book/suggestTags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          books: [
            {
              ref: "single",
              title: book.title,
              subtitle: book.subtitle,
              author: book.author,
              summary: book.summary,
              topics: book.topics,
              publisherName: book.publisherName,
              publisherDate: book.publisherDate,
              minAge: book.minAge,
              maxAge: book.maxAge,
            },
          ],
        }),
      });
      const data = await res.json();
      if (!res.ok || data.enabled === false) {
        toast.warning("Keine Vorschläge verfügbar");
        return;
      }
      const found: TagSuggestion[] = data.results?.[0]?.suggestions ?? [];
      // Drop anything already on the book.
      const fresh = found.filter((s) => !currentBookTopics.includes(s.tag));
      if (fresh.length === 0) {
        toast.info("Keine neuen Schlagwörter vorgeschlagen");
        return;
      }
      setSuggestions(fresh);
    } catch {
      toast.error("Fehler beim Erstellen der Vorschläge");
    } finally {
      setIsSuggesting(false);
    }
  }, [book, currentBookTopics]);

  const acceptSuggestion = useCallback(
    (tag: string) => {
      addTopic(tag);
      setSuggestions((prev) => prev.filter((s) => s.tag !== tag));
    },
    [addTopic],
  );

  const acceptAllSuggestions = useCallback(() => {
    const merged = [...currentBookTopics];
    for (const s of suggestions) {
      if (!merged.includes(s.tag)) merged.push(s.tag);
    }
    setBookData({ ...book, [fieldType]: serializeTopics(merged) });
    setSuggestions([]);
  }, [book, currentBookTopics, fieldType, setBookData, suggestions]);

  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs text-muted-foreground">Schlagwörter</Label>

      {/* Chips */}
      <div className="flex flex-wrap gap-1.5 min-h-[2rem] items-start">
        {currentBookTopics.map((topic) => (
          <Badge
            key={topic}
            variant={editable ? "secondary" : "outline"}
            className="gap-1 pr-1 max-w-[16rem]"
          >
            <span className="truncate">{topic}</span>
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

        {/* AI suggest trigger */}
        {editable && aiTaggingEnabled && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isSuggesting}
            onClick={handleSuggest}
            className="h-6 px-2 text-xs text-primary border-dashed gap-1"
          >
            {isSuggesting ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Sparkles className="w-3 h-3" />
            )}
            Vorschlagen
          </Button>
        )}
      </div>

      {/* Proposed tags — confirm before applying; new tags marked */}
      {editable && suggestions.length > 0 && (
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Vorschläge:</span>
          {suggestions.map((s) => (
            <button
              key={s.tag}
              type="button"
              onClick={() => acceptSuggestion(s.tag)}
              title={
                s.isNew ? "Neues Schlagwort übernehmen" : "Schlagwort übernehmen"
              }
              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs transition-colors hover:bg-accent ${
                s.isNew
                  ? "border border-dashed border-warning text-warning"
                  : "border border-border text-foreground"
              }`}
            >
              {s.isNew && <Sparkles className="w-3 h-3" />}
              {s.tag}
            </button>
          ))}
          <button
            type="button"
            onClick={acceptAllSuggestions}
            className="text-xs text-primary underline underline-offset-2 hover:text-primary/80"
          >
            Alle übernehmen
          </button>
        </div>
      )}
    </div>
  );
}
