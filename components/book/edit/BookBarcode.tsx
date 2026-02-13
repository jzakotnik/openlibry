import { BookType } from "@/entities/BookType";
import Barcode from "react-barcode";

interface BookBarcodeProps {
  book: BookType;
}

export default function BookBarcode({ book }: BookBarcodeProps) {
  return (
    <div className="mt-6 px-3 py-4 bg-white rounded-lg shadow-sm border border-gray-100 text-center">
      <p className="text-xs text-gray-600 mb-2 truncate">
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
    </div>
  );
}
