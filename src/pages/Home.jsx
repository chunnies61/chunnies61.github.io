import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import site from "../data/site.json";
import Tag from "../components/Tag";
import ContactCta from "../components/ContactCta";
import FallingTools from "../components/falling-tools/FallingTools";
import ArrowButton from "../components/ArrowButton";
import GridGlow from "../components/GridGlow";
import useReveal from "../hooks/useReveal";
import "./Home.css";

export default function Home() {
  const { home } = site;
  const scrollerRef = useRef(null);
  const rootRef = useRef(null);
  useReveal(rootRef); // the page arrives in layers as it scrolls into view
  /* The arrows only earn their place when the row actually overflows. Measured
     rather than counted, so they still show on a narrow screen where even
     three cards don't fit. */
  const [canScroll, setCanScroll] = useState(false);

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
    <div className="home" ref={rootRef}>
      <GridGlow />
      <section className="hero">
        <div className="wrap hero-inner">
          <h1 className="hero-title" data-reveal>{home.heroTitle}</h1>
          <p className="hero-subtitle md-body-large" data-reveal style={{ "--reveal-delay": "90ms" }}>
            {home.heroSubtitle}
          </p>
          <div className="hero-actions" data-reveal style={{ "--reveal-delay": "180ms" }}>
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
          <p className="eyebrow center" data-reveal>
            {home.sectionEyebrow}
          </p>
          <h2 className="section-title center" data-reveal style={{ "--reveal-delay": "70ms" }}>
            {home.sectionTitle}
          </h2>
          <div className="case-grid">
            {home.caseStudies.map((cs) => (
              <div key={cs.slug} data-reveal>
              <Link to={`/case-studies/${cs.slug}`} className="case-card">
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
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="making" className="section making">
        <div className="wrap">
          <div className="more-head" data-reveal>
            <div>
              <p className="eyebrow">{home.otherWorkEyebrow}</p>
              <h2 className="section-title more-title">{home.otherWorkTitle}</h2>
            </div>
            <Link to="/projects" className="more-viewall">
              View all →
            </Link>
          </div>

          <div className="more-scroller" ref={scrollerRef} data-reveal style={{ "--reveal-delay": "90ms" }}>
            {home.otherWork.filter((p) => p.title !== "Project title").slice(0, 6).map((item, i) => (
              <div className="more-card" key={`${item.thumb}-${i}`}>
                <div className="more-card-media">
                  <img src={item.thumb} alt="" loading="lazy" />
                </div>
                <p className="more-card-title">{item.title}</p>
              </div>
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

      <ContactCta title={home.ctaTitle} subtitle={home.ctaSubtitle} />
    </div>
  );
}
