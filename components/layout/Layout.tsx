import Container from "@mui/material/Container";

import TopBar from "./TopBar";
import Footer from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div>
      <TopBar />
      <Container maxWidth="lg">{children}</Container>
      <Footer />
    </div>
  );
}
