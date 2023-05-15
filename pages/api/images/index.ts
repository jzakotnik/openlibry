import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

type Data = {
  result: Array<string>;
};

export async function getImages() {
  const dirRelativeToPublicFolder = "coverimages";
  const dir = path.resolve("./public", dirRelativeToPublicFolder);
  const filenames = fs.readdirSync(dir);
  /*const images = filenames.map((name) =>
    path.join("/", dirRelativeToPublicFolder, name)
  );*/
  return filenames;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === "GET") {
    try {
      const images = await getImages();
      res.statusCode = 200;
      res.json({ result: images });
    } catch (error) {
      console.log(error);
      res.status(400).json({ result: ["ERROR: " + error] });
    }
  }
}
