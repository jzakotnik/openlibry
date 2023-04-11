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
      {/* About page is overriding this in the PageGridSection.tsx to have full width colored background */}
      <Container maxWidth="lg">{children}</Container>
      <Footer />
    </div>
  );
}
