import Container from "@mui/material/Container";

import Footer from "./Footer";
import TopBar from "./TopBar";

interface LayoutProps {
  publicView?: boolean;
  showBackupButton?: boolean;
  children: React.ReactNode;
}

export default function Layout({
  publicView = false,
  showBackupButton = true,
  children,
}: LayoutProps) {
  return (
    <div>
      {!publicView && <TopBar showBackupButton={showBackupButton} />}
      <Container maxWidth="lg">{children}</Container>
      <Footer />
    </div>
  );
}
