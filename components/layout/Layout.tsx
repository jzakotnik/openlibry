import Container from "@mui/material/Container";

import Footer from "./Footer";
import TopBar from "./TopBar";

interface LayoutProps {
  publicView?: boolean;
  children: React.ReactNode;
}

export default function Layout({ publicView = false, children }: LayoutProps) {
  return (
    <div>
      {publicView ? "" : <TopBar />}
      <Container maxWidth="lg">{children}</Container>
      <Footer />
    </div>
  );
}
