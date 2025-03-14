import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { getTitleFromPath } from "../../utils/getTitleFromPath";

const PublicLayout = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    // Immediately update the title when the location changes
    const newTitle = getTitleFromPath(location.pathname);
    if (document.title !== newTitle) {
      document.title = newTitle;
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background bg-gradient-to-b from-muted/50 via-background to-muted/50 flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
