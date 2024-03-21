import { UserType } from "@/entities/UserType";
import { getAllUsers } from "@/entities/user";
import { PrismaClient } from "@prisma/client";
import ReactPDF, {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
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

const styles_old = StyleSheet.create({
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
  usernr: {
    fontSize: 12,
  },
});

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#E4E4E4",
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
    position: "relative", // To position the text over the image
  },
  image: {
    width: "50%", // Adjust as needed
    height: "auto", // Adjust based on your requirements
  },
  overlayText: {
    position: "absolute",
    top: "13%", // Center vertically, adjust as needed
    left: "5%", // Center horizontally, adjust as needed

    color: "black", // Choose text color that contrasts with your image
    fontSize: 15, // Adjust font size as needed
  },
});

const Label = ({ u }: any) => {
  //console.log(b.id);
  return (
    <View style={styles.section}>
      <Image
        style={styles.image}
        src={"data:image/jpg;base64, " + base64Image}
      />
      <Text style={styles.overlayText}>
        {u.firstName + " " + u.lastName} - {"Klasse " + u.schoolGrade}
      </Text>
      <Text style={styles.overlayText}></Text>
    </View>
  );
};

// Create Document Component
const UserLabels = ({ renderedUsers }: any) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {renderedUsers.map((u: any) => {
          //console.log(b);
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

        const labels = await createLabelsPDF(printableUsers);
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
