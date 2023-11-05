import { PhotoCamera } from "@mui/icons-material";
import { IconButton, Stack } from "@mui/material";

const BookImageUploadButton = (props: any): any => {
  const handleChange = (event: any) => {
    console.log("Received the file for book", event, props.book.id);

    //const reader = new FileReader();
    const { book, setLoadingImage } = props;
    const formData = new FormData();
    const file = event.target.files[0];

    formData.set("cover", file);
    //fetch API to save the newFile

    fetch(process.env.NEXT_PUBLIC_API_URL + "/api/book/cover/" + book.id, {
      method: "POST",
      headers: {
        "Content-length": file.size,
      },
      body: formData, // Here, stringContent or bufferContent would also work
    })
      .then(function (res) {
        return res.json();
      })
      .then(function (json) {
        console.log(json);
        setLoadingImage(Math.floor(Math.random() * 10000));
      });
  };

  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      <IconButton
        color="primary"
        aria-label="upload picture"
        component="label"
        onChange={handleChange}
      >
        <input hidden accept="image/*" type="file" />
        <PhotoCamera />
        <input id="upload-image" hidden accept="image/*" type="file" />
      </IconButton>
    </Stack>
  );
};

export default BookImageUploadButton;
