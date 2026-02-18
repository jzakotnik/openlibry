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
      <div className="max-w-5xl mx-auto px-4 md:px-6">{children}</div>
      <Footer />
    </div>
  );
}
