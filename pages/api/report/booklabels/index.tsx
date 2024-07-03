import { BookType } from "@/entities/BookType";
import { getAllBooks } from "@/entities/book";
import { PrismaClient } from "@prisma/client";
import ReactPDF, {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import bwipjs from "bwip-js";
import type { NextApiRequest, NextApiResponse } from "next";
const { join } = require("path");

const prisma = new PrismaClient();
var fs = require("fs");
var data = fs.readFileSync(
  join(process.cwd(), "/public/" + process.env.LOGO_LABEL),
  {
    encoding: "base64",
  }
);

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
    fontSize: 8,

    flexDirection: "row",
    alignContent: "center",
    justifyContent: "flex-start",
  },
  text: {
    margin: 3,
    width: "6cm",
    height: "4cm",

    flexGrow: 1,
    fontSize: 8,

    flexDirection: "column",
    alignContent: "center",
    justifyContent: "flex-start",
  },
  booknr: {
    padding: 2,
    fontSize: 12,
  },
});

const generateBarcode = async (books: Array<BookType>) => {
  const result = "";
  let allcodes = await Promise.all(
    books.map(async (b) => {
      const png = await bwipjs.toBuffer({
        bcid: "code128",
        text: b.id!.toString(),
        scale: 3,
        height: 10,
        includetext: true,
        textxalign: "center",
      });

      return (
        <div key={b.id!}>
          <Text style={styles.booknr}>{b.title}</Text>
          <Image
            key={b.id}
            src={"data:image/png;base64, " + (await png.toString("base64"))}
            style={{ width: "4cm", height: "1cm" }}
          />
          <Text>Eigentum der Schulbücherei</Text>
        </div>
      );
    })
  );
  console.log("All barcodes", allcodes);
  return allcodes;
};

async function createLabelsPDF(books: Array<BookType>) {
  var pdfstream;
  const barcodes = await generateBarcode(books);
  console.log("barcodes", barcodes);

  pdfstream = ReactPDF.renderToStream(
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.text} wrap={false}>
          {barcodes}
        </View>
      </Page>
    </Document>
  );

  return pdfstream;
}

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "GET":
      console.log("Printing book labels via api");
      try {
        const books = (await getAllBooks(prisma)) as Array<BookType>;
        //console.log("Search Params", req.query, "end" in req.query);
        const startBookID = "start" in req.query ? req.query.start : "0";
        const endBookID = "end" in req.query ? req.query.end : books.length - 1;
        const printableBooks = books
          .reverse()
          .slice(
            parseInt(startBookID as string),
            parseInt(endBookID as string)
          );

        console.log("Printing labels for books", startBookID, endBookID);

        if (!books)
          return res.status(400).json({ data: "ERROR: Books  not found" });

        //create a nice label PDF from the books
        //console.log(books);

        const labels = await createLabelsPDF(printableBooks);
        res.writeHead(200, {
          "Content-Type": "application/pdf",
        });
        labels.pipe(res);

        //res.status(200).json(labels);
      } catch (error) {
        console.log(error);
        res.status(400).json({ data: "ERROR: " + error });
      }
      break;

    default:
      res.status(405).end(`${req.method} Not Allowed`);
      break;
  }
}
