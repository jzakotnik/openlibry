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

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
  },
  section: {
    margin: 15,

    padding: 0,
    flexGrow: 0,
    position: "relative", // To position the text over the image
  },
  image: {
    width: "40vw", // Adjust as needed
    height: "auto", // Adjust based on your requirements
  },
  overlayName: {
    position: "absolute",
    top: "75%", // Center vertically, adjust as needed
    left: "3%", // Center horizontally, adjust as needed

    width: "48vw",
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
});

const Label = ({ u }: any) => {
  //console.log(b.id);
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
