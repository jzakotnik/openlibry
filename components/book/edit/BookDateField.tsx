import { Grid } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import "dayjs/locale/de";

import { BookType } from "@/entities/BookType";
import { translations } from "@/entities/fieldTranslations";
import { convertDateToDayString, convertStringToDay } from "@/utils/dateutils";
import { Dayjs } from "dayjs";
import { Dispatch } from "react";

type BookDateFieldProps = {
  fieldType: string;
  editable: boolean;
  setBookData: Dispatch<BookType>;
  book: BookType;
};

const convertFromDatePicker = (time: Dayjs): string => {
  return convertDateToDayString(time.toDate());
};

const convertToDatePicker = (time: string): Dayjs => {
  //console.log("Converting time to date picker", time, convertStringToDay(time))
  return convertStringToDay(time);
};

const BookDateField = ({
  fieldType,
  editable,
  setBookData,
  book,
}: BookDateFieldProps): React.ReactElement<any> => {
  return (
    <Grid item xs={12} sm={6} data-cy={"book_" + fieldType + "_datepicker"}>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="de">
        <DesktopDatePicker
          label={(translations["books"] as any)[fieldType]}
          defaultValue={convertToDatePicker((book as any)[fieldType])}
          value={convertToDatePicker((book as any)[fieldType])}
          disabled={!editable}
          onChange={(newValue: Dayjs | null) => {
            if (newValue == null) {
              return;
            } else {
              setBookData({
                ...book,
                [fieldType]: convertFromDatePicker(newValue),
              });
            }
          }}
        />
      </LocalizationProvider>
    </Grid>
  );
};

export default BookDateField;
