import { useRef } from "react";
import { Link } from "react-router-dom";
import site from "../data/site.json";
import Tag from "../components/Tag";
import ContactCta from "../components/ContactCta";
import FallingTools from "../components/falling-tools/FallingTools";
import "./Home.css";

export default function Home() {
  const { home } = site;
  const scrollerRef = useRef(null);

  function scrollProjects(direction) {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * (el.clientWidth * 0.8), behavior: "smooth" });
  }

  return (
    <div className="home">
      <section className="hero">
        <div className="wrap hero-inner">
          <h1 className="hero-title">{home.heroTitle}</h1>
          <p className="hero-subtitle">{home.heroSubtitle}</p>
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
          <p className="eyebrow">{home.sectionEyebrow}</p>
          <h2 className="section-title">{home.sectionTitle}</h2>
          <div className="case-grid">
            {home.caseStudies.map((cs) => (
              <Link
                key={cs.slug}
                to={`/case-studies/${cs.slug}`}
                className="case-card"
              >
                <div className="case-card-image">
                  <img src={cs.thumb} alt={cs.title} loading="lazy" />
                  {cs.locked && <span className="case-card-lock">🔒</span>}
                </div>
                <div className="case-card-body">
                  <div className="case-card-tags">
                    {cs.tags.map((tag) => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                  </div>
                  <h3>{cs.title}</h3>
                  <p className="case-card-desc">{cs.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="more-head">
            <div>
              <p className="eyebrow">{home.otherWorkEyebrow}</p>
              <h2 className="section-title more-title">{home.otherWorkTitle}</h2>
            </div>
            <Link to="/projects" className="more-viewall">
              View all →
            </Link>
          </div>

          <div className="more-scroller" ref={scrollerRef}>
            {home.otherWork.map((item, i) => (
              <div className="more-card" key={`${item.thumb}-${i}`}>
                <div className="more-card-media">
                  <img src={item.thumb} alt="" loading="lazy" />
                </div>
                <p className="more-card-title">{item.title}</p>
              </div>
            ))}
          </div>

          <div className="more-controls">
            <div className="more-arrows">
              <button
                type="button"
                className="more-arrow"
                onClick={() => scrollProjects(-1)}
                aria-label="Scroll to previous projects"
              >
                ←
              </button>
              <button
                type="button"
                className="more-arrow"
                onClick={() => scrollProjects(1)}
                aria-label="Scroll to next projects"
              >
                →
              </button>
            </div>
            <span className="more-hint">Scroll or drag to browse</span>
          </div>
        </div>
      </section>

      <ContactCta title={home.ctaTitle} subtitle={home.ctaSubtitle} />
    </div>
  );
}
