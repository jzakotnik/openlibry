import { Grid } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import "dayjs/locale/de";

import { translations } from "@/entities/fieldTranslations";
import {
  convertDateToDayString,
  convertStringToDay,
} from "@/utils/convertDateToDayString";

const convertFromDatePicker = (time: any) => {
  return convertDateToDayString(time);
};

const convertToDatePicker = (time: any) => {
  //console.log("Converting time to date picker", time, convertStringToDay(time));

  return convertStringToDay(time);
};

const BookDateField = (props: any): any => {
  const fieldType = props.fieldType;
  const editable = props.editable;
  const setBookData = props.setBookData;
  const book = props.book;
  //console.log("Rendering book", book);
  return (
    <Grid item xs={12} sm={6}>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="de">
        <DatePicker
          label={(translations["books"] as any)[fieldType]}
          defaultValue={convertToDatePicker((book as any)[fieldType])}
          value={convertToDatePicker((book as any)[fieldType])}
          disabled={!editable}
          onChange={(newValue) => {
            console.log("new value", convertFromDatePicker(newValue));
            setBookData({
              ...book,
              [fieldType]: convertFromDatePicker(newValue),
            });
          }}
        />
      </LocalizationProvider>
    </Grid>
  );
};

export default BookDateField;
