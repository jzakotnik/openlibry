import { parse } from "csv-parse/sync";
import { promises as fs } from "fs";
import itemsjs from "itemsjs";
import path from "path";

//no idea how to persist the itemsjs index store somehow

(global as any).searchEngine = null;

export async function createAntolinSearchEngine(refresh: boolean = false) {
  const dirRelativeToPublicFolder = "antolin/antolingesamt.csv";
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
  console.time("searchEngine_build");
  if (!(global as any).searchEngine || refresh) {
    (global as any).searchEngine = itemsjs(records, {
      searchableFields: ["Titel", "Autor"],
    });
    /*console.log(
      "Search engine for Antolin is being built",
      (global as any).searchEngine
    );*/
  }

  console.timeEnd("searchEngine_build");

  return;
}
