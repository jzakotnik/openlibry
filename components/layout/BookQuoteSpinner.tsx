// components/BookQuoteSpinner.tsx
import { useBookQuote } from "@/hooks/useBookQuote";
import { BookOpen } from "lucide-react";

export function BookQuoteSpinner() {
  const { quote, visible } = useBookQuote();

  return (
    <div className="flex flex-col items-center gap-6 py-8 px-4 max-w-md mx-auto text-center">
      <BookOpen className="text-primary animate-pulse w-10 h-10" />

      <div
        style={{ transition: "opacity 0.4s ease", opacity: visible ? 1 : 0 }}
        className="space-y-2 min-h-[80px] flex flex-col justify-center"
      >
        <p className="text-base italic text-foreground leading-relaxed">
          „{quote.text}"
        </p>
        <p className="text-sm text-muted-foreground">— {quote.author}</p>
      </div>

      <p className="text-xs text-muted-foreground animate-pulse">
        PDF wird erstellt, bitte warten…
      </p>
    </div>
  );
}
