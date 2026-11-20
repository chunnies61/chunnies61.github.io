import { useEffect, useRef } from "react";
import { ProjectLinks, ProjectMedia, projectImages } from "./SideProject";
import "./ProjectModal.css";

/* A side project in a pop-up, opened from the home page cards: its name and Red Dot
   label, the image slideshow, the description and its outbound links — the same content
   as its row on the Side projects page.

   Built on the native <dialog> in modal mode, so the browser keeps keyboard focus inside
   it, puts it above everything else and closes it on Esc. A click on the dimmed backdrop
   or the close button closes it too, and the page behind stops scrolling while it's open.
   On phones it rises from the bottom as a sheet. */
export default function ProjectModal({ project, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!project || !dialog) return undefined;
    if (!dialog.open) dialog.showModal();
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = prev;
      if (dialog.open) dialog.close();
    };
  }, [project]);

  if (!project) return null;

  const titleId = "project-modal-title";
  return (
    <dialog
      ref={ref}
      className="pm"
      aria-labelledby={titleId}
      onClose={onClose}
      // A click that lands on the <dialog> itself, not its contents, is on the backdrop
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="pm-panel">
        <button type="button" className="pm-close" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <header className="pm-head">
          <h2 className="pm-title md-headline-small" id={titleId}>
            {project.title}
          </h2>
          {project.award && <img className="pm-award" src={project.award.image} alt={project.award.alt} />}
        </header>

        <ProjectMedia key={project.title} images={projectImages(project)} ratio={project.ratio} />

        <div className="pm-body ap-desc">
          {project.desc && project.desc.length ? (
            project.desc.map((p, i) => <p key={i}>{p}</p>)
          ) : (
            <p>Details coming soon.</p>
          )}
          <ProjectLinks item={project} from="home pop-up" />
        </div>
      </div>
    </dialog>
  );
}
