import { useEffect, useRef, useState } from "react";
import site from "../data/site.json";
import ContactCta from "../components/ContactCta";
import "./AllProjects.css";

const PROJECT_LIMIT = 6;
const SLIDE_INTERVAL_MS = 3000;

function ProjectMedia({ images }) {
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
      className="ap-media"
      onMouseEnter={() => (pausedRef.current = true)}
      onMouseLeave={() => (pausedRef.current = false)}
    >
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
        <div className="ap-media-dots">
          {images.map((_, i) => (
            <span key={i} className={i === index ? "is-active" : ""} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AllProjects() {
  const { home } = site;
  const projects = home.otherWork.slice(0, PROJECT_LIMIT);

  return (
    <article className="all-projects">
      <header className="ap-header">
        <div className="wrap">
          <p className="eyebrow center">{home.otherWorkEyebrow}</p>
          <h1>{home.otherWorkTitle}</h1>
        </div>
      </header>

      <div className="wrap">
        <div className="ap-list">
          {projects.map((item, i) => (
            <div className="ap-row" key={`${item.thumb}-${i}`}>
              <div className="ap-title">
                <h3>{item.title}</h3>
              </div>
              <p className="ap-desc">Project description placeholder — details coming soon.</p>
              <ProjectMedia images={item.images && item.images.length ? item.images : [item.thumb]} />
            </div>
          ))}
        </div>
      </div>

      <ContactCta />
    </article>
  );
}
