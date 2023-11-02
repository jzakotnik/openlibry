import fs from "fs";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  result: Array<string>;
};

//TODO change this to the env folder
export async function getImages() {
  const dirRelativeToPublicFolder = "coverimages";
  //const dir = path.resolve("./public", dirRelativeToPublicFolder);
  const dir = process.env.COVERIMAGE_FILESTORAGE_PATH;
  const filenames = fs.readdirSync(dir!);
  return filenames;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === "GET") {
    try {
      const images = await getImages();
      console.log("Found these images", images);
      res.statusCode = 200;
      res.json({ result: images });
    } catch (error) {
      console.log(error);
      res.status(400).json({ result: ["ERROR: " + error] });
    }
  }
}
