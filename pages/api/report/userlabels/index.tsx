import { UserType } from "@/entities/UserType";
import { getAllUsers } from "@/entities/user";
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
import type { NextApiRequest, NextApiResponse } from "next";
const { join } = require("path");

const prisma = new PrismaClient();
var fs = require("fs");
var base64Image = fs.readFileSync(
  join(process.cwd(), "/public/" + process.env.USERID_LABEL_IMAGE),
  {
    encoding: "base64",
  }
);
const BOOKLABEL_BARCODE_VERSION = process.env.BOOKLABEL_BARCODE_VERSION
  ? process.env.BOOKLABEL_BARCODE_VERSION
  : "code128";

const labelsPerPage = process.env.USERLABEL_PER_PAGE != null ? Number(process.env.USERLABEL_PER_PAGE) : 6
const styles = StyleSheet.create({
  image: {
    width: (process.env.USERLABEL_WIDTH ? process.env.USERLABEL_WIDTH : "42vw"), // Adjust as needed
    height: "auto", // Adjust based on your requirements
  },

  pageContainer: {
    flexDirection: "column",
    alignContent: "flex-start",
    justifyContent: "flex-start",
  }
});

const generateInfolines = (user: UserType) => {
  // console.log("2 user", user);
  const chunk = Object.entries(process.env).map(([key, value]) => {

    if (key.startsWith("USERLABEL_LINE_") && value != null) {
      let valueArr = JSON.parse(value)
      // console.log("Valuearr: ", key, valueArr);
      // console.log("3 user", user);
      const replacement = replacePlaceholder(valueArr[0], user);
      const top = valueArr[1];
      const left = valueArr[2];
      const style = {
        position: "absolute",
        top: valueArr[1],
        left: valueArr[2],
        width: valueArr[3],
        margin: valueArr[4],
        color: valueArr[5],
        fontSize: valueArr[6]
      }
      // console.log("STyle", style)
      return (
        <Text style={style}>{replacement}</Text>
      )
    }
  })
  return (

    chunk

  )
}

const replacePlaceholder = (text: String, user: UserType) => {
  // first try, hardcode the fields

  if (text.includes("User.firstName")) {
    text = text.replaceAll("User.firstName", user.firstName);
  }
  if (text.includes("User.lastName")) {
    text = text.replaceAll("User.lastName", user.lastName);
  }

  if (text.includes("User.schoolGrade")) {
    text = text.replaceAll("User.schoolGrade", user.schoolGrade != null ? user.schoolGrade : "");
  }

  return text;
}

const colorbar = ({ id }: any) => {
  const colorbar = process.env.USERLABEL_SEPARATE_COLORBAR != null ?
    (JSON.parse(process.env.USERLABEL_SEPARATE_COLORBAR)) : null;
  if (colorbar != null) {

    return (<Canvas key={id}

      paint={
        (painterObject) =>
          painterObject
            .save()
            .rect(0, 0, colorbar[0], colorbar[1])
            .fill(colorbar[2])
      }
    />)
  }
  return null;

}
const generateBarcode = async (users: Array<UserType>) => {
  const result = "";
  let allcodes = await Promise.all(
    users.map(async (u: UserType, i: number) => {
      const png =
        await bwipjs.toBuffer({
          bcid: BOOKLABEL_BARCODE_VERSION,
          text: u.id!.toString(),
          scale: 3,
          height: 10,
          includetext: true,
          textxalign: "center",
        })
        ;
      const pos = {
        left: (i % labelsPerPage <= (labelsPerPage / 2) - 1 ? 1 : 11) + "cm",
        top: ((29 / (labelsPerPage / 2)) + 0.5) * (i % (labelsPerPage / 2)) + "cm",
      };

      const infolines = generateInfolines(u);
      //console.log("Position", pos, i, u.id);

      return (
        <div key={u.id!}>
          <View
            style={{
              position: "absolute",
              flexDirection: "column",
              left: pos.left,
              top: pos.top,
              width: "42vw",
              padding: 0,
              margin: 0,
            }}
          >
            <View
              style={{
                flexDirection: "column"
              }}
            >
              <Image
                key={u.id}
                style={styles.image}
                src={"data:image/jpg;base64, " + base64Image}
              />

              {colorbar(u.id)}
              {infolines}
              <Image
                key={u.id}
                src={"data:image/png;base64, " + await (png.toString("base64"))}
                style={{
                  position: "absolute",
                  width: "2.5cm",
                  height: "1.6cm",
                  top: "80%", // Center vertically, adjust as needed
                  left: "63%", // Center horizontally, adjust as needed
                }}
              />

            </View>
          </View>

        </div>
      );


    })
  );
  return allcodes;
}


async function createUserPDF(books: Array<UserType>) {
  var pdfstream;
  const barcodes = await generateBarcode(books);
  console.log("split", labelsPerPage);
  const barcodesSections = chunkArray(barcodes, labelsPerPage);

  pdfstream = await ReactPDF.renderToStream(
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
      console.log("Printing user labels via api");
      try {
        const users = (await getAllUsers(prisma)) as any;
        //console.log("Search Params", req.query, "end" in req.query);
        const startUserID = "start" in req.query ? req.query.start : "0";
        const endUserID = "end" in req.query ? req.query.end : users.length - 1;


        const printableUsers = users
          .reverse()
          .slice(
            parseInt(startUserID as string),
            parseInt(endUserID as string)
          );


        console.log("Printing labels for users", startUserID, endUserID);

        if (!users)
          return res.status(400).json({ data: "ERROR: Users  not found" });



        const labels = await createUserPDF(printableUsers);
        // const labels = await createLabelsPDF(printableUsers);
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
