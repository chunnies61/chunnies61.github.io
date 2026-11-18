import { useEffect, useRef, useState } from "react";
import usePrefersReducedMotion from "../hooks/usePrefersReducedMotion";
import "./Reveal.css";

/* A card that swings into place when it scrolls into view, after the "What's included"
   cards on loopsii.com: it starts tipped back (rotateX -65deg), pushed 500px away and
   transparent, hinged on its top edge, and eases forward over 0.9s. It starts as soon as
   its top edge enters the viewport. Siblings in the same row are staggered by 50ms steps.

   Once the move is over the reveal classes are removed, so the card's own hover styles take
   over again.
   Visitors who ask for reduced motion just get the card, with no movement. */

const EASE_MS = 900;

export default function Reveal({ as: Tag = "div", index = 0, cols = 3, className = "", style, children, ...rest }) {
  const ref = useRef(null);
  const reduced = usePrefersReducedMotion();
  const [phase, setPhase] = useState("hidden");   // hidden → in → done
  const delay = (index % cols) * 50;

  useEffect(() => {
    if (reduced) { setPhase("done"); return undefined; }
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) { setPhase("done"); return undefined; }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setPhase((p) => (p === "hidden" ? "in" : p)); io.disconnect(); }
    });
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  useEffect(() => {
    if (phase !== "in") return undefined;
    const t = setTimeout(() => setPhase("done"), EASE_MS + delay + 80);
    return () => clearTimeout(t);
  }, [phase, delay]);

  const cls = [className, phase === "done" ? "" : "reveal", phase === "hidden" ? "is-hidden" : phase === "in" ? "is-in" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag ref={ref} className={cls} style={{ "--rd": `${delay}ms`, ...style }} {...rest}>
      {children}
    </Tag>
  );
}
