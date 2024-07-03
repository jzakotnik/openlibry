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
import sharp from "sharp";
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
    fontSize: 12,
  },
});

async function textToBase64Barcode(id: string) {
  //this must be a joke
  var JsBarcode = require("jsbarcode");
  const { DOMImplementation, XMLSerializer } = require("xmldom");
  const xmlSerializer = new XMLSerializer();
  const document = new DOMImplementation().createDocument(
    "http://www.w3.org/1999/xhtml",
    "html",
    null
  );
  const svgNode = document.createElementNS("http://www.w3.org/2000/svg", "svg");

  JsBarcode(svgNode, "1234", {
    xmlDocument: document,
  });
  //console.log(xmlSerializer.serializeToString(svgNode));
  const svgBuffer = xmlSerializer.serializeToString(svgNode);
  //console.log("rendering png from svg");
  const resizedSVG = await sharp(Buffer.from(svgBuffer))
    .resize(200, 200)
    .png()
    .toBuffer();

  //console.log("sharped png", resizedSVG);
  console.log(`data:image/png;base64,${resizedSVG.toString("base64")}`);
  return resizedSVG;
}

const Label = async ({ b }: any) => {
  //console.log(b.id);

  //console.log("Rendering barcode on pdf", barcode);
  return (
    <View style={styles.section} wrap={false}>
      <Image
        src={"data:image/jpg;base64, " + data}
        style={{ width: "1cm", height: "1cm" }}
      />
      <View style={styles.text} wrap={false}>
        <Image
          src={"data:image/png;base64, " + data}
          style={{ width: "5cm", height: "1cm" }}
        />
        <Text style={styles.booknr}>{b.id}</Text>

        <Text>{b.title}</Text>
        <Text>Eigentum der Schulbücherei</Text>
      </View>
    </View>
  );
};

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
        <Image
          key={b.id}
          src={"data:image/png;base64, " + (await png.toString("base64"))}
          style={{ width: "5cm", height: "2cm" }}
        />
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
