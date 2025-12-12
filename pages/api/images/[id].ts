import { existsSync, promises as fs } from "fs";
import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!req.query.id) return res.status(404).end(`${req.query} id not found`);
  const id = parseInt(req.query.id as string); //this should be the filename of the image
  const fileName = id + ".jpg";

  switch (req.method) {
    /*

    TODO, implement delete image one day...

    case "DELETE":
    
    try {
        const deleteResult = await deleteUser(prisma, id);

        res.status(200).json(deleteResult);
      } catch (error) {
        console.log(error);
        res.status(400).json({ data: "ERROR DELETE: " + error });
      }
      break;

    
*/
    case "GET":
      try {
        if (!existsSync(process.env.COVERIMAGE_FILESTORAGE_PATH!)) {
          res.status(400).json({
            data: "ERROR: Book cover path does not exist?",
          });
        }
        const filePath = path.join(
          process.env.COVERIMAGE_FILESTORAGE_PATH!,
          "/",
          fileName
        );
        const defaultFilePath = path.join(
          process.env.COVERIMAGE_FILESTORAGE_PATH!,
          "/",
          "default.jpg"
        );
        if (existsSync(filePath)) {
          //console.log("Reading cover file");
          const imageFile = await fs.readFile(filePath);
          //console.log("Read image file", imageFile);
          res.setHeader("Content-Type", "image/jpg");
          res.status(200).send(imageFile);
        } else if (existsSync(defaultFilePath)) {
          const imageBuffer = await fs.readFile(defaultFilePath);
          //console.log("Read default image file");
          res.setHeader("Content-Type", "image/jpg");
          res.status(200).send(imageBuffer);
        }
      } catch (error) {
        console.log(error);
        res.status(400).json({
          data: "ERROR: Book Cover error",
        });
      }
      break;

    default:
      res.status(405).end(`${req.method} Not Allowed`);
      break;
  }
}
