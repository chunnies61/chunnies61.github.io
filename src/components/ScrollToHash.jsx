import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/* In-page nav links (/#making, /#about). A client-side route change doesn't
   scroll to its hash on its own, so once the target has rendered, scroll
   to it. Keyed on location.key, so clicking the same link again re-scrolls. */
export default function ScrollToHash() {
  const { hash, key } = useLocation();

  useEffect(() => {
    if (!hash) return;
    let frame;
    let tries = 0;
    const seek = () => {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (el) el.scrollIntoView({ block: "start" });
      else if (tries++ < 60) frame = requestAnimationFrame(seek);
    };
    seek();
    return () => cancelAnimationFrame(frame);
  }, [hash, key]);

  return null;
}
