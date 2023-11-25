import { BookType } from "@/entities/BookType";
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

interface BarcodeGeneratorPropsType {
  books: Array<BookType>;
}

export default function BarcodeGenerator({ books }: BarcodeGeneratorPropsType) {
  // Create styles
  const styles = StyleSheet.create({
    page: {
      flexDirection: "row",
      backgroundColor: "#E4E4E4",
    },
    section: {
      margin: 10,
      padding: 10,
      flexGrow: 1,
    },
  });
  //console.log("Dashboard", users, books, rentals);
  return (
    <div>
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.section}>
            <Text>Section #1</Text>
          </View>
          <View style={styles.section}>
            <Text>Section #2</Text>
          </View>
        </Page>
      </Document>
    </div>
  );
}
