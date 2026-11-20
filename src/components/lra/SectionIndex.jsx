import { useEffect, useRef, useState } from "react";
import { useFrame } from "./frame";

/* SectionIndex — a left rail listing the sections of the step being shown, so a long
   form can be jumped around instead of scrolled. It reads the sections from the page
   itself (every titled `section.lra-section` or review card), so it follows whatever the
   step shows: Host accounts and Offer appear and disappear with the deal, and the rail
   keeps up. The current one tracks the scroll position; clicking one scrolls to it.
   `expected` lists the sections a step will have once the visitor has filled enough in, so the
   rail is there from the start; the ones not on the page yet show dimmed, with `pendingHint`
   saying what brings them in.
   Nothing here blocks anything: it only moves the view. */

const SECTION = "section.lra-section, section.lra-review-card";
const LEAD = 16; // room left above a section after jumping to it

export default function SectionIndex({ bodyRef, contentRef, expected, pendingHint }) {
  const k = useFrame()?.scale || 1; // the frame is scaled, so measured distances are too
  const [items, setItems] = useState([]); // [{ el, label }]
  const [active, setActive] = useState(""); // the current section's label
  // After a click the clicked section stays current until the visitor scrolls by hand: the last
  // sections can't reach the top of the window, so the scroll position alone would pick a later one
  const picked = useRef(false);

  // Read the sections now, and again whenever the step's markup changes
  useEffect(() => {
    const root = contentRef.current;
    if (!root) return undefined;
    let raf = 0;
    const scan = () => {
      const found = [...root.querySelectorAll(SECTION)]
        .map((el) => ({ el, label: el.querySelector("h4")?.textContent.trim() ?? "" }))
        .filter((x) => x.label);
      setItems((prev) =>
        prev.length === found.length && prev.every((p, i) => p.el === found[i].el && p.label === found[i].label)
          ? prev
          : found
      );
    };
    scan();
    const mo = new MutationObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(scan);
    });
    mo.observe(root, { childList: true, subtree: true, characterData: true });
    return () => {
      mo.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [contentRef]);

  // The current section is the last one whose top has passed the top of the window
  useEffect(() => {
    const body = bodyRef.current;
    if (!body || !items.length) return undefined;
    const spy = () => {
      if (picked.current) return;
      const top = body.getBoundingClientRect().top;
      let cur = 0;
      items.forEach((it, i) => {
        if ((it.el.getBoundingClientRect().top - top) / k <= 96) cur = i;
      });
      // at the very bottom the last section counts, even when it is too short to reach the top
      if (body.scrollTop + body.clientHeight >= body.scrollHeight - 2 && body.scrollTop > 0) {
        cur = items.length - 1;
      }
      setActive(items[cur].label);
    };
    const release = () => {
      picked.current = false;
    };
    spy();
    body.addEventListener("scroll", spy, { passive: true });
    for (const t of ["wheel", "touchstart", "pointerdown", "keydown"]) body.addEventListener(t, release, { passive: true });
    return () => {
      body.removeEventListener("scroll", spy);
      for (const t of ["wheel", "touchstart", "pointerdown", "keydown"]) body.removeEventListener(t, release);
    };
  }, [items, k, bodyRef]);

  // the expected sections in order (present or not yet), then anything else the page shows
  const list = expected
    ? [
        ...expected.map((label) => ({ label, el: items.find((x) => x.label === label)?.el ?? null })),
        ...items.filter((x) => !expected.includes(x.label)),
      ]
    : items;
  if (list.length < 2) return null;
  const anyPending = list.some((x) => !x.el);

  const jump = (label) => {
    const body = bodyRef.current;
    const el = items.find((x) => x.label === label)?.el;
    if (!body || !el || !el.isConnected) return;
    const dy = (el.getBoundingClientRect().top - body.getBoundingClientRect().top) / k;
    body.scrollTo({ top: body.scrollTop + dy - LEAD, behavior: "smooth" });
    picked.current = true;
    setActive(label);
  };

  return (
    <nav className="lra-index" aria-label="Steps">
      <p className="lra-index-title">Steps</p>
      <ol>
        {list.map((it) => {
          const pending = !it.el;
          const current = !pending && it.label === (active || items[0]?.label);
          return (
            <li key={it.label}>
              <button
                type="button"
                className={current ? "is-current" : pending ? "is-pending" : ""}
                aria-current={current ? "location" : undefined}
                aria-disabled={pending || undefined}
                title={pending ? pendingHint : undefined}
                onClick={() => !pending && jump(it.label)}
              >
                {it.label}
              </button>
            </li>
          );
        })}
      </ol>
      {anyPending && pendingHint && <p className="lra-index-hint">{pendingHint}</p>}
    </nav>
  );
}
