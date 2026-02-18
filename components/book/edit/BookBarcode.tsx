import { Card, CardContent } from "@/components/ui/card";
import { BookType } from "@/entities/BookType";
import Barcode from "react-barcode";

interface BookBarcodeProps {
  book: BookType;
}

export default function BookBarcode({ book }: BookBarcodeProps) {
  return (
    <Card className="mt-6 text-center">
      <CardContent className="px-3 py-4">
        <p className="text-xs text-muted-foreground mb-2 truncate">
          {book.title.substring(0, 30)}…
        </p>
        <Barcode
          value={book.id!.toString()}
          height={90}
          width={2.0}
          fontOptions="400"
          textMargin={4}
          margin={2}
        />
      </CardContent>
    </Card>
  );
}
