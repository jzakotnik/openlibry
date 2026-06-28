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
import type { TagSource } from "@/lib/ai-tagging/types";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  BookMarked,
  BookOpen,
  Globe,
  Landmark,
  Loader2,
  Sparkles,
  X,
} from "lucide-react";
import { Dispatch, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

type TagSuggestion = {
  tag: string;
  isNew: boolean;
  source?: TagSource;
  offStyle?: boolean;
};

/** Per-source icon + tooltip for tag provenance (shown next to a chip). */
const SOURCE_META: Record<TagSource, { Icon: typeof Landmark; label: string }> = {
  dnb: { Icon: Landmark, label: t("aiTagging.sourceDnb") },
  openlibrary: { Icon: BookOpen, label: t("aiTagging.sourceOpenlibrary") },
  wikidata: { Icon: Globe, label: t("aiTagging.sourceWikidata") },
  library: { Icon: BookMarked, label: t("aiTagging.sourceLibrary") },
  ai: { Icon: Sparkles, label: t("aiTagging.sourceAi") },
};

type BookTopicsChipsProps = {
  fieldType: string;
  editable: boolean;
  setBookData: Dispatch<BookType>;
  book: BookType;
  topics: string[] | string | undefined | null;
  /** When true, render the AI "suggest tags" button (provider key configured). */
  aiTaggingEnabled?: boolean;
  /** When true (new-book form), auto-suggest tags once after an ISBN autofill
   *  completes and the field is still empty. */
  autoSuggest?: boolean;
  /** Drives the auto-suggest trigger: a true→false transition means an autofill
   *  just finished. */
  isAutoFilling?: boolean;
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

// Chip appearance by status. Base layout is shared; only the colour scheme
// differs — off-style (muted, dashed: review me), new-to-library (info/blue),
// or part of the existing vocabulary (success/green).
const CHIP_BASE = "gap-1 pr-1 max-w-64";
const CHIP_VARIANT = {
  offStyle:
    "bg-muted/40 text-muted-foreground border-dashed border-muted-foreground/40",
  new: "bg-info/10 text-info border-info/40",
  existing: "bg-success/10 text-success border-success/40",
} as const;

export default function BookTopicsChips({
  fieldType,
  editable,
  setBookData,
  book,
  topics,
  aiTaggingEnabled = false,
  autoSuggest = false,
  isAutoFilling = false,
}: BookTopicsChipsProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isSuggesting, setIsSuggesting] = useState(false);
  // Provenance of suggested tags, keyed by lowercased tag. Ephemeral (most
  // useful right after suggesting) — not persisted, since topics is a flat string.
  const [tagSources, setTagSources] = useState<Record<string, TagSource>>({});
  // Off-style suggestions (keyed by lowercased tag): kept but visually muted so
  // staff notice them for review. Ephemeral, like tagSources.
  const [offStyleTags, setOffStyleTags] = useState<Record<string, boolean>>({});

  const allOptions = useMemo(() => parseTopics(topics), [topics]);
  // Library-wide vocabulary, lowercased, for "is this tag already established?"
  // checks. A topic not in here is new to the library (shown blue/info); one in
  // here is part of the existing controlled vocabulary (shown green/success).
  const knownTopics = useMemo(
    () => new Set(allOptions.map((t) => t.toLowerCase())),
    [allOptions],
  );
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
      // Drop the provenance/off-style flags too — otherwise these maps grow
      // unbounded, and a later tag with the same lowercased spelling would
      // inherit the removed tag's icon or muted styling.
      const key = topic.toLowerCase();
      setTagSources((prev) => {
        if (!(key in prev)) return prev;
        const { [key]: _, ...rest } = prev;
        return rest;
      });
      setOffStyleTags((prev) => {
        if (!(key in prev)) return prev;
        const { [key]: _, ...rest } = prev;
        return rest;
      });
    },
    [book, currentBookTopics, editable, fieldType, setBookData],
  );

  // ── AI suggestions ─────────────────────────────────────────────────────────

  // Suggestions land directly in the field as chips (new ones render blue);
  // staff removes any that don't fit. The review-before-save IS the confirm
  // step. `silent` suppresses the "nothing found" toasts for auto-triggered runs.
  const handleSuggest = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      setIsSuggesting(true);
      try {
        const res = await fetch("/api/book/suggestTags", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            books: [
              {
                ref: "single",
                isbn: book.isbn,
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
          if (!silent) toast.warning(t("aiTagging.toastNoSuggestions"));
          return;
        }
        const found: TagSuggestion[] = data.results?.[0]?.suggestions ?? [];
        const merged = [...currentBookTopics];
        const sourceUpdate: Record<string, TagSource> = {};
        const offStyleUpdate: Record<string, boolean> = {};
        let added = 0;
        for (const s of found) {
          if (s.source) sourceUpdate[s.tag.toLowerCase()] = s.source;
          if (s.offStyle) offStyleUpdate[s.tag.toLowerCase()] = true;
          if (!merged.includes(s.tag)) {
            merged.push(s.tag);
            added++;
          }
        }
        if (added === 0) {
          if (!silent) toast.info(t("aiTagging.toastNoNewTags"));
          return;
        }
        setTagSources((prev) => ({ ...prev, ...sourceUpdate }));
        setOffStyleTags((prev) => ({ ...prev, ...offStyleUpdate }));
        setBookData({ ...book, [fieldType]: serializeTopics(merged) });
        toast.success(
          added === 1
            ? t("aiTagging.toastTagAddedOne", { count: added })
            : t("aiTagging.toastTagsAddedMany", { count: added }),
        );
      } catch {
        if (!silent) toast.error(t("aiTagging.toastSuggestError"));
      } finally {
        setIsSuggesting(false);
      }
    },
    [book, currentBookTopics, fieldType, setBookData],
  );

  // Auto-suggest once after an ISBN autofill finishes, when the field is still
  // empty. Fires on the autofill true→false transition so it tracks the lookup,
  // not arbitrary re-renders; guarded so it runs at most once per mount.
  const wasAutoFilling = useRef(false);
  const autoSuggestedRef = useRef(false);
  useEffect(() => {
    const justStarted = !wasAutoFilling.current && isAutoFilling;
    const justFinished = wasAutoFilling.current && !isAutoFilling;
    wasAutoFilling.current = isAutoFilling;
    // A fresh autofill re-arms the one-shot guard so a second lookup on the same
    // form also gets auto-suggested.
    if (justStarted) autoSuggestedRef.current = false;
    if (
      autoSuggest &&
      aiTaggingEnabled &&
      justFinished &&
      !autoSuggestedRef.current &&
      currentBookTopics.length === 0 &&
      !!book.title
    ) {
      autoSuggestedRef.current = true;
      void handleSuggest({ silent: true });
    }
  }, [
    isAutoFilling,
    autoSuggest,
    aiTaggingEnabled,
    currentBookTopics.length,
    book.title,
    handleSuggest,
  ]);

  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs text-muted-foreground">
        {t("aiTagging.label")}
      </Label>

      {/* Chips — green: already in the library vocabulary; blue: new to it */}
      <div className="flex flex-wrap gap-1.5 min-h-8 items-start">
        {currentBookTopics.map((topic) => {
          const isNew = !knownTopics.has(topic.toLowerCase());
          const isOffStyle = isNew && offStyleTags[topic.toLowerCase()];
          const meta = SOURCE_META[tagSources[topic.toLowerCase()] as TagSource];
          return (
            <Badge
              key={topic}
              variant="outline"
              title={
                isOffStyle
                  ? t("aiTagging.chipOffStyleTitle")
                  : isNew
                    ? t("aiTagging.chipNewTitle")
                    : t("aiTagging.chipExistingTitle")
              }
              className={cn(
                CHIP_BASE,
                isOffStyle
                  ? CHIP_VARIANT.offStyle
                  : isNew
                    ? CHIP_VARIANT.new
                    : CHIP_VARIANT.existing,
              )}
            >
              {meta && (
                <span
                  title={meta.label}
                  className="inline-flex items-center opacity-70"
                >
                  <meta.Icon className="w-3 h-3" />
                </span>
              )}
              <span className="truncate">{topic}</span>
              {editable && (
                <button
                  type="button"
                  onClick={() => removeTopic(topic)}
                  aria-label={t("aiTagging.removeAria", { tag: topic })}
                  className="ml-0.5 rounded-sm opacity-60 hover:opacity-100 transition-opacity focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </Badge>
          );
        })}

        {/* Add button / combobox trigger */}
        {editable && (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-6 px-2 text-xs text-muted-foreground border-dashed"
              >
                {t("aiTagging.addTag")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-56" align="start">
              <Command>
                <CommandInput
                  placeholder={t("aiTagging.searchPlaceholder")}
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
                        {t("aiTagging.addNamed", { tag: inputValue })}
                      </button>
                    ) : (
                      <span className="text-muted-foreground px-3 py-2 text-sm">
                        {t("aiTagging.noOptions")}
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
            onClick={() => handleSuggest()}
            className="h-6 px-2 text-xs text-primary border-dashed gap-1"
          >
            {isSuggesting ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Sparkles className="w-3 h-3" />
            )}
            {t("aiTagging.suggest")}
          </Button>
        )}
      </div>
    </div>
  );
}
