import { useEffect, useState } from "react";
import DevPanel from "./DevPanel";
import { isDevelopment } from "@/lib/utils";

const DevModeWrapper = ({ children }) => {
  const [showDevTools, setShowDevTools] = useState(false);

  useEffect(() => {
    // Only show dev tools in development mode
    const devMode = isDevelopment();
    console.log("Development mode:", devMode);

    // Add a global flag for development mode
    window.__DEV_MODE__ = devMode;

    setShowDevTools(devMode);
  }, []);

  return (
    <>
      {children}
      {showDevTools && <DevPanel />}
    </>
  );
};

export default DevModeWrapper;
