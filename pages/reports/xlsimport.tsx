import {
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import Button from "@mui/material/Button";
import * as ExcelJS from "exceljs";
import React, { useState } from "react";

export default function XLSImport() {
  const [bookData, setBookData] = useState<any[]>([]);

  const [userData, setUserData] = useState<any[]>([]);

  const DenseTable = ({ data }: any) => {
    console.log("Rendering table", data);
    return (
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
              {data[0].map((d: any, i: number) => {
                return <TableCell key={i}>{d}</TableCell>;
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.slice(1, 10).map((row: any) => (
              <TableRow
                key={row.name}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                {Object.keys(row).map((d: any, i: number) => {
                  return <TableCell key={i}>{row[d]}</TableCell>;
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const convertSheetToJson = (worksheet: any) => {
    const json: any[] = [];
    worksheet.eachRow({ includeEmpty: true }, (row: any, rowNumber: number) => {
      //console.log("Reading row", row);
      const rowValues = row.values as ExcelJS.CellValue[];
      if (rowNumber === 1) {
        // Assuming the first row contains headers
        json.push(rowValues); // Capturing headers
      } else {
        const rowData: any = {};
        rowValues.forEach((value, index) => {
          if (json[0] && json[0][index]) {
            rowData[json[0][index] as string] = value;
          }
        });
        json.push(rowData);
      }
    });
    return json;
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files ? event.target.files[0] : null;
    console.log("Uploading file", event.target.files);
    if (!file) return;

    const workbook = new ExcelJS.Workbook();
    const arrayBuffer = await file.arrayBuffer();
    await workbook.xlsx.load(arrayBuffer);

    const worksheetBooks = workbook.worksheets[0];
    const worksheetUsers = workbook.worksheets[1];
    console.log("Worksheet", worksheetBooks, worksheetUsers);
    const booksJson: any[] = convertSheetToJson(worksheetBooks);
    setBookData(booksJson);
    const usersJson: any[] = convertSheetToJson(worksheetUsers);
    setUserData(usersJson);

    console.log("Imported Excel as JSON", booksJson, usersJson);
  };

  return (
    <div style={{ padding: 20 }}>
      <Button variant="contained" component="label">
        Excel importieren
        <input
          type="file"
          hidden
          accept=".xlsx, .xls"
          onChange={handleFileUpload}
        />
      </Button>
      <Typography color="black">
        Bücher: Zellen eingelesen: {bookData?.length}
      </Typography>

      <Typography color="black">
        {" "}
        Bücher: Spalten eingelesen: {bookData[0]?.length}
      </Typography>
      <Typography color="black">
        User: Zellen eingelesen: {userData?.length}
      </Typography>
      <Typography color="black">
        {" "}
        User: Spalten eingelesen: {userData[0]?.length}
      </Typography>
      <Divider></Divider>
      <Typography variant="caption" color="gray">
        Erste Zeilen der Bücher
      </Typography>
      {bookData.length > 0 ? (
        <DenseTable data={bookData} />
      ) : (
        "Keine Daten verfügbar"
      )}
      <Divider></Divider>
      <Typography variant="caption" color="gray">
        Erste Zeilen der User
      </Typography>
      {userData.length > 0 ? (
        <DenseTable data={userData} />
      ) : (
        "Keine Daten verfügbar"
      )}
    </div>
  );
}
