import Container from "@mui/material/Container";
import Navigation from "./Navigation";
import TopBar from "./TopBar";
import Footer from "./Footer";
import { useTheme } from "@mui/material/styles";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import palette from "@/styles/palette";

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
