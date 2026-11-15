import { useEffect, useRef } from "react";
import usePrefersReducedMotion from "../hooks/usePrefersReducedMotion";

/* A muted, looping video that plays only while it's on screen: it starts from the top
   the first time a visitor scrolls to it, pauses when it leaves, and picks up again when
   it comes back. Nothing downloads beyond the first frame until then. Visitors who ask
   for less motion get the first frame and the player's own controls instead. */

const VISIBLE = 0.4; // share of the video that has to be on screen

export default function InViewVideo({ src, className }) {
  const ref = useRef(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const video = ref.current;
    if (!video || reduced) return undefined;
    if (!("IntersectionObserver" in window)) {
      video.play().catch(() => {});
      return undefined;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= VISIBLE) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: [0, VISIBLE, 1] }
    );
    io.observe(video);
    return () => {
      io.disconnect();
      video.pause();
    };
  }, [reduced, src]);

  return (
    <video
      ref={ref}
      className={className}
      // the time fragment makes iOS Safari paint the first frame before playback
      src={`${src}#t=0.001`}
      preload="metadata"
      loop
      muted
      playsInline
      controls={reduced}
    />
  );
}
