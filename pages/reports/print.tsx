import { createTheme } from "@mui/material/styles";

import Layout from "@/components/layout/Layout";

import { ThemeProvider } from "@mui/material/styles";

import { BookType } from "@/entities/BookType";


import PrintLabelSelect from "@/components/reports/PrintLabelSelect";

import { useRouter } from 'next/router';
import { GetServerSidePropsContext } from "next/types";
import { useState } from "react";
// import { useSnackbar } from 'notistack';



const theme = createTheme({
    palette: {
        primary: { main: "#1976d2" },
    },
});




type Props = {
    initialIds: BookType[];
    rows: number;
    columns: number;
};

const GridPage = ({ initialIds, rows, columns }: Props) => {
    const router = useRouter();
    const [startLabel] = useState("start" in router.query ? parseInt(router.query.start as string) : 0);
    const [startId] = useState("startId" in router.query ? parseInt(router.query.startId as string) : 0);
    const [endId] = useState("endId" in router.query ? parseInt(router.query.endId as string) : 0);
    const [topicsFilter] = useState("topic" in router.query
        ? (router.query.topic! as string)
        : null);
    const [idFilter] = useState("id" in router.query ?
        (Array.isArray(router.query.id) ? (router.query.id! as string[]).map((e) => parseInt(e)) : parseInt(router.query.id! as string))
        : 0);

    return (

        <Layout>
            <ThemeProvider theme={theme}>
                <PrintLabelSelect
                    initialIds={initialIds}
                    rows={rows}
                    columns={columns}
                    link="/api/report/booklabels"
                    startLabel={startLabel}
                    startId={startId}
                    endId={endId}
                    idFilter={idFilter}
                    topicsFilter={topicsFilter}>
                </PrintLabelSelect>


            </ThemeProvider>
        </Layout>
    );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
    // const initialIds: BookType[] = [];

    // const { query } = context.query;
    // const bookidsParam = context.query.bookid;

    // // Falls mehrere ?bookids=123&bookids=456 kommt, ist es ein Array
    // const bookIds: number[] = Array.isArray(bookidsParam)
    //     ? bookidsParam.flatMap((entry) => entry.split(',')).map((entry) => parseInt(entry))
    //     : bookidsParam?.split(',').map((entry) => parseInt(entry)) ?? [];

    // console.log("Books to print", bookidsParam, bookIds);
    // const prisma = new PrismaClient();
    // const dbbook = await getRentedBooksForIDList(prisma, bookIds);
    // if (!dbbook) {
    //     return {
    //         notFound: true,
    //     };
    // }

    // dbbook.map((b) => replaceBookDateString(b as any)).forEach((b) => initialIds.push(b));
    // const book = replaceBookDateString(dbbook as any);
    // if (!("id" in book) || !book.id) return; //shouldn't happen
    // initialIds.push(book);

    const BOOKLABEL_ROWSONPAGE = process.env.BOOKLABEL_ROWSONPAGE
        ? Number(process.env.BOOKLABEL_ROWSONPAGE)
        : 5;
    const BOOKLABEL_COLUMNSONPAGE = process.env.BOOKLABEL_COLUMNSONPAGE
        ? Number(process.env.BOOKLABEL_COLUMNSONPAGE)
        : 2;

    // Pass data to the page via props
    return {
        props: {
            // initialIds, 
            rows: BOOKLABEL_ROWSONPAGE, columns: BOOKLABEL_COLUMNSONPAGE
        }
    };


}

export default GridPage;
