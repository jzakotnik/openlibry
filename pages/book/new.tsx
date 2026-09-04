import BookEditForm from "@/components/book/BookEditForm";
import Layout from "@/components/layout/Layout";
import { getBook } from "@/entities/book";
import { BookType } from "@/entities/BookType";
import { prisma } from "@/entities/db";
import { useBookEditor } from "@/hooks/useBookEditor";
import { t } from "@/lib/i18n";
import { pickCopyableBookFields } from "@/lib/utils/bookCopyFields";
import {
  getDeleteSafetySeconds,
  getUniqueTopics,
} from "@/lib/utils/getUniqueTopics";
import { GetServerSidePropsContext } from "next/types";
import { useEffect } from "react";
import { toast } from "sonner";

interface NewBookProps {
  topics: string[];
  deleteSafetySeconds: number;
  initialIsbn?: string;
  initialBookData?: Partial<BookType> | null;
  copyFromId?: number | null;
}

export default function NewBook({
  topics,
  deleteSafetySeconds,
  initialIsbn,
  initialBookData,
  copyFromId,
}: NewBookProps) {
  const editor = useBookEditor({
    kind: "new",
    initialIsbn,
    initialBookData: initialBookData ?? undefined,
    copyCoverFromId: copyFromId ?? undefined,
  });

  // Let the user know the form was prefilled from an existing book, once,
  // on arrival — the fields themselves already show the copied values.
  useEffect(() => {
    if (initialBookData) {
      toast.info(t("bookPage.toastBookDataCopied"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // copyFrom must be a plain integer — it's used for a DB lookup and later
  // echoed into a filesystem-backed cover path, so reject anything else.
  const rawCopyFrom = context.query.copyFrom;
  const copyFromStr = Array.isArray(rawCopyFrom) ? rawCopyFrom[0] : rawCopyFrom;

  let initialBookData: Partial<BookType> | null = null;
  let copyFromId: number | null = null;

  if (copyFromStr && /^\d+$/.test(copyFromStr)) {
    const sourceId = parseInt(copyFromStr, 10);
    const sourceBook = await getBook(prisma, sourceId);

    if (sourceBook) {
      initialBookData = pickCopyableBookFields(sourceBook as unknown as BookType);
      copyFromId = sourceId;
    }
  }

  return {
    props: {
      topics,
      deleteSafetySeconds,
      initialIsbn,
      initialBookData,
      copyFromId,
    },
  };
}
