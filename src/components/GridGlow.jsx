import { useEffect, useRef } from "react";
import usePrefersReducedMotion from "../hooks/usePrefersReducedMotion";
import "./GridGlow.css";

/* The page's graph-paper lines get a stronger blue where the pointer is: a second copy
   of the grid, in a deeper blue, is revealed through a soft round window that follows the
   cursor (with a little easing). Only the line colour changes — no squares are filled.
   The layer covers the whole page and sits behind the content, so the window is placed
   in page coordinates and the lines stay locked to the painted grid while scrolling.
   Skipped for touch screens and for visitors who ask for reduced motion. */

export default function GridGlow() {
  const layer = useRef(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = layer.current;
    if (!el || reduced || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return undefined;

    const client = { x: 0, y: 0 };      // last pointer position in the viewport
    const shown = { x: 0, y: 0 };       // eased position actually drawn, in page coordinates
    let inside = false;
    let raf = 0;

    const frame = () => {
      raf = 0;
      const tx = client.x + window.scrollX;
      const ty = client.y + window.scrollY;
      shown.x += (tx - shown.x) * 0.22;
      shown.y += (ty - shown.y) * 0.22;
      el.style.setProperty("--gx", shown.x.toFixed(1) + "px");
      el.style.setProperty("--gy", shown.y.toFixed(1) + "px");
      if (Math.abs(tx - shown.x) > 0.5 || Math.abs(ty - shown.y) > 0.5) raf = requestAnimationFrame(frame);
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };

    const onMove = (e) => {
      client.x = e.clientX;
      client.y = e.clientY;
      if (!inside) {
        inside = true;
        shown.x = e.clientX + window.scrollX;   // appear under the cursor, don't slide in from 0,0
        shown.y = e.clientY + window.scrollY;
        el.classList.add("is-on");
      }
      kick();
    };
    const onLeave = () => { inside = false; el.classList.remove("is-on"); };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", kick, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", kick);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
      el.classList.remove("is-on");
    };
  }, [reduced]);

  return <div className="grid-glow" ref={layer} aria-hidden="true" />;
}
