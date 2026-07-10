import BookSummaryCard from "@/components/book/BookSummaryCard";
import Layout from "@/components/layout/Layout";
import { BookType } from "@/entities/BookType";
import { PublicBookDetailType } from "@/entities/PublicBookDetailType";
import { PublicBookType } from "@/entities/PublicBookType";
import { translations } from "@/entities/fieldTranslations";
import { t } from "@/lib/i18n";
import { ArrowLeft, BookOpen, Calendar, Hash, Tag, Users } from "lucide-react";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useState } from "react";

function parseTopics(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(";")
    .map((t) => t.trim())
    .filter(Boolean);
}

// =============================================================================
// Sub-components
// =============================================================================

// =============================================================================
// Availability pill (inline — StatusBadge is absolute-positioned for cards)
// =============================================================================

const STATUS_STYLES: Record<string, { bg: string; pulse: boolean }> = {
  available: { bg: "bg-success/90", pulse: true },
  rented: { bg: "bg-destructive/90", pulse: false },
  lost: { bg: "bg-orange-500/90", pulse: false },
  broken: { bg: "bg-yellow-500/90", pulse: false },
  presentation: { bg: "bg-blue-500/90", pulse: false },
  ordered: { bg: "bg-purple-500/90", pulse: false },
  remote: { bg: "bg-slate-500/90", pulse: false },
};

function AvailabilityPill({ rentalStatus }: { rentalStatus: string }) {
  const style = STATUS_STYLES[rentalStatus] ?? STATUS_STYLES.available;
  const label =
    translations.rentalStatus[
      rentalStatus as keyof typeof translations.rentalStatus
    ] ?? rentalStatus;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full
                  shadow-sm text-white text-xs font-semibold uppercase tracking-wide
                  ${style.bg}`}
      role="status"
      aria-label={label}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full bg-white ${style.pulse ? "animate-pulse" : ""}`}
      />
      {label}
    </div>
  );
}

// =============================================================================
// Metadata row
// =============================================================================

interface MetaRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function MetaRow({ icon, label, value }: MetaRowProps) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="text-muted-foreground mt-0.5 shrink-0">{icon}</span>
      <span className="text-muted-foreground shrink-0">{label}:</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}

interface TopicPillProps {
  topic: string;
}

function TopicPill({ topic }: TopicPillProps) {
  return (
    <span
      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                 bg-primary/10 text-primary border border-primary/20
                 hover:bg-primary/20 transition-colors cursor-default"
    >
      {topic}
    </span>
  );
}

// =============================================================================
// Cover image
// =============================================================================

interface BookCoverProps {
  bookId: number;
  title: string;
}

function BookCover({ bookId, title }: BookCoverProps) {
  const [src, setSrc] = useState(`/api/images/${bookId}`);

  const handleError = useCallback(() => {
    setSrc("/coverimages/default.jpg");
  }, []);

  return (
    <div
      className="relative w-full max-w-[280px] mx-auto lg:mx-0 aspect-[2/3]
                 rounded-2xl overflow-hidden
                 shadow-[0_20px_60px_rgba(0,0,0,0.25)]
                 ring-1 ring-black/10"
    >
      <Image
        src={src}
        alt={title}
        fill
        sizes="(max-width: 1024px) 280px, 280px"
        className="object-cover"
        onError={handleError}
        priority
      />
    </div>
  );
}

// =============================================================================
// Related books row
// =============================================================================

interface RelatedBooksSectionProps {
  books: PublicBookType[];
}

function RelatedBooksSection({ books }: RelatedBooksSectionProps) {
  const noop = useCallback(() => {}, []);

  return (
    <section className="mt-12 pt-8 border-t border-border">
      <h2 className="text-xl font-semibold mb-5">
        {t("catalogDetailPage.relatedBooks")}
      </h2>
      {books.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          {t("catalogDetailPage.noRelatedBooks")}
        </p>
      ) : (
        <div
          className="grid gap-3 justify-items-center"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          }}
        >
          {books.map((b) => (
            <BookSummaryCard
              key={b.id}
              book={
                {
                  id: b.id,
                  title: b.title ?? "",
                  author: b.author ?? "",
                  isbn: b.isbn ?? "",
                  topics: b.topics ?? "",
                  rentalStatus: b.rentalStatus,
                  renewalCount: 0,
                } as BookType
              }
              returnBook={noop}
              showDetailsControl={false}
              detailHref={`/catalog/${b.id}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

// =============================================================================
// Page
// =============================================================================

interface CatalogDetailProps {
  book: PublicBookDetailType;
}

export default function CatalogDetailPage({ book }: CatalogDetailProps) {
  const topics = parseTopics(book.topics);

  const ageRange =
    book.minAge && book.maxAge
      ? `${book.minAge}–${book.maxAge}`
      : book.minAge
        ? t("catalogDetailPage.ageFrom", { min: book.minAge })
        : book.maxAge
          ? t("catalogDetailPage.ageUpTo", { max: book.maxAge })
          : null;

  return (
    <>
      <Head>
        <title>{book.title ?? "Buch"} | OpenLibry</title>
      </Head>

      <Layout publicView={true}>
        <div className="py-6 max-w-4xl mx-auto">
          {/* Back link */}
          <Link
            href="/catalog"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground
                       hover:text-foreground transition-colors mb-8 group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            {t("catalogDetailPage.back")}
          </Link>

          {/* Hero: cover + info */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Cover */}
            <div className="shrink-0 lg:w-[280px]">
              <BookCover
                key={book.id}
                bookId={book.id}
                title={book.title ?? "Buch"}
              />
            </div>

            {/* Info */}
            <div className="flex flex-col gap-4 min-w-0">
              {/* Title block */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
                  {book.title}
                </h1>
                {book.subtitle && (
                  <p className="text-lg text-muted-foreground mt-1">
                    {book.subtitle}
                  </p>
                )}
                <p className="text-base text-muted-foreground mt-1">
                  {t("catalogDetailPage.by")} {book.author}
                </p>
              </div>

              {/* Availability status */}
              <AvailabilityPill rentalStatus={book.rentalStatus} />

              {/* Topics */}
              {topics.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {topics.map((topic) => (
                    <TopicPill key={topic} topic={topic} />
                  ))}
                </div>
              )}

              {/* Summary */}
              <div className="mt-1">
                {book.summary ? (
                  <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                    {book.summary}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    {t("catalogDetailPage.noSummary")}
                  </p>
                )}
              </div>

              {/* Metadata grid */}
              <div className="flex flex-col gap-2 mt-2 pt-4 border-t border-border">
                {book.pages != null && (
                  <MetaRow
                    icon={<BookOpen className="h-4 w-4" />}
                    label={t("catalogDetailPage.fieldPages")}
                    value={String(book.pages)}
                  />
                )}
                {book.publisherName && (
                  <MetaRow
                    icon={<Users className="h-4 w-4" />}
                    label={t("catalogDetailPage.fieldPublisher")}
                    value={book.publisherName}
                  />
                )}
                {book.publisherDate && (
                  <MetaRow
                    icon={<Calendar className="h-4 w-4" />}
                    label={t("catalogDetailPage.fieldYear")}
                    value={book.publisherDate}
                  />
                )}
                {ageRange && (
                  <MetaRow
                    icon={<Tag className="h-4 w-4" />}
                    label={t("catalogDetailPage.fieldAge")}
                    value={ageRange}
                  />
                )}
                {book.isbn && (
                  <MetaRow
                    icon={<Hash className="h-4 w-4" />}
                    label={t("catalogDetailPage.fieldIsbn")}
                    value={book.isbn}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Related books */}
          <RelatedBooksSection books={book.relatedBooks} />
        </div>
      </Layout>
    </>
  );
}

// =============================================================================
// Server-side data fetching
// =============================================================================

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const host = context.req.headers.host ?? "localhost:3000";
  const baseUrl = `http://${host}`;

  const id = context.params?.id as string;

  try {
    const res = await fetch(`${baseUrl}/api/public/books/${id}`);

    if (!res.ok) {
      return { notFound: true };
    }

    const book: PublicBookDetailType = await res.json();
    return { props: { book } };
  } catch (error) {
    console.error("Error fetching catalog book detail:", error);
    return { notFound: true };
  }
};
