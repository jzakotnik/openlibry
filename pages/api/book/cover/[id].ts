import type { NextApiRequest, NextApiResponse } from "next";

import formidable from "formidable";

//this is for uploading image covers

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<{
    data: {
      url: string;
    } | null;
    error: string | null;
  }>
) => {
  //console.log("Received this request", req);
  const data = await new Promise((resolve, reject) => {
    //const form = new IncomingForm({  });
    const form = formidable({
      uploadDir: process.env.COVERIMAGE_FILESTORAGE_PATH,
      keepExtensions: true,
    });
    form
      .on("error", function (err) {
        console.log("Error uploading file", err);
        throw err;
      })

      .on("field", function (field, value) {
        console.log("Received file upload", field, value);
      })

      /* this is where the renaming happens */
      .on("fileBegin", function (name, file) {
        const filename = file.filepath.split("/").pop();
        const fileType = filename!.split(".").pop();

        console.log("File to be processed", filename, fileType);
        file.filepath =
          process.env.COVERIMAGE_FILESTORAGE_PATH! +
          "/" +
          req.query.id +
          "." +
          fileType;
      })

      .on("file", function (field, file) {
        console.log("Cover file received", file.filepath);
      })

      .on("progress", function (bytesReceived, bytesExpected) {
        //self.emit('progess', bytesReceived, bytesExpected)

        var percent = ((bytesReceived / bytesExpected) * 100) | 0;
        console.log("Uploading: %" + percent + "\r");
      })

      .on("end", function () {
        console.log("Cover file saved");
      });

    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });

  res.status(200).json({
    data: {
      url: "tbd",
    },
    error: null,
  });
};

export default handler;
