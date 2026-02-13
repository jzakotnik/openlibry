import { BookType } from "@/entities/BookType";
import { Camera } from "lucide-react";
import { ChangeEvent, useCallback } from "react";
import Resizer from "react-image-file-resizer";

interface BookImageUploadButtonProps {
  book: BookType;
  setLoadingImage: (value: number) => void;
}

const BookImageUploadButton = ({
  book,
  setLoadingImage,
}: BookImageUploadButtonProps) => {
  const resizeFile = (file: File): Promise<Blob> =>
    new Promise((resolve) => {
      Resizer.imageFileResizer(
        file,
        600,
        300,
        "JPEG",
        90,
        0,
        (uri) => resolve(uri as Blob),
        "blob",
        200,
        200,
      );
    });

  const handleChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file || !book.id) return;

      try {
        const resizedImage = await resizeFile(file);
        const formData = new FormData();
        formData.set("cover", resizedImage);

        const response = await fetch(`/api/book/cover/${book.id}`, {
          method: "POST",
          headers: { "Content-Length": file.size.toString() },
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }

        setLoadingImage(Math.floor(Math.random() * 10000));
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    },
    [book.id, setLoadingImage],
  );

  return (
    <label
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-colors"
      data-cy="upload-image-button"
    >
      <Camera className="w-4 h-4" />
      <span>Bild ändern</span>
      <input
        id="upload-image"
        hidden
        accept="image/*"
        type="file"
        onChange={handleChange}
        data-cy="upload-image-input"
      />
    </label>
  );
};

export default BookImageUploadButton;
