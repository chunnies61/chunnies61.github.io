import { useEffect, useRef, useState } from "react";
import { Icon } from "./lra/ui";
import { track } from "../analytics";
// The ap-* styles (media frame, slides, arrows, dots, links) live with the Side projects page
import "../pages/AllProjects.css";

const SLIDE_INTERVAL_MS = 3000;

/* A side project's images: a crossfading slideshow with arrows and dots. It advances
   on its own every 3s (never with reduced motion) and pauses while the pointer is on it. */
export function ProjectMedia({ images, ratio }) {
  const [index, setIndex] = useState(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    if (images.length <= 1) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    const id = setInterval(() => {
      if (!pausedRef.current) setIndex((i) => (i + 1) % images.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [images.length]);

  return (
    <div
      className="ap-media-block"
      onMouseEnter={() => (pausedRef.current = true)}
      onMouseLeave={() => (pausedRef.current = false)}
    >
      <div className="ap-media" style={ratio ? { aspectRatio: ratio } : undefined}>
        {images.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            loading="lazy"
            className={"ap-media-slide" + (i === index ? " is-active" : "")}
          />
        ))}
        {images.length > 1 && (
          <>
            <button
              type="button"
              className="ap-media-arrow is-prev"
              onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)}
              aria-label="Previous image"
            >
              ←
            </button>
            <button
              type="button"
              className="ap-media-arrow is-next"
              onClick={() => setIndex((i) => (i + 1) % images.length)}
              aria-label="Next image"
            >
              →
            </button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="ap-media-dots">
          {images.map((_, i) => (
            <span key={i} className={i === index ? "is-active" : ""} />
          ))}
        </div>
      )}
    </div>
  );
}

// The images to show for a project: its gallery, or its thumbnail on its own
export const projectImages = (item) => (item.images && item.images.length ? item.images : [item.thumb]);

/* "View project website" and "View on Red Dot", when the project has them. `from` says
   where the click happened (the Side projects page or the home page pop-up). */
export function ProjectLinks({ item, from }) {
  if (!item.link && !item.award?.link) return null;
  return (
    <div className="ap-links">
      {item.link && (
        <a
          className="ap-learn-more"
          href={item.link}
          target="_blank"
          rel="noreferrer"
          onClick={() => track("side_project_link", { project: item.title, link: "website", from })}
        >
          View project website
          <Icon name="openInNew" size={16} />
        </a>
      )}
      {item.award?.link && (
        <a
          className="ap-learn-more"
          href={item.award.link}
          target="_blank"
          rel="noreferrer"
          onClick={() => track("side_project_link", { project: item.title, link: "red dot", from })}
        >
          View on Red Dot
          <Icon name="openInNew" size={16} />
        </a>
      )}
    </div>
  );
}
