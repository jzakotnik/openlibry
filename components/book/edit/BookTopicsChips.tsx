import { BookType } from "@/entities/BookType";
import { X } from "lucide-react";
import { Dispatch, useCallback, useMemo, useRef, useState } from "react";

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
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const allOptions = useMemo(() => parseTopics(topics), [topics]);
  const currentBookTopics = useMemo(
    () => parseTopics(book.topics),
    [book.topics],
  );

  // Filter options: match input, exclude already-selected
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
      const next = [...currentBookTopics, trimmed];
      setBookData({ ...book, [fieldType]: serializeTopics(next) });
      setInputValue("");
      setHighlightedIndex(-1);
      inputRef.current?.focus();
    },
    [book, currentBookTopics, fieldType, setBookData],
  );

  const removeTopic = useCallback(
    (topic: string) => {
      if (!editable) return;
      const next = currentBookTopics.filter((t) => t !== topic);
      setBookData({ ...book, [fieldType]: serializeTopics(next) });
    },
    [book, currentBookTopics, editable, fieldType, setBookData],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) =>
        Math.min(i + 1, filteredOptions.length - 1),
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
        addTopic(filteredOptions[highlightedIndex]);
      } else if (inputValue.trim()) {
        // Allow free-form entry
        addTopic(inputValue);
      }
    } else if (
      e.key === "Backspace" &&
      inputValue === "" &&
      currentBookTopics.length > 0
    ) {
      // Remove last chip on backspace with empty input
      removeTopic(currentBookTopics[currentBookTopics.length - 1]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  return (
    <div className="relative pt-4">
      <label className="absolute top-0 left-0 text-xs font-medium text-gray-500 select-none">
        Schlagwörter
      </label>

      {/* Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          disabled={!editable}
          placeholder={
            currentBookTopics.length === 0 ? "Schlagwörter eingeben…" : ""
          }
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => {
            // Delay close so click on option registers
            setTimeout(() => setIsOpen(false), 150);
          }}
          onKeyDown={handleKeyDown}
          className={[
            "w-full bg-transparent text-sm text-gray-900 placeholder-gray-400",
            "border-0 border-b border-gray-300",
            "focus:border-b-2 focus:outline-none transition-colors duration-150",
            "py-1.5 px-0",
            !editable && "text-gray-500 cursor-not-allowed border-gray-200",
          ]
            .filter(Boolean)
            .join(" ")}
        />

        {/* Dropdown */}
        {isOpen && editable && filteredOptions.length > 0 && (
          <ul className="absolute z-20 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {filteredOptions.slice(0, 20).map((opt, idx) => (
              <li
                key={opt}
                onMouseDown={(e) => {
                  e.preventDefault(); // prevent input blur
                  addTopic(opt);
                }}
                onMouseEnter={() => setHighlightedIndex(idx)}
                className={[
                  "px-3 py-1.5 text-sm cursor-pointer transition-colors",
                  idx === highlightedIndex
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-50",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {opt}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Chips */}
      {currentBookTopics.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {currentBookTopics.map((topic) => (
            <span
              key={topic}
              className={[
                "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium",
                editable
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "bg-gray-100 text-gray-600 border border-gray-200",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {topic}
              {editable && (
                <button
                  type="button"
                  onClick={() => removeTopic(topic)}
                  className="ml-0.5 text-blue-400 hover:text-blue-700 transition-colors"
                  aria-label={`${topic} entfernen`}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
