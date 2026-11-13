import { useEffect, useState } from "react";

/* True when the visitor's system asks for less motion. Components that move on
   their own (auto-playing carousels, looping drawings) should hold still then. */
export default function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const q = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(q.matches);
    const on = (e) => setReduced(e.matches);
    q.addEventListener("change", on);
    return () => q.removeEventListener("change", on);
  }, []);
  return reduced;
}
