import { BookType } from "@/entities/BookType";
import { getAllBooks } from "@/entities/book";
import { chunkArray } from "@/utils/chunkArray";
import { currentTime } from "@/utils/dateutils";
import { PrismaClient } from "@prisma/client";
import ReactPDF, {
  Canvas,
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

const BOOKLABEL_LABEL_SPACING_HORIZONTAL = process.env
  .BOOKLABEL_LABEL_SPACING_HORIZONTAL
  ? parseFloat(process.env.BOOKLABEL_LABEL_SPACING_HORIZONTAL)
  : 0;

const BOOKLABEL_LABEL_SPACING_VERTICAL = process.env
  .BOOKLABEL_LABEL_SPACING_VERTICAL
  ? parseFloat(process.env.BOOKLABEL_LABEL_SPACING_VERTICAL)
  : 0;

const BOOKLABEL_LABEL_WIDTH = process.env.BOOKLABEL_LABEL_WIDTH
  ? parseFloat(process.env.BOOKLABEL_LABEL_WIDTH)
  : 5.0;

const BOOKLABEL_LABEL_HEIGHT = process.env.BOOKLABEL_LABEL_HEIGHT
  ? parseFloat(process.env.BOOKLABEL_LABEL_HEIGHT)
  : 3.0;

const BOOKLABEL_MARGIN_IN_LABEL = process.env.BOOKLABEL_MARGIN_IN_LABEL
  ? parseFloat(process.env.BOOKLABEL_MARGIN_IN_LABEL)
  : 0.0;

const BOOKLABEL_PRINT_LABEL_FRAME: boolean = process.env
  .BOOKLABEL_PRINT_LABEL_FRAME
  ? JSON.parse(process.env.BOOKLABEL_PRINT_LABEL_FRAME)
  : false;

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
            .rect(
              0,
              0,
              BOOKLABEL_LABEL_WIDTH * pointPerCm,
              BOOKLABEL_LABEL_HEIGHT * pointPerCm
            )
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
  );
};
const getMaxTitleHeight = (useMaxSpace: boolean, pointsize: number) => {
  if (!useMaxSpace) {
    return pointsize / pointPerCm;
  }
  // use all space not used by other lines. Check which other lines exist
  return (
    BOOKLABEL_LABEL_HEIGHT -
    2 * BOOKLABEL_MARGIN_IN_LABEL -
    parseFloat(BOOKLABEL_BARCODE_HEIGHT.split("cm")[0]) -
    getHightForLine(process.env.BOOKLABEL_LINE_BELOW_1) -
    getHightForLine(process.env.BOOKLABEL_LINE_BELOW_2)
  );
};
const getHightForLine = (lineConfig: string | undefined) => {
  if (lineConfig === undefined || lineConfig == null) return 0;
  return JSON.parse(lineConfig)[1] / pointPerCm;
};

const infoLine = (
  b: BookType,
  configline: string | undefined,
  useMaxSpace: boolean
) => {
  if (configline === undefined || configline == null) return null;
  const lineConfig = JSON.parse(configline);
  const titleHeight = getMaxTitleHeight(useMaxSpace, lineConfig[1]);
  const maxTextWith =
    BOOKLABEL_LABEL_WIDTH -
    BOOKLABEL_AUTHOR_SPACING -
    2 * BOOKLABEL_MARGIN_IN_LABEL;
  // console.log("infoline", lineConfig, titleHeight, maxTextWith);
  return (
    <Text
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
    </Text>
  );
};

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

      text = text.replaceAll(
        nextReplace,
        book.topics ? book.topics!.split(";")[0] : ""
      );
    }

    return text;
  } catch (error) {
    return "Configuration error in environment";
  }
};

const generateBarcode = async (
  books: Array<BookType>,
  ignoreLabelFields: number[]
) => {
  const labelsOnPage = BOOKLABEL_ROWSONPAGE * BOOKLABEL_COLUMNSONPAGE;

  const barcodeFloatHeight = parseFloat(
    BOOKLABEL_BARCODE_HEIGHT.split("cm")[0]
  );
  //console.log("Books", books);

  let allcodes = await Promise.all(
    books.map(async (b: BookType, i: number) => {
      if (b.id == null) {
        // this is an empty element for a label that is already used - skip it
        return;
      }
      const horizontalIndex = i % BOOKLABEL_COLUMNSONPAGE;
      const verticalIndex = Math.floor(
        (i % labelsOnPage) / BOOKLABEL_COLUMNSONPAGE
      );

      const barId =
        process.env.BARCODE_MINCODELENGTH != null
          ? b
            .id!.toString()
            .padStart(parseInt(process.env.BARCODE_MINCODELENGTH))
          : b.id!.toString();
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
        left:
          BOOKLABEL_MARGIN_LEFT +
          horizontalIndex * BOOKLABEL_LABEL_WIDTH +
          horizontalIndex * BOOKLABEL_LABEL_SPACING_HORIZONTAL,
        top:
          BOOKLABEL_MARGIN_TOP +
          BOOKLABEL_LABEL_HEIGHT * verticalIndex +
          verticalIndex * BOOKLABEL_LABEL_SPACING_VERTICAL,
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
              width:
                BOOKLABEL_LABEL_WIDTH - 2 * BOOKLABEL_MARGIN_IN_LABEL + "cm",
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
              <Image
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

async function createLabelsPDF(
  books: Array<BookType>,
  ignoreLabelFields: number[]
) {
  const barcodes = await generateBarcode(books, ignoreLabelFields);
  //console.log("barcodes", barcodes);
  const barcodesSections = chunkArray(
    barcodes,
    BOOKLABEL_ROWSONPAGE * BOOKLABEL_COLUMNSONPAGE
  );
  console.log("Barcodes", barcodes, barcodesSections.length);
  barcodesSections.map((chunk, i) => console.log("Rendering chunk", chunk));
  const pdfstream = ReactPDF.renderToStream(
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
  console.log("PDF rendered", pdfstream);

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
        const idFilter: number[] = [];
        if ("id" in req.query) {
          Array.isArray(req.query.id)
            ? (req.query.id! as string[]).map((e) => idFilter.push(parseInt(e)))
            : idFilter.push(parseInt(req.query.id! as string));
        }
        const ignoreLabelFields: number[] = [];
        if ("block" in req.query) {
          Array.isArray(req.query.block)
            ? (req.query.block! as string[]).map((e) =>
              ignoreLabelFields.push(parseInt(e))
            )
            : ignoreLabelFields.push(parseInt(req.query.block! as string));
        }
        console.log("Filter string", topicFilter, idFilter);
        //TODO this should be able to do more than one topic!
        const books = allbooks
          .filter((b: BookType) => {
            return topicFilter
              ? b.topics != null && b.topics!.toLocaleLowerCase().indexOf(topicFilter) > -1
              : true;
          })
          .filter((b: BookType) => {
            return idFilter.length > 0
              ? b.id && idFilter.indexOf(b.id) > -1
              : true;
          });
        //console.log("Filtered books", books);
        //console.log("Search Params", req.query, "end" in req.query);
        let printableBooks = books;
        if ("start" in req.query || "end" in req.query) {
          let startIndex = "start" in req.query ? parseInt(req.query.start as string) : 0;
          let endIndex =
            "end" in req.query ? parseInt(req.query.end as string) : books.length - 1;
          if (startIndex > endIndex) {
            console.log("Those fools got start and end mixed up again...");
            const temp: number = endIndex;
            endIndex = startIndex;
            startIndex = temp;

          }
          printableBooks = books.slice(
            startIndex,
            endIndex
          );
          console.log(
            "Printing labels for books in Indexrange",
            startIndex,
            endIndex
          );
        } else if ("startId" in req.query && "endId" in req.query) {
          let startId =
            "startId" in req.query ? parseInt(req.query.startId as string) : 0;
          // books are sorted desc, so first book has highest number
          let endId =
            "endId" in req.query
              ? parseInt(req.query.endId as string)
              : books[0].id!;
          if (startId > endId) {
            console.log("Those fools got startId and endId mixed up again...");
            const temp: number = endId;
            endId = startId;
            startId = temp;

          }
          if (startId > books[0].id!) {
            console.log("Selecting outside of the ID range used")
          }
          //TODO: This should be done in sql and not filtered later.
          console.log("Printing labels for books in ID range", startId, endId);
          printableBooks = books.filter(
            (b) => b.id! >= startId && b.id! <= endId!
          );
        }
        console.log("Printing labels for books");

        if (!books || !printableBooks)
          return res.status(400).json({ data: "ERROR: Books  not found" });
        if (printableBooks.length == 0)
          return res.status(400).json({ data: "ERROR: No books matching search criteria" });

        //create a nice label PDF from the books
        //console.log(books);
        const book: BookType = {
          title: "",
          subtitle: "",
          author: "",
          renewalCount: 0,
          rentalStatus: "available",
          topics: ";",
          rentedDate: currentTime(),
          dueDate: currentTime(),
        };
        // splice empty books on positions to skip
        for (var skipindex of ignoreLabelFields) {
          printableBooks.splice(skipindex, 0, book);
        }

        const labels = await createLabelsPDF(printableBooks, ignoreLabelFields);
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
