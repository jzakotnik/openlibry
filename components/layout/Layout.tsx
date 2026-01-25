import Container from "@mui/material/Container";

import Footer from "./Footer";
import TopBar from "./TopBar";

interface LayoutProps {
  publicView?: boolean;
  showAdminButton?: boolean;
  children: React.ReactNode;
}

export default function Layout({
  publicView = false,
  showAdminButton = true,
  children,
}: LayoutProps) {
  return (
    <div>
      {!publicView && <TopBar showAdminButton={showAdminButton} />}
      <Container maxWidth="lg">{children}</Container>
      <Footer />
    </div>
  );
}
