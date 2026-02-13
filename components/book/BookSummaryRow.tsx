import { CheckCircle, Copy, XCircle } from "lucide-react";
import { useRouter } from "next/router";
import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BookType } from "@/entities/BookType";
const MAX_TOPICS_LENGTH = 10;
interface BookSummaryRowPropType {
  book: BookType;
  handleCopyBook: React.MouseEventHandler<HTMLButtonElement>;
}

export default function BookSummaryRow({
  book,
  handleCopyBook,
}: BookSummaryRowPropType) {
  const router = useRouter();

  const topics = useMemo(
    () =>
      (book.topics ?? "")
        .split(";")
        .map((t) => t.trim().substring(0, MAX_TOPICS_LENGTH))
        .filter(Boolean),
    [book.topics],
  );

  const maxChips = 4;
  const extraCount = Math.max(0, topics.length - maxChips);
  const visibleTopics = topics.slice(0, maxChips);

  const isRented = book.rentalStatus === "rented";

  return (
    <div
      className="w-full rounded-lg border border-border bg-card px-4 py-3 my-2
                 shadow-sm transition-all duration-150
                 hover:shadow-md hover:-translate-y-0.5 hover:cursor-pointer"
      onClick={() => router.push(`/book/${book.id}`)}
      role="button"
      aria-label={`Open book ${book.title}`}
      data-cy={`book_summary_row_${book.id}`}
    >
      <div className="flex flex-row items-center gap-3 flex-wrap">
        {/* Status avatar */}
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white ${
            isRented ? "bg-destructive" : "bg-success"
          }`}
          data-cy={`book_status_${book.id}`}
        >
          {isRented ? (
            <XCircle className="h-5 w-5" />
          ) : (
            <CheckCircle className="h-5 w-5" />
          )}
        </div>

        {/* Title + subtitle + author (grows) */}
        <div className="min-w-0 flex-1">
          <p
            className="truncate text-sm font-semibold leading-tight text-foreground"
            title={book.title}
            data-cy={`book_title_${book.id}`}
          >
            {book.title || "Untitled"}
          </p>
          {book.subtitle && (
            <p
              className="truncate text-xs text-muted-foreground leading-tight mt-0.5"
              title={book.subtitle}
              data-cy={`book_subtitle_${book.id}`}
            >
              {book.subtitle}
            </p>
          )}
          <p
            className="truncate text-xs text-muted-foreground mt-0.5"
            title={book.author || ""}
            data-cy={`book_author_${book.id}`}
          >
            {book.author}
          </p>
        </div>

        {/* Topics */}
        <div className="flex flex-row flex-wrap items-center gap-1 max-w-full md:max-w-[60%]">
          {visibleTopics.map((t) => (
            <Badge key={t} variant="secondary" className="text-xs">
              {t}
            </Badge>
          ))}
          {extraCount > 0 && (
            <Badge variant="outline" className="text-xs font-medium">
              +{extraCount}
            </Badge>
          )}
        </div>

        {/* Actions (don't trigger row click) */}
        <div
          className="ml-auto flex items-center"
          onClick={(e) => e.stopPropagation()}
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md
                             text-primary hover:bg-primary/10 transition-colors"
                  aria-label="copy-book"
                  onClick={handleCopyBook}
                  data-cy={`book_copy_button_${book.id}`}
                >
                  <Copy className="h-5 w-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Buch duplizieren</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}
