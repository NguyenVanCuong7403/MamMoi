import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ADMIN_PATH_PREFIX = "/admin";

export default function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    if (!location.pathname.startsWith(ADMIN_PATH_PREFIX)) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto",
      });
    }
    
    // Emit custom event khi navigation thay đổi để các components có thể reload data
    // location.key thay đổi mỗi khi navigate (bao gồm back/forward)
    window.dispatchEvent(new CustomEvent("mm:navigation:changed", {
      detail: {
        pathname: location.pathname,
        search: location.search,
        key: location.key,
        state: location.state,
      }
    }));
  }, [location.pathname, location.search, location.key]);

  return null;
}