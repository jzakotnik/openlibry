import Grid from "@mui/material/Grid";

import { BookType } from "@/entities/BookType";

interface BookPropsType {
  books: Array<BookType>;
}

export default function BookRentalList({ books }: BookPropsType) {
  return (
    <Layout>
      <RentalSearchBar
        handleInputChange={handleInputChange}
        handleNewBook={handleCreateNewBook}
        bookSearchInput={bookSearchInput}
        toggleView={toggleView}
        detailView={detailView}
      />

      <RentalBookContainer renderedBooks={renderedBooks} />
    </Layout>
  );
}
