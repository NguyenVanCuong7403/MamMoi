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
  }, [location.pathname, location.search]);

  return null;
}