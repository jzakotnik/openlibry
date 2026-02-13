import { Grid2x2, LayoutList, ListPlus, Plus, Search } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BookSearchBarProps {
  handleInputChange: React.ChangeEventHandler<
    HTMLTextAreaElement | HTMLInputElement
  >;
  handleNewBook: React.MouseEventHandler<HTMLButtonElement>;
  bookSearchInput: string;
  toggleView: React.MouseEventHandler<HTMLButtonElement>;
  detailView: boolean;
  searchResultNumber: number;
  showNewBookControl?: boolean;
}

export default function BookSearchBar({
  handleInputChange,
  handleNewBook,
  bookSearchInput,
  toggleView,
  detailView,
  searchResultNumber,
  showNewBookControl = true,
}: BookSearchBarProps) {
  return (
    <TooltipProvider>
      <div className="flex justify-center px-4 md:px-10 my-6">
        <div className="flex w-full max-w-xl items-center gap-2">
          {/* ── Search input ────────────────────────────────────── */}
          <form
            onSubmit={(e) => e.preventDefault()}
            className="relative flex flex-1 items-center"
          >
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={bookSearchInput}
              onChange={handleInputChange}
              placeholder="Buch suchen…"
              aria-label="search books"
              data-cy="rental_input_searchbook"
              className="h-10 w-full rounded-lg border border-border bg-card/90
                         pl-9 pr-3 text-sm text-foreground
                         placeholder:text-muted-foreground
                         backdrop-blur-xl
                         shadow-sm
                         transition-all duration-200
                         hover:border-primary/25 hover:shadow-md
                         focus:border-primary focus:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/20"
            />

            {/* Result count — inside the input, right-aligned */}
            {searchResultNumber > 0 && (
              <Badge
                variant="secondary"
                className="absolute right-2 text-[0.65rem] px-1.5 py-0 h-5 font-medium pointer-events-none"
              >
                {searchResultNumber}
              </Badge>
            )}
          </form>

          {/* ── Action buttons ──────────────────────────────────── */}
          <div className="flex items-center gap-1 shrink-0">
            {/* View toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={toggleView}
                  aria-label="Ansicht wechseln"
                  className="flex items-center justify-center
                             h-10 w-10 rounded-lg border border-border bg-card/90
                             text-muted-foreground
                             shadow-sm backdrop-blur-xl
                             transition-all duration-200
                             hover:border-primary/25 hover:text-primary hover:shadow-md
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                >
                  {detailView ? (
                    <LayoutList className="h-4 w-4" />
                  ) : (
                    <Grid2x2 className="h-4 w-4" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>Ansicht wechseln</TooltipContent>
            </Tooltip>

            {showNewBookControl && (
              <>
                {/* Vertical separator */}
                <div className="h-6 w-px bg-border mx-0.5" />

                {/* New book */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleNewBook}
                      aria-label="Neues Buch erzeugen"
                      data-cy="create_book_button"
                      className="flex items-center justify-center
                                 h-10 w-10 rounded-lg
                                 bg-primary text-primary-foreground
                                 shadow-sm
                                 transition-all duration-200
                                 hover:bg-primary/90 hover:shadow-md hover:scale-105
                                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Neues Buch erzeugen</TooltipContent>
                </Tooltip>

                {/* Batch scan */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="/book/batchscan"
                      aria-label="Viele Bücher importieren"
                      data-cy="batchscan_button"
                      className="flex items-center justify-center
                                 h-10 w-10 rounded-lg border border-border bg-card/90
                                 text-muted-foreground
                                 shadow-sm backdrop-blur-xl
                                 transition-all duration-200
                                 hover:border-primary/25 hover:text-primary hover:shadow-md
                                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                    >
                      <ListPlus className="h-4 w-4" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>Viele Bücher importieren</TooltipContent>
                </Tooltip>
              </>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
