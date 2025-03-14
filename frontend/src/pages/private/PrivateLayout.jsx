import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { getTitleFromPath } from "../../utils/getTitleFromPath";

const PrivateLayout = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    // Get the new title based on the current path
    const newTitle = getTitleFromPath(location.pathname);

    // Update the document title if it's different
    if (document.title !== newTitle) {
      document.title = newTitle;
      console.log(
        "Title updated to:",
        newTitle,
        "for path:",
        location.pathname
      );
    }
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-background">
      <Header className="fixed top-0 z-50 w-full" />
      <div className="flex pt-16 flex-1">
        <div className="hidden md:block fixed top-16 bottom-0 w-64">
          <Sidebar />
        </div>
        <main className="flex-1 md:ml-64 overflow-y-auto px-6 py-8 bg-gray-50 dark:bg-muted/40 w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export default PrivateLayout;
