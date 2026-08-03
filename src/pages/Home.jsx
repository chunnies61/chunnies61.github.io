import { Link } from "react-router-dom";
import site from "../data/site.json";
import Tag from "../components/Tag";
import ContactCta from "../components/ContactCta";
import FallingTools from "../components/falling-tools/FallingTools";
import "./Home.css";

export default function Home() {
  const { home } = site;
  return (
    <>
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
          <p className="eyebrow center">{home.sectionEyebrow}</p>
          <h2 className="section-title center">{home.sectionTitle}</h2>
          <div className="case-grid">
            {home.caseStudies.map((cs) => (
              <Link
                key={cs.slug}
                to={`/case-studies/${cs.slug}`}
                className="case-card"
              >
                <div className="case-card-image">
                  <img src={cs.thumb} alt={cs.title} loading="lazy" />
                  {cs.protected && <span className="case-card-lock">🔒</span>}
                </div>
                <div className="case-card-body">
                  <h3>{cs.title}</h3>
                  <div className="case-card-tags">
                    {cs.tags.map((tag) => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                  </div>
                  <p className="case-card-desc">{cs.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <p className="eyebrow center">{home.otherWorkEyebrow}</p>
          <h2 className="section-title center">{home.otherWorkTitle}</h2>
        </div>
        <div className="other-work-carousel">
          <div className="other-work-track">
            {[...home.otherWorkImages, ...home.otherWorkImages].map((src, i) => (
              <div key={`${src}-${i}`} className="other-work-item">
                <img src={src} alt="" loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <ContactCta title={home.ctaTitle} subtitle={home.ctaSubtitle} />
    </>
  );
}
