import { BookType } from "@/entities/BookType";
import { getAllBooks } from "@/entities/book";
import { chunkArray } from "@/utils/chunkArray";
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
import { NextApiRequest, NextApiResponse } from "next";
const { join } = require("path");

const SCHOOL_NAME = process.env.SCHOOL_NAME
  ? process.env.SCHOOL_NAME
  : "Eigentum Schule";

const prisma = new PrismaClient();
var fs = require("fs");
var data = fs.readFileSync(
  join(process.cwd(), "/public/" + process.env.LOGO_LABEL),
  {
    encoding: "base64",
  }
);

const styles = StyleSheet.create({
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
    fontSize: 8,

    flexDirection: "row",
    alignContent: "center",
    justifyContent: "flex-start",
  },
  pageContainer: {
    flexDirection: "column",
    alignContent: "flex-start",
    justifyContent: "flex-start",
  },
  labelRowContainer: {
    flexDirection: "row",
    alignContent: "flex-start",
    justifyContent: "flex-start",
  },
  labelContainer: {
    flexDirection: "row",
    alignContent: "flex-start",
    justifyContent: "flex-start",
  },
  barCodeContainer: {
    flexDirection: "column",
    alignContent: "flex-start",
    justifyContent: "flex-start",
  },
});

const generateBarcode = async (books: Array<BookType>) => {
  const result = "";
  let allcodes = await Promise.all(
    books.map(async (b: BookType, i: number) => {
      const png = await bwipjs.toBuffer({
        bcid: "code128",
        text: b.id!.toString(),
        scale: 3,
        height: 10,
        includetext: true,
        textxalign: "center",
      });
      const pos = {
        left: 1 + (i % 10 <= 4 ? 1 : 10) + "cm",
        top: 2 + 5.5 * (i % 5) + "cm",
      };
      const posAuthor = {
        left: 1 + (i % 10 <= 4 ? 1 : 10) + "cm",
        top: 2 + 5.5 * (i % 5) + "cm",
      };
      console.log("Position", pos, i);
      return (
        <div key={b.id!}>
          <View
            style={{
              position: "absolute",
              flexDirection: "column",

              left: pos.left,
              top: pos.top,
              width: "5cm",
              padding: 0,
              margin: 0,
            }}
          >
            <View
              style={{
                flexDirection: "column",
              }}
            >
              <Text
                style={{
                  transform: "rotate(-90deg)",
                  fontSize: 9,
                  left: "-3.2cm",
                }}
              >
                {b.author.length > 15
                  ? b.author.substring(0, 15) + "..."
                  : b.author}
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  width: "5cm",
                }}
              >
                {b.title}
              </Text>
              <Image
                key={b.id}
                src={"data:image/png;base64, " + (await png.toString("base64"))}
                style={{ width: "3cm", height: "1.6cm" }}
              />
              <Text style={{ fontSize: 8 }}>{SCHOOL_NAME}</Text>
            </View>
          </View>
        </div>
      );
    })
  );
  //console.log("All barcodes", allcodes);
  return allcodes;
};

async function createLabelsPDF(books: Array<BookType>) {
  var pdfstream;
  const barcodes = await generateBarcode(books);
  //console.log("barcodes", barcodes);
  const barcodesSections = chunkArray(barcodes, 10);

  pdfstream = ReactPDF.renderToStream(
    <Document>
      {barcodesSections.map((chunk, i) => (
        <Page
          wrap
          key={i}
          size="A4"
          style={{
            flexDirection: "column",
            backgroundColor: "#FFFFFF",
          }}
        >
          <View key={i} style={styles.pageContainer}>
            {chunk}
          </View>
        </Page>
      ))}
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
