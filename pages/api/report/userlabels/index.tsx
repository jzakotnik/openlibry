import { UserType } from "@/entities/UserType";
import { countUser, getAllUsersBySchoolGrade, getAllUsersOrderById, getUser, getUsersInIdRange, getUsersInIdRangeForSchoolgrade } from "@/entities/user";
import { chunkArray } from "@/utils/chunkArray";
import ReactPDF, {
  Canvas,
  Document,
  Page,
  Image as PdfImage,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import bwipjs from "bwip-js";
import type { NextApiRequest, NextApiResponse } from "next";
const { join } = require("path");

import { prisma } from "@/entities/db";
var fs = require("fs");
var base64Image = fs.readFileSync(
  join(process.cwd(), "/public/" + process.env.USERID_LABEL_IMAGE),
  {
    encoding: "base64",
  }
);

// top, left, width, height, barcode version
const BARCODE_SETTINGS =
  process.env.USERLABEL_BARCODE != null
    ? JSON.parse(process.env.USERLABEL_BARCODE)
    : null;

const labelsPerPage =
  process.env.USERLABEL_PER_PAGE != null
    ? Number(process.env.USERLABEL_PER_PAGE)
    : 6;
const styles = StyleSheet.create({
  image: {
    width: process.env.USERLABEL_WIDTH ? process.env.USERLABEL_WIDTH : "42vw", // Adjust as needed
    height: "auto", // Adjust based on your requirements
  },

  pageContainer: {
    flexDirection: "column",
    alignContent: "flex-start",
    justifyContent: "flex-start",
  },
});

const generateInfolines = (user: UserType) => {
  const chunk = Object.entries(process.env).map(([key, value]) => {
    if (key.startsWith("USERLABEL_LINE_") && value != null) {
      const valueArr = JSON.parse(value);
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
      } as any;
      return (
        <Text key={replacement.toString()} style={style}>
          {replacement}
        </Text>
      );
    }
  });
  return chunk;
};

const replacePlaceholder = (text: String, user: any) => {
  try {
    while (text.includes("User.")) {
      const nextReplace = String(
        text.split(" ").find((item: any) => item.includes("User."))
      );
      const propertyName = nextReplace.split(".")[1];
      //let's for the moment assume that the property name is there from the env file

      text = text.replaceAll(nextReplace, user[propertyName]);
    }
    return text;
  } catch (error) {
    return "Configuration error in environment";
  }
};

const colorbar = ({ id }: any) => {
  const colorbar =
    process.env.USERLABEL_SEPARATE_COLORBAR != null
      ? JSON.parse(process.env.USERLABEL_SEPARATE_COLORBAR)
      : null;
  if (colorbar != null) {
    return (
      <Canvas
        key={id}
        paint={(painterObject) =>
          painterObject
            .save()
            .rect(0, 0, colorbar[0], colorbar[1])
            .fill(colorbar[2])
        }
      />
    );
  }
  return null;
};

const generateBarcode = async (id: String) => {
  if (BARCODE_SETTINGS == null) return null;
  const barId =
    process.env.BARCODE_MINCODELENGTH != null
      ? id!.toString().padStart(parseInt(process.env.BARCODE_MINCODELENGTH))
      : id!.toString();
  const png = await bwipjs.toBuffer({
    bcid: BARCODE_SETTINGS[4],
    text: barId,
    scale: 3,
    height: 10,
    includetext: true,
    textxalign: "center",
  });
  return (
    <PdfImage
      // key={id}
      src={"data:image/png;base64, " + (await png.toString("base64"))}
      style={{
        position: "absolute",
        width: BARCODE_SETTINGS[2],
        height: BARCODE_SETTINGS[3],
        top: BARCODE_SETTINGS[0],
        left: BARCODE_SETTINGS[1],
      }}
    />
  );
};

const generateLabels = async (users: Array<UserType>) => {
  const result = "";
  const allcodes = await Promise.all(
    users.map(async (u: UserType, i: number) => {
      const pos = {
        left: (i % labelsPerPage <= labelsPerPage / 2 - 1 ? 1 : 11) + "cm",
        top:
          (29 / (labelsPerPage / 2) + 0.5) * (i % (labelsPerPage / 2)) + "cm",
      };

      const infolines = generateInfolines(u);
      //console.log("Position", pos, i, u.id);
      const barcode = await generateBarcode(u.id!.toString());
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
              <PdfImage
                key={u.id}
                style={styles.image}
                src={"data:image/jpg;base64, " + base64Image}
              />

              {colorbar(u.id)}
              {infolines}
              {barcode}
            </View>
          </View>
        </div>
      );
    })
  );
  return allcodes;
};

async function createUserPDF(user: Array<UserType>) {
  var pdfstream;
  const barcodes = await generateLabels(user);
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
        // four different ways to call: 
        // - start&end for last created user ordered by id
        // - startId & endId for user in ID range
        // - specific id
        // - specific school grade (School grade also works in combination with start / end or startId/endId)
        let printableUsers;
        if ("start" in req.query || "schoolGrade" in req.query) {
          const users = "schoolGrade" in req.query ? (await getAllUsersBySchoolGrade(prisma, req.query.schoolGrade as string)) as any : (await getAllUsersOrderById(prisma)) as any;
          const startUserID = "start" in req.query ? req.query.start : "0";
          const endUserID = "end" in req.query ? req.query.end : users.length - 1;

          printableUsers = users
            .reverse()
            .slice(
              parseInt(startUserID as string),
              parseInt(endUserID as string)
            );

          console.log("Printing labels for users", startUserID, endUserID, printableUsers);
        } else if ("startId" in req.query) {

          let startId = "startId" in req.query ? parseInt(req.query.startId as string) : 0
          let endId = "endId" in req.query ? parseInt(req.query.endId as string) : await countUser(prisma);
          if (startId > endId) {
            console.log("Those fools got start and end mixed up again...");
            const temp = endId;
            endId = startId;
            startId = temp;
          }
          printableUsers = "schoolGrade" in req.query ? await getUsersInIdRangeForSchoolgrade(prisma, startId, endId, req.query.schoolGrade as string) as any :
            await getUsersInIdRange(prisma, startId, endId);
        } else if ("id" in req.query) {
          printableUsers = new Array<any>();
          printableUsers.push(await getUser(prisma, parseInt(req.query.id as string)));
        }
        if (!printableUsers)
          return res.status(400).json({ data: "ERROR: Users  not found" });

        if (printableUsers.length == 0 || printableUsers[0] == null)
          return res.status(400).json({ data: "ERROR: No users match search" });

        const labels = await createUserPDF(printableUsers);
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
