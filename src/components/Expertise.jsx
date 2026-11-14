import { useEffect, useRef } from "react";
import data from "../data/expertise.json";
import usePrefersReducedMotion from "../hooks/usePrefersReducedMotion";
import "./Expertise.css";

/* Expertise — two rows of small chips in the About intro panel. Each row drifts on
   its own, the second the other way, and loops seamlessly because its chips are
   listed twice. Visitors can swipe, scroll or drag a row too; it picks up drifting
   again a moment after they let go. With reduced motion the rows only move by hand. */

const SPEED = 14; // px per second
const RESUME_AFTER = 1600; // ms after the last touch, drag or scroll

function Row({ items, reverse, still }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const half = () => el.scrollWidth / 2;
    let pos = reverse ? half() : 0;
    let set = pos; // the last scrollLeft we wrote, to tell our scrolls from the visitor's
    let holdUntil = 0;
    let last = performance.now();
    let raf = 0;
    let drag = null;

    const write = (x) => {
      const h = half();
      if (h > 0) x = ((x % h) + h) % h;
      pos = x;
      el.scrollLeft = x;
      set = el.scrollLeft;
    };
    write(pos);

    const tick = (now) => {
      const dt = Math.min(now - last, 64) / 1000;
      last = now;
      if (!drag && now > holdUntil) write(pos + (reverse ? -1 : 1) * SPEED * dt);
      raf = requestAnimationFrame(tick);
    };

    const hold = () => {
      holdUntil = performance.now() + RESUME_AFTER;
    };
    // The visitor scrolled (wheel, trackpad or swipe): follow them and keep the loop endless
    const onScroll = () => {
      if (Math.abs(el.scrollLeft - set) < 2) return;
      hold();
      write(el.scrollLeft);
    };
    // Mouse drag; touch already scrolls natively
    const onDown = (e) => {
      if (e.pointerType !== "mouse") return hold();
      drag = { x: e.clientX, start: el.scrollLeft };
      el.setPointerCapture(e.pointerId);
      el.classList.add("is-dragging");
    };
    const onMove = (e) => {
      if (drag) write(drag.start - (e.clientX - drag.x));
    };
    const onUp = () => {
      drag = null;
      el.classList.remove("is-dragging");
      hold();
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    if (!still) raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
    };
  }, [reverse, still]);

  return (
    <div className="ex-row" ref={ref}>
      <ul className="ex-track">
        {[...items, ...items].map((t, i) => (
          <li className="ex-chip" key={i} aria-hidden={i >= items.length || undefined}>
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Expertise() {
  const still = usePrefersReducedMotion();
  return (
    <div className="ex">
      <p className="ex-label">{data.label}</p>
      <div className="ex-rows">
        {data.rows.map((items, i) => (
          <Row key={i} items={items} reverse={i % 2 === 1} still={still} />
        ))}
      </div>
    </div>
  );
}
