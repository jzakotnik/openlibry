/*import { parse } from "csv-parse/sync";
import { promises as fs } from "fs";
import itemsjs from "itemsjs";
import path from "path";
*/
export async function register() {
  console.log("Initialising server..");
  /*const dirRelativeToPublicFolder = "antolin/antolingesamt.csv";
  const dir = path.resolve("./public", dirRelativeToPublicFolder);

  const content = await fs.readFile(dir, "latin1");

  //console.log("Content of the csv", content);
  // Parse the CSV content
  const records = await parse(content, {
    bom: true,
    delimiter: ";",
    columns: true,
    skip_empty_lines: true,
  });

  //figure out if our book is in the antolin DB?

  const searchEngine = itemsjs(records, {
    searchableFields: ["Titel", "Autor"],
  });
  const itemsTitles = searchEngine.search({ query: "Minecraft" });
  console.log("Test Startup", itemsTitles);

  console.log("Initialised itemsjs index");*/
}
