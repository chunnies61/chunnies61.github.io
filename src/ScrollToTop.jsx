import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const scrollToHash = () => {
        document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth" });
      };
      // Scroll once the target route has rendered, then again shortly after —
      // images loading in on a fresh route mount can shift the layout enough
      // to throw off the first attempt.
      const raf = requestAnimationFrame(scrollToHash);
      const timeout = setTimeout(scrollToHash, 300);
      return () => {
        cancelAnimationFrame(raf);
        clearTimeout(timeout);
      };
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}
