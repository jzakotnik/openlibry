import BookEditForm from "@/components/book/BookEditForm";
import Layout from "@/components/layout/Layout";
import { prisma } from "@/entities/db";
import { useBookEditor } from "@/hooks/useBookEditor";
import {
  getDeleteSafetySeconds,
  getUniqueTopics,
} from "@/lib/utils/getUniqueTopics";
import { GetServerSidePropsContext } from "next/types";

interface NewBookProps {
  topics: string[];
  deleteSafetySeconds: number;
  initialIsbn?: string;
}

export default function NewBook({
  topics,
  deleteSafetySeconds,
  initialIsbn,
}: NewBookProps) {
  const editor = useBookEditor({ kind: "new", initialIsbn });

  return (
    <Layout>
      <BookEditForm
        book={editor.bookData}
        setBookData={editor.setBookData}
        isNewBook={true}
        saveBook={editor.handleSave}
        cancelAction={editor.handleCancel}
        deleteBook={() => {}}
        deleteSafetySeconds={deleteSafetySeconds}
        topics={topics}
        antolinResults={null}
        isSaving={editor.isSaving}
        coverPreviewUrl={editor.coverPreviewUrl}
        autofillAttempted={editor.autofillAttempted}
        onAutoFill={editor.handleAutoFill}
        isAutoFilling={editor.isAutoFilling}
      />
    </Layout>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const deleteSafetySeconds = getDeleteSafetySeconds();
  const initialIsbn = (context.query.isbn as string) || null;
  const topics = await getUniqueTopics(prisma);

  return {
    props: { topics, deleteSafetySeconds, initialIsbn },
  };
}
