import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import site from "../data/site.json";
import Tag from "../components/Tag";
import ContactCta from "../components/ContactCta";
import FallingTools from "../components/falling-tools/FallingTools";
import ArrowButton from "../components/ArrowButton";
import ProjectModal from "../components/ProjectModal";
import { track } from "../analytics";
import GridGlow from "../components/GridGlow";
import "./Home.css";

export default function Home() {
  const { home } = site;
  const scrollerRef = useRef(null);
  /* The arrows only earn their place when the row actually overflows. Measured
     rather than counted, so they still show on a narrow screen where even
     three cards don't fit. */
  const [canScroll, setCanScroll] = useState(false);
  // The side project shown in the pop-up, or null when it's closed
  const [openProject, setOpenProject] = useState(null);

  /* The graph-paper grid is painted on <body> while the home page is showing, so the
     nav, the page and the footer all sit on one continuous sheet. */
  useEffect(() => {
    document.body.classList.add("has-grid");
    return () => document.body.classList.remove("has-grid");
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const measure = () => setCanScroll(el.scrollWidth > el.clientWidth + 1);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  function scrollProjects(direction) {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * (el.clientWidth * 0.8), behavior: "smooth" });
  }

  return (
    <div className="home">
      <GridGlow />
      <section className="hero">
        <div className="wrap hero-inner">
          <h1 className="hero-title">{home.heroTitle}</h1>
          <p className="hero-subtitle md-body-large">{home.heroSubtitle}</p>
          <div className="hero-actions">
            <a className="btn btn-primary" href={`mailto:${site.contact.email}`}>
              Email
            </a>
            <a
              className="btn btn-secondary"
              href={site.contact.linkedin}
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn
            </a>
          </div>
        </div>
        <FallingTools />
      </section>

      <section className="section">
        <div className="wrap">
          <p className="eyebrow center">{home.sectionEyebrow}</p>
          <h2 className="section-title center">{home.sectionTitle}</h2>
          <div className="case-grid">
            {home.caseStudies.map((cs) => (
              <Link
                key={cs.slug}
                to={`/case-studies/${cs.slug}`}
                className="case-card"
                onClick={() => track("select_case_study", { case_study: cs.title, from: "home" })}
              >
                <div className="case-card-image">
                  <img src={cs.thumb} alt={cs.title} loading="lazy" />
                </div>
                <div className="case-card-body">
                  <h3 className="md-headline-small">{cs.title}</h3>
                  <div className="case-card-tags">
                    {cs.tags.map((tag) => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                  </div>
                  <p className="case-card-desc md-body-medium">{cs.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="making" className="section making">
        <div className="wrap">
          <div className="more-head">
            <div>
              <p className="eyebrow">{home.otherWorkEyebrow}</p>
              <h2 className="section-title more-title">{home.otherWorkTitle}</h2>
            </div>
            <Link to="/projects" className="more-viewall" onClick={() => track("view_all_side_projects")}>
              View all →
            </Link>
          </div>

          <div className="more-scroller" ref={scrollerRef}>
            {home.otherWork.filter((p) => p.title !== "Project title").slice(0, 6).map((item, i) => (
              <button
                type="button"
                className="more-card"
                key={`${item.thumb}-${i}`}
                aria-haspopup="dialog"
                onClick={() => {
                  setOpenProject(item);
                  track("side_project_open", { project: item.title });
                }}
              >
                <span className="more-card-media">
                  <img src={item.thumb} alt="" loading="lazy" />
                </span>
                <span className="more-card-title">{item.title}</span>
              </button>
            ))}
          </div>

          {canScroll && (
            <div className="more-controls">
              <div className="more-arrows">
                <ArrowButton dir="prev" onClick={() => scrollProjects(-1)} aria-label="Scroll to previous projects" />
                <ArrowButton dir="next" onClick={() => scrollProjects(1)} aria-label="Scroll to next projects" />
              </div>
            </div>
          )}
        </div>
      </section>

      <ProjectModal project={openProject} onClose={() => setOpenProject(null)} />

      <ContactCta title={home.ctaTitle} subtitle={home.ctaSubtitle} />
    </div>
  );
}
