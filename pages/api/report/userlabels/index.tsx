import { UserType } from "@/entities/UserType";
import { getAllUsers } from "@/entities/user";
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
import type { NextApiRequest, NextApiResponse } from "next";
const { join } = require("path");

const prisma = new PrismaClient();
var fs = require("fs");
var base64Image = fs.readFileSync(
  join(process.cwd(), "/public/" + process.env.USERID_LABEL),
  {
    encoding: "base64",
  }
);
const BOOKLABEL_BARCODE_VERSION = process.env.BOOKLABEL_BARCODE_VERSION
  ? process.env.BOOKLABEL_BARCODE_VERSION
  : "code128";

const styles = StyleSheet.create({
  page: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: "#FFFFFF",
  },
  section: {
    margin: 15,

    padding: 0,
    flexGrow: 0,
    position: "relative", // To position the text over the image
  },
  image: {
    width: (process.env.USERLABEL_WIDTH ? process.env.USERLABEL_WIDTH : "42") + "vw", // Adjust as needed
    height: "auto", // Adjust based on your requirements
  },
  overlayName: {
    position: "absolute",
    top: "75%", // Center vertically, adjust as needed
    left: "3%", // Center horizontally, adjust as needed

    width: "50vw",
    margin: "2pt",
    color: "black", // Choose text color that contrasts with your image
    fontSize: 14, // Adjust font size as needed
  },
  overlayDetails: {
    position: "absolute",
    top: "85%", // Center vertically, adjust as needed
    left: "3%", // Center horizontally, adjust as needed

    color: "black", // Choose text color that contrasts with your image
    fontSize: 10, // Adjust font size as needed
  },
  overlayID: {
    position: "absolute",
    top: "90%", // Center vertically, adjust as needed
    left: "3%", // Center horizontally, adjust as needed

    color: "black", // Choose text color that contrasts with your image
    fontSize: 12, // Adjust font size as needed
  },

  pageContainer: {
    flexDirection: "column",
    alignContent: "flex-start",
    justifyContent: "flex-start",
  },


  overlayBarcode: {
    position: "absolute",
    top: "85%", // Center vertically, adjust as needed
    left: "60%", // Center horizontally, adjust as needed

    color: "black", // Choose text color that contrasts with your image
    fontSize: 12, // Adjust font size as needed
  }
});

const Label = ({ u }: any) => {
  console.log("label: ", u.id, u.firstName);
  return (
    <View style={styles.section}>
      <Image
        style={styles.image}
        src={"data:image/jpg;base64, " + base64Image}
      />
      <Text style={styles.overlayName}>{u.firstName + " " + u.lastName}</Text>
      <Text style={styles.overlayDetails}>{process.env.SCHOOL_NAME}</Text>
      <Text style={styles.overlayID}>{"Nr." + u.id}</Text>
    </View>
  );
};

// Create Document Component
const UserLabels = ({ renderedUsers }: any) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {renderedUsers.map((u: any) => {
          console.log("inner user", u);
          return <Label key={u.id} u={u} />;
        })}
      </Page>
    </Document>
  );
};

async function createLabelsPDF(users: Array<UserType>) {
  const pdfstream = await ReactPDF.renderToStream(
    <UserLabels renderedUsers={users} />
  );

  return pdfstream;
}


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
        fontSize: valueArr[6],

      }

      const style2 = {
        position: "absolute",
        top: "75%", // Center vertically, adjust as needed
        left: "3%", // Center horizontally, adjust as needed

        width: "50vw",
        margin: "2pt",
        color: "black", // Choose text color that contrasts with your image
        fontSize: 14, // Adjust font size as needed
      }
      console.log("STyle", style)
      return (
        <Text style={style}>{replacement}</Text>
        // <Text style={{
        //   position: "absolute",
        //   top: "75%", // Center vertically, adjust as needed
        //   left: "3%", // Center horizontally, adjust as needed

        //   width: "50vw",
        //   margin: "2pt",
        //   color: "black", // Choose text color that contrasts with your image
        //   fontSize: 14, // Adjust font size as needed
        // }}>{replacement}</Text>
      )
    }
  })
  return (

    chunk

  )
}

const replacePlaceholder = (text: String, user: UserType) => {
  // first try, hardcode the two fields
  // console.log("User", user, text)
  if (text.includes("User.firstName")) {
    text.replace("User.firstName", user.firstName);
  }
  if (text.includes("User.lastName")) {
    text.replaceAll("User.lastName", user.lastName);
  }

  if (text.includes("User.schoolGrade")) {
    text.replaceAll("User.schoolGrade", user.schoolGrade != null ? user.schoolGrade : "");
  }
  // console.log("Text: ", text)
  return text;
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
        left: (i % 6 <= 2 ? 1 : 11) + "cm",
        top: 9.5 * (i % 3) + "cm",
      };
      // console.log("Main user", u);
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
                flexDirection: "column",
              }}
            >


              <Image
                key={u.id}
                style={styles.image}
                src={"data:image/jpg;base64, " + base64Image}
              />

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
  //console.log("barcodes", barcodes);
  const barcodesSections = chunkArray(barcodes, 6);

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
        users.map((u: UserType, i: number) => {
          console.log("Before sort", u.id, i)
        });

        const printableUsers = users
          .reverse()
          .slice(
            parseInt(startUserID as string),
            parseInt(endUserID as string)
          );
        printableUsers.map((u: UserType, i: number) => {
          console.log("After sort", u.id, i)
        });

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
