import { BookType } from "@/entities/BookType";
import { getAllBooks } from "@/entities/book";
import { chunkArray } from "@/utils/chunkArray";
import { PrismaClient } from "@prisma/client";
import ReactPDF, {
  Canvas,
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View
} from "@react-pdf/renderer";
import bwipjs from "bwip-js";
import { NextApiRequest, NextApiResponse } from "next";
const { join } = require("path");

const SCHOOL_NAME = process.env.SCHOOL_NAME || "Eigentum Schule";

const BOOKLABEL_MARGIN_LEFT = process.env.BOOKLABEL_MARGIN_LEFT
  ? parseFloat(process.env.BOOKLABEL_MARGIN_LEFT)
  : 1;
const BOOKLABEL_MARGIN_TOP = process.env.BOOKLABEL_MARGIN_TOP
  ? parseFloat(process.env.BOOKLABEL_MARGIN_TOP)
  : 2;
const BOOKLABEL_ROWSONPAGE = process.env.BOOKLABEL_ROWSONPAGE
  ? Number(process.env.BOOKLABEL_ROWSONPAGE)
  : 5;
const BOOKLABEL_COLUMNSONPAGE = process.env.BOOKLABEL_COLUMNSONPAGE
  ? Number(process.env.BOOKLABEL_COLUMNSONPAGE)
  : 2;
const BOOKLABEL_BARCODE_WIDTH = process.env.BOOKLABEL_BARCODE_WIDTH
  ? process.env.BOOKLABEL_BARCODE_WIDTH
  : "3cm";
const BOOKLABEL_BARCODE_HEIGHT = process.env.BOOKLABEL_BARCODE_HEIGHT
  ? process.env.BOOKLABEL_BARCODE_HEIGHT
  : "1.6cm";
const BOOKLABEL_BARCODE_VERSION = process.env.BOOKLABEL_BARCODE_VERSION
  ? process.env.BOOKLABEL_BARCODE_VERSION
  : "code128";

const BOOKLABEL_BARCODE_PLACEHOLDER = process.env.BOOKLABEL_BARCODE_PLACEHOLDER
  ? process.env.BOOKLABEL_BARCODE_PLACEHOLDER
  : "barcode";

const BOOKLABEL_AUTHOR_SPACING = process.env.BOOKLABEL_AUTHOR_SPACING
  ? parseFloat(process.env.BOOKLABEL_AUTHOR_SPACING)
  : 1;

const BOOKLABEL_LABEL_SPACING_HORIZONTAL = process.env.BOOKLABEL_LABEL_SPACING_HORIZONTAL ? parseFloat(process.env.BOOKLABEL_LABEL_SPACING_HORIZONTAL) : 0;

const BOOKLABEL_LABEL_SPACING_VERTICAL = process.env.BOOKLABEL_LABEL_SPACING_VERTICAL ? parseFloat(process.env.BOOKLABEL_LABEL_SPACING_VERTICAL) : 0;

const BOOKLABEL_LABEL_WIDTH = process.env.BOOKLABEL_LABEL_WIDTH ? parseFloat(process.env.BOOKLABEL_LABEL_WIDTH) : 5.0;

const BOOKLABEL_LABEL_HEIGHT = process.env.BOOKLABEL_LABEL_HEIGHT ? parseFloat(process.env.BOOKLABEL_LABEL_HEIGHT) : 3.0;

const BOOKLABEL_MARGIN_IN_LABEL = process.env.BOOKLABEL_MARGIN_IN_LABEL ? parseFloat(process.env.BOOKLABEL_MARGIN_IN_LABEL) : 0.0;

const BOOKLABEL_PRINT_LABEL_FRAME: boolean = process.env.BOOKLABEL_PRINT_LABEL_FRAME ? JSON.parse(process.env.BOOKLABEL_PRINT_LABEL_FRAME) : false;

const pointPerCm = 28.3464566929;

const prisma = new PrismaClient();
var fs = require("fs");
var schoollogo = fs.readFileSync(
  join(process.cwd(), "/public/" + process.env.BOOKLABEL_LOGO)
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

const labelFrame = ({ id }: any) => {

  if (BOOKLABEL_PRINT_LABEL_FRAME) {
    return (
      <Canvas
        key={id}
        paint={(painterObject) =>
          painterObject
            .rect(0, 0, BOOKLABEL_LABEL_WIDTH * pointPerCm, BOOKLABEL_LABEL_HEIGHT * pointPerCm)
            .stroke()
        }
      />
    );
  }
  return null;
};


const authorLine = (b: BookType) => {
  const authorlineData =
    process.env.BOOKLABEL_AUTHORLINE != null
      ? JSON.parse(process.env.BOOKLABEL_AUTHORLINE)
      : null;
  if (authorlineData == null) return null;
  return (
    <Text
      style={{
        transformOrigin: "0% 0%",
        transform: "rotate(-90deg)",
        fontSize: authorlineData[1],
        //left: "-" + (labelWidth / 2 - 0.5) + "cm",
        left: BOOKLABEL_MARGIN_IN_LABEL + "cm",
        width: BOOKLABEL_LABEL_HEIGHT + "cm",

        textAlign: authorlineData[2],
      }}
    >
      {replacePlaceholder(authorlineData[0], b)}
    </Text>
  )
}
const getMaxTitleHeight = (useMaxSpace: boolean, pointsize: number) => {
  if (!useMaxSpace) {
    return pointsize / pointPerCm;
  }
  // use all space not used by other lines. Check which other lines exist
  return BOOKLABEL_LABEL_HEIGHT - (2 * BOOKLABEL_MARGIN_IN_LABEL) - parseFloat(BOOKLABEL_BARCODE_HEIGHT.split("cm")[0]) - getHightForLine(process.env.BOOKLABEL_LINE_BELOW_1) -
    getHightForLine(process.env.BOOKLABEL_LINE_BELOW_2);
}
const getHightForLine = (lineConfig: string | undefined) => {
  if (lineConfig === undefined || lineConfig == null) return 0;
  return JSON.parse(lineConfig)[1] / pointPerCm;
}

const infoLine = (b: BookType, configline: string | undefined, useMaxSpace: boolean) => {
  if (configline === undefined || configline == null) return null;
  const lineConfig = JSON.parse(configline);
  const titleHeight = getMaxTitleHeight(useMaxSpace, lineConfig[1]);
  const maxTextWith = BOOKLABEL_LABEL_WIDTH - BOOKLABEL_AUTHOR_SPACING - (2 * BOOKLABEL_MARGIN_IN_LABEL);
  // console.log("infoline", lineConfig, titleHeight, maxTextWith);
  return (<Text
    style={{
      fontSize: lineConfig[1],
      maxHeight: titleHeight + "cm",
      maxWidth: maxTextWith + "cm",
      textAlign: lineConfig[2],
      // maxLines: 1,
      left: BOOKLABEL_AUTHOR_SPACING + "cm",
    }}
  >
    {replacePlaceholder(lineConfig[0], b)}
  </Text>)
}


const replacePlaceholder = (text: String, book: any) => {
  try {
    while (text.includes("Book.")) {
      const nextReplace = String(
        text.split(" ").find((item: any) => item.includes("Book."))
      );
      const propertyName = nextReplace.split(".")[1];
      //let's for the moment assume that the property name is there from the env file

      text = text.replaceAll(nextReplace, book[propertyName]);
    }
    // replace topics
    while (text.includes("firstTopic")) {
      const nextReplace = String(
        text.split(" ").find((item: any) => item.includes("firstTopic"))
      );

      //let's for the moment assume that the property name is there from the env file

      text = text.replaceAll(nextReplace, book.topics ? book.topics!.split(";")[0] : "");
    }

    return text;
  } catch (error) {
    return "Configuration error in environment";
  }
};



const generateBarcode = async (books: Array<BookType>) => {
  const labelsOnPage = BOOKLABEL_ROWSONPAGE * BOOKLABEL_COLUMNSONPAGE;

  const barcodeFloatHeight = parseFloat(BOOKLABEL_BARCODE_HEIGHT.split("cm")[0]);

  let allcodes = await Promise.all(
    books.map(async (b: BookType, i: number) => {

      const horizontalIndex = i % BOOKLABEL_COLUMNSONPAGE;
      const verticalIndex = Math.floor(i % labelsOnPage / BOOKLABEL_COLUMNSONPAGE);

      const barId = process.env.BARCODE_MINCODELENGTH != null ? b.id!.toString().padStart(parseInt(process.env.BARCODE_MINCODELENGTH)) : b.id!.toString();
      const png =
        BOOKLABEL_BARCODE_PLACEHOLDER == "barcode"
          ? await bwipjs.toBuffer({
            bcid: BOOKLABEL_BARCODE_VERSION,
            text: barId,
            scale: 3,
            height: 10,
            includetext: true,
            textxalign: "center",
          })
          : schoollogo;
      const pos = {
        left: BOOKLABEL_MARGIN_LEFT + (horizontalIndex * BOOKLABEL_LABEL_WIDTH) + (horizontalIndex * BOOKLABEL_LABEL_SPACING_HORIZONTAL),
        top: BOOKLABEL_MARGIN_TOP + BOOKLABEL_LABEL_HEIGHT * verticalIndex + (verticalIndex * BOOKLABEL_LABEL_SPACING_VERTICAL),
      };

      console.log("Position", pos, i);
      return (
        <div key={b.id!}>
          <View
            style={{
              position: "absolute",
              flexDirection: "column",

              left: pos.left + "cm",
              top: pos.top + "cm",
              width: BOOKLABEL_LABEL_WIDTH + "cm",
              padding: 0,
              margin: 0,
            }}
          >
            {labelFrame(b.id)}
          </View>

          <View
            style={{
              position: "absolute",
              flexDirection: "column",

              left: pos.left + "cm",
              top: pos.top + BOOKLABEL_LABEL_HEIGHT + "cm",
              width: BOOKLABEL_LABEL_WIDTH + "cm",
              padding: 0,
              margin: 0,
            }}
          >
            {authorLine(b)}
          </View>

          <View
            style={{
              position: "absolute",
              flexDirection: "column",
              left: pos.left + "cm",
              top: pos.top + "cm",
              width: BOOKLABEL_LABEL_WIDTH - (2 * BOOKLABEL_MARGIN_IN_LABEL) + "cm",
              padding: 0,
              margin: BOOKLABEL_MARGIN_IN_LABEL + "cm",
            }}
          >
            <View
              style={{
                flexDirection: "column",
              }}
            >
              {infoLine(b, process.env.BOOKLABEL_LINE_ABOVE, true)}
              < Image
                key={b.id}
                src={"data:image/png;base64, " + (await png.toString("base64"))}
                style={{
                  width: BOOKLABEL_BARCODE_WIDTH,
                  height: BOOKLABEL_BARCODE_HEIGHT,
                  alignContent: "center",
                  left: BOOKLABEL_AUTHOR_SPACING + "cm",
                }}
              />
              {infoLine(b, process.env.BOOKLABEL_LINE_BELOW_1, true)}
              {infoLine(b, process.env.BOOKLABEL_LINE_BELOW_2, true)}
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
  const barcodesSections = chunkArray(barcodes, BOOKLABEL_ROWSONPAGE * BOOKLABEL_COLUMNSONPAGE);
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
        const allbooks = (await getAllBooks(prisma)) as Array<BookType>;

        const topicFilter =
          "topic" in req.query
            ? (req.query.topic! as string).toLocaleLowerCase()
            : null;
        const idFilter =
          "id" in req.query ? parseInt(req.query.id! as string) : null;
        console.log("Filter string", topicFilter, idFilter);
        //TODO this should be able to do more than one topic!
        const books = allbooks
          .filter((b: BookType) => {
            return topicFilter
              ? b.topics!.toLocaleLowerCase().indexOf(topicFilter) > -1
              : true;
          })
          .filter((b: BookType) => {
            return idFilter ? b.id == idFilter : true;
          });
        //console.log("Filtered books", books);
        //console.log("Search Params", req.query, "end" in req.query);
        const startBookID = "start" in req.query ? req.query.start : "0";
        const endBookID = "end" in req.query ? req.query.end : books.length - 1;
        const printableBooks = books.slice(
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
