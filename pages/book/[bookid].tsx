import BookEditForm from "@/components/book/BookEditForm";
import Layout from "@/components/layout/Layout";
import { getBook } from "@/entities/book";
import { BookType } from "@/entities/BookType";
import { prisma } from "@/entities/db";
import { useBookEditor } from "@/hooks/useBookEditor";
import { replaceBookDateString } from "@/lib/utils/dateutils";
import {
  getDeleteSafetySeconds,
  getUniqueTopics,
} from "@/lib/utils/getUniqueTopics";
import { Typography } from "@mui/material";
import { useRouter } from "next/router";
import { GetServerSidePropsContext } from "next/types";

interface BookDetailProps {
  book: BookType;
  topics: string[];
  deleteSafetySeconds: number;
}

export default function BookDetail({
  book,
  topics,
  deleteSafetySeconds,
}: BookDetailProps) {
  const router = useRouter();

  if (!router.query.bookid) {
    return (
      <Layout>
        <Typography>ID not found</Typography>
      </Layout>
    );
  }

  const editor = useBookEditor({ kind: "edit", book });

  return (
    <Layout>
      <BookEditForm
        book={editor.bookData}
        setBookData={editor.setBookData}
        isNewBook={false}
        deleteBook={editor.handleDelete}
        deleteSafetySeconds={deleteSafetySeconds}
        saveBook={editor.handleSave}
        topics={topics}
        antolinResults={editor.antolinResults}
        isSaving={editor.isSaving}
      />
    </Layout>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const deleteSafetySeconds = getDeleteSafetySeconds();

  const dbbook = await getBook(prisma, parseInt(context.query.bookid as any));
  if (!dbbook) {
    return { notFound: true };
  }

  const book = replaceBookDateString(dbbook as any);
  if (!("id" in book) || !book.id) {
    return { notFound: true };
  }

  const topics = await getUniqueTopics(prisma);

  return { props: { book, topics, deleteSafetySeconds } };
}
