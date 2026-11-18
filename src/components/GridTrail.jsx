import { useEffect, useRef } from "react";
import usePrefersReducedMotion from "../hooks/usePrefersReducedMotion";
import "./GridTrail.css";

/* Makes the page's graph-paper grid answer the pointer: every square the cursor passes
   over lights up in the primary blue and fades out behind it, like a trail. The squares
   are snapped to the same 34px grid that is painted on <body> (see Home.css), in page
   coordinates, so they stay locked to the lines while the page scrolls. The layer sits
   behind the page content. Skipped for touch screens and for visitors who ask for
   reduced motion. */

const CELL = 34;
const MAX_LIVE = 60;

export default function GridTrail() {
  const layer = useRef(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = layer.current;
    if (!el || reduced || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return undefined;

    let lastKey = "";
    const light = (col, row, strong) => {
      if (el.childElementCount >= MAX_LIVE) el.firstElementChild.remove();
      const cell = document.createElement("span");
      cell.className = "grid-trail-cell" + (strong ? " is-strong" : "");
      cell.style.transform = `translate(${col * CELL}px, ${row * CELL}px)`;
      cell.addEventListener("animationend", () => cell.remove(), { once: true });
      el.appendChild(cell);
    };

    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const col = Math.floor((e.clientX - rect.left) / CELL);
      const row = Math.floor((e.clientY - rect.top) / CELL);
      const key = col + "," + row;
      if (key === lastKey) return;
      lastKey = key;
      light(col, row, false);
    };
    const onDown = (e) => {
      const rect = el.getBoundingClientRect();
      light(Math.floor((e.clientX - rect.left) / CELL), Math.floor((e.clientY - rect.top) / CELL), true);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      el.replaceChildren();
    };
  }, [reduced]);

  return <div className="grid-trail" ref={layer} aria-hidden="true" />;
}
