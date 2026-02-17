import { useRouter } from "next/router";
import Barcode from "react-barcode";

export default function Home() {
  const router = useRouter();
  if (!router.query.bookid) {
    return <p className="text-muted-foreground">ID not found</p>;
  }

  const bookid = parseInt(
    Array.isArray(router.query.bookid)
      ? router.query.bookid[0]
      : router.query.bookid,
  );
  return (
    <div className="mx-10 my-10 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
      <p className="text-sm font-medium mb-2">
        Barcode Buch ID {bookid.toString()}
      </p>

      <Barcode
        value={bookid.toString()}
        height={90}
        width={1.5}
        fontOptions="600"
        textMargin={4}
        margin={0}
      />
    </div>
  );
}
