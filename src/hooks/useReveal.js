import { useLayoutEffect } from "react";

/* Reveal on scroll: elements marked `data-reveal` start a little low and transparent, then rise
   into place the first time they come into view. They play once and stay. A `--reveal-delay` set
   on an element (inline style) holds it back, which is how a heading arrives before the cards
   under it, and a row's cards follow one another.

   An element counts as in view once its top is above 92% of the way down the screen, and so does
   anything already scrolled past (an anchor link can land below a few of them). That is checked
   on load, on scroll and on resize, with plain geometry rather than an observer, so it behaves the
   same whether or not the tab is being painted.

   Nothing is hidden unless this runs: the root only gets `reveal-armed` (which is what the CSS
   keys off) once the check is ready, and never for visitors who ask for less motion. The class
   goes on in a layout effect, before the first paint, so there is no flash of unhidden content. */

const LINE = 0.92;

export default function useReveal(rootRef) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    const els = [...root.querySelectorAll("[data-reveal]")];
    let pending = els;
    root.classList.add("reveal-armed");

    const check = () => {
      const line = window.innerHeight * LINE;
      pending = pending.filter((el) => {
        if (el.getBoundingClientRect().top >= line) return true;
        el.classList.add("is-revealed");
        return false;
      });
      if (!pending.length) stop();
    };

    function stop() {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    }

    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    check();

    return () => {
      stop();
      root.classList.remove("reveal-armed");
      els.forEach((el) => el.classList.remove("is-revealed"));
    };
  }, [rootRef]);
}
