import { useCallback, useEffect, useRef, useState } from "react";
import site from "../data/site.json";
import usePrefersReducedMotion from "../hooks/usePrefersReducedMotion";
import ArrowButton from "./ArrowButton";
import "./Testimonials.css";

/* "In their words": quote cards in a row that drifts on by itself and can be taken over by hand.
   Every card sits in one grid cell and is slid sideways by its distance from the active one, so
   the row loops without a seam. Auto-advance waits while the pointer or focus is inside, while the
   tab is hidden or the section is off-screen, and never runs for visitors who ask for less motion. */

const AUTO_MS = 6500;
const SWIPE_PX = 48;

const pad = (n) => String(n).padStart(2, "0");

export default function Testimonials() {
  const { testimonialsEyebrow, testimonialsTitle, testimonials } = site.about;
  const n = testimonials.length;
  const reduced = usePrefersReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const [tabHidden, setTabHidden] = useState(false);
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);
  const rootRef = useRef(null);
  const start = useRef(null);
  const prevOffsets = useRef(null);

  const go = useCallback((i) => setActive(((i % n) + n) % n), [n]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || !("IntersectionObserver" in window)) return undefined;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reduced || paused || tabHidden || !visible || dragging) return undefined;
    const t = setTimeout(() => go(active + 1), AUTO_MS);
    return () => clearTimeout(t);
  }, [active, reduced, paused, tabHidden, visible, dragging, go]);

  useEffect(() => {
    const onVis = () => setTabHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const onKey = (e) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); go(active - 1); }
    if (e.key === "ArrowRight") { e.preventDefault(); go(active + 1); }
  };

  const onDown = (e) => {
    if (e.target.closest("button")) return;
    start.current = { x: e.clientX, id: e.pointerId };
    setDragging(true);
  };
  const onMove = (e) => {
    if (!start.current) return;
    setDrag(e.clientX - start.current.x);
  };
  const onUp = (e) => {
    if (!start.current) return;
    const dx = e.clientX - start.current.x;
    start.current = null;
    setDragging(false);
    setDrag(0);
    if (dx <= -SWIPE_PX) go(active + 1);
    else if (dx >= SWIPE_PX) go(active - 1);
  };

  // Shortest signed distance from the active card, so the row wraps around
  const offset = (i) => {
    let o = (i - active + n) % n;
    if (o > n / 2) o -= n;
    return o;
  };

  const offsets = testimonials.map((_, i) => offset(i));
  const before = prevOffsets.current;
  useEffect(() => { prevOffsets.current = offsets; });

  return (
    <section
      className="tm"
      ref={rootRef}
      aria-roledescription="carousel"
      aria-label={testimonialsTitle}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="wrap">
        <p className="eyebrow center">{testimonialsEyebrow}</p>
        <h2 className="section-title center">{testimonialsTitle}</h2>
      </div>

      <div
        className={`tm-stage${dragging ? " is-dragging" : ""}`}
        tabIndex={0}
        onKeyDown={onKey}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onPointerLeave={onUp}
        style={{ "--drag": `${drag}px` }}
      >
        {testimonials.map((t, i) => {
          const o = offsets[i];
          const isActive = o === 0;
          // a card that wraps from one end to the other must not slide across the stage
          const wraps = before ? Math.abs(o - before[i]) > 1 : false;
          return (
            <article
              key={t.name}
              className={`tm-card${isActive ? " is-active" : ""}`}
              style={{ "--o": o }}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${n}`}
              aria-hidden={!isActive}
              onClick={() => !isActive && Math.abs(drag) < 6 && go(i)}
              data-wrap={wraps ? "1" : undefined}
            >
              {t.photo ? (
                <img className="tm-photo" src={t.photo} alt="" draggable="false" width="160" height="160" />
              ) : (
                <span className="tm-photo tm-initials" style={{ background: t.avatarBg, color: t.avatarInk }} aria-hidden="true">
                  {t.initials}
                </span>
              )}
              <p className="tm-quote">&ldquo;{t.quote}&rdquo;</p>
              <div className="tm-person">
                <p className="tm-name">{t.name}</p>
                <p className="tm-role">{t.title}</p>
              </div>
              {isActive && (
                <>
                  <span className="tm-corner tl" /><span className="tm-corner tr" />
                  <span className="tm-corner bl" /><span className="tm-corner br" />
                </>
              )}
            </article>
          );
        })}
      </div>

      <div className="tm-controls">
        <ArrowButton dir="prev" aria-label="Previous testimonial" onClick={() => go(active - 1)} />
        <span className="tm-count" aria-live="polite">{pad(active + 1)} / {pad(n)}</span>
        <ArrowButton dir="next" aria-label="Next testimonial" onClick={() => go(active + 1)} />
      </div>
    </section>
  );
}
