import Layout from "@/components/layout/Layout";
import PrintLabelSelect from "@/components/reports/PrintLabelSelect";
import { BookType } from "@/entities/BookType";
import { useRouter } from "next/router";
import { GetServerSidePropsContext } from "next/types";
import { useState } from "react";

type Props = {
  initialIds: BookType[];
  rows: number;
  columns: number;
};

const GridPage = ({ initialIds, rows, columns }: Props) => {
  const router = useRouter();
  const [startLabel] = useState(
    "start" in router.query ? parseInt(router.query.start as string) : 0,
  );
  const [startId] = useState(
    "startId" in router.query ? parseInt(router.query.startId as string) : 0,
  );
  const [start] = useState(
    "start" in router.query ? parseInt(router.query.start as string) : 0,
  );
  const [endId] = useState(
    "endId" in router.query ? parseInt(router.query.endId as string) : 0,
  );
  const [end] = useState(
    "end" in router.query ? parseInt(router.query.end as string) : 0,
  );
  const [topicsFilter] = useState(
    "topic" in router.query ? (router.query.topic as string) : null,
  );
  const [idFilter] = useState(
    "id" in router.query
      ? Array.isArray(router.query.id)
        ? (router.query.id as string[]).map((e) => parseInt(e))
        : parseInt(router.query.id as string)
      : 0,
  );

  return (
    <Layout>
      <PrintLabelSelect
        initialIds={initialIds}
        rows={rows}
        columns={columns}
        link="/api/report/booklabels"
        startLabel={startLabel}
        startId={startId}
        endId={endId}
        start={start}
        end={end}
        idFilter={idFilter}
        topicsFilter={topicsFilter}
      />
    </Layout>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const BOOKLABEL_ROWSONPAGE = process.env.BOOKLABEL_ROWSONPAGE
    ? Number(process.env.BOOKLABEL_ROWSONPAGE)
    : 5;
  const BOOKLABEL_COLUMNSONPAGE = process.env.BOOKLABEL_COLUMNSONPAGE
    ? Number(process.env.BOOKLABEL_COLUMNSONPAGE)
    : 2;

  return {
    props: {
      rows: BOOKLABEL_ROWSONPAGE,
      columns: BOOKLABEL_COLUMNSONPAGE,
    },
  };
}

export default GridPage;
