import { useEffect, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { getCaseStudy, caseStudies } from "../data/caseStudies";
import Tag from "../components/Tag";
import ContactCta from "../components/ContactCta";
import "./CaseStudy.css";

const UNLOCK_PASSWORD = "0620";

function VideoPlaceholder({ className }) {
  return (
    <div className={"cs-video-placeholder" + (className ? " " + className : "")}>
      <span className="cs-video-placeholder-icon">▶</span>
      <span className="cs-video-placeholder-label">Video Placeholder</span>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="cs-row">
      <div className="cs-row-label">{label}</div>
      <div className="cs-row-content">{children}</div>
    </div>
  );
}

function StatGrid({ stats }) {
  return (
    <div className="cs-outcomes-grid">
      {stats.map((stat) => (
        <div className="cs-outcome-tile" key={stat.label}>
          <p className="cs-outcome-value">{stat.value}</p>
          <p className="cs-outcome-label">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

function Section({ section }) {
  return (
    <Row label={section.title}>
      {section.text && <p>{section.text}</p>}
      {section.list && (
        <ul className="cs-list">
          {section.list.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
      {section.points && (
        <div className="cs-points">
          {section.points.map((point) => (
            <div className="cs-point" key={point.title}>
              <h4>{point.title}</h4>
              <p>{point.desc}</p>
            </div>
          ))}
        </div>
      )}
      {section.image && <img className="cs-image" src={section.image} alt={section.title} loading="lazy" />}
      {section.image2 && <img className="cs-image" src={section.image2} alt="" loading="lazy" />}
      {section.image3 && <img className="cs-image" src={section.image3} alt="" loading="lazy" />}
      {section.video && <VideoPlaceholder />}
      {section.gallery && (
        <div className="cs-gallery">
          {section.gallery.map((src) => (
            <img key={src} src={src} alt="" loading="lazy" />
          ))}
        </div>
      )}
    </Row>
  );
}

export default function CaseStudy() {
  const { slug } = useParams();
  const study = getCaseStudy(slug);

  const [unlocked, setUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  useEffect(() => {
    setPasswordInput("");
    setPasswordError(false);
    if (study?.protected) {
      setUnlocked(localStorage.getItem(`unlocked:${study.slug}`) === "true");
    } else {
      setUnlocked(false);
    }
  }, [slug]);

  if (!study) return <Navigate to="/" replace />;

  const isLocked = Boolean(study.protected && !unlocked);

  function handleUnlockSubmit(e) {
    e.preventDefault();
    if (passwordInput === UNLOCK_PASSWORD) {
      localStorage.setItem(`unlocked:${study.slug}`, "true");
      setUnlocked(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  }

  const otherLinks = (study.otherProjects || [])
    .map((title) => caseStudies.find((cs) => cs.title === title))
    .filter(Boolean);

  return (
    <article className="case-study">
      <header className="cs-header">
        <div className="wrap">
          <Link to="/" className="cs-back">
            ← Back home
          </Link>
          <p className="eyebrow center cs-eyebrow">Case Study</p>
          <h1>{study.title}</h1>
          <p className="cs-subtitle">{study.subtitle}</p>
          <div className="cs-tags">
            {study.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        </div>
      </header>

      {study.heroVideo ? (
        <div className="wrap">
          <VideoPlaceholder className="cs-hero-image" />
        </div>
      ) : (
        study.heroImage && (
          <div className="wrap">
            <img className="cs-hero-image" src={study.heroImage} alt={study.title} />
          </div>
        )
      )}

      {isLocked ? (
        <div className="wrap">
          <div className="cs-protected">
            <span className="cs-protected-lock">🔒</span>
            <h2>This case study is protected</h2>
            <p>
              This project contains confidential client work. Enter the password to view
              it, or reach out and I'm happy to walk through it directly.
            </p>
            <form className="cs-password-form" onSubmit={handleUnlockSubmit}>
              <input
                type="password"
                inputMode="numeric"
                className="cs-password-input"
                placeholder="Password"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setPasswordError(false);
                }}
                aria-label="Password"
              />
              <button type="submit" className="btn btn-primary">
                Unlock
              </button>
            </form>
            {passwordError && <p className="cs-password-error">Incorrect password — try again.</p>}
            <a className="cs-protected-link" href="mailto:yichun.ux@gmail.com">
              Or request access by email
            </a>
          </div>
        </div>
      ) : (
        <div className="wrap cs-body">
          {(study.role || study.team || study.timeline) && (
            <div className="cs-meta-row">
              {study.role && (
                <div>
                  <p className="eyebrow">Role</p>
                  <p>{study.role}</p>
                </div>
              )}
              {study.timeline && (
                <div>
                  <p className="eyebrow">Timeline</p>
                  <p>{study.timeline}</p>
                </div>
              )}
              {study.team && (
                <div>
                  <p className="eyebrow">Team</p>
                  <p>{study.team}</p>
                </div>
              )}
            </div>
          )}

          {study.context && <Row label="Overview">{study.context}</Row>}

          {study.problemStatement && <Row label="The problem">{study.problemStatement}</Row>}

          {study.challenges && (
            <Row label="Challenges">
              <div className="cs-approach-list">
                {study.challenges.map((c, i) => (
                  <div className="cs-approach-item" key={c.title}>
                    <span className="cs-approach-num">{i + 1}</span>
                    <div>
                      <h4>{c.title}</h4>
                      <p>{c.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Row>
          )}

          {study.challenge && (
            <Row label="The challenge">
              <p>{study.challenge.text}</p>
              {study.challenge.image && (
                <img className="cs-image" src={study.challenge.image} alt="" loading="lazy" />
              )}
            </Row>
          )}

          {study.impactStats && <Row label="Outcomes"><StatGrid stats={study.impactStats} /></Row>}

          {study.features && (
            <Row label="What we shipped">
              {study.featureImage && (
                <img className="cs-image" src={study.featureImage} alt="" loading="lazy" />
              )}
              {study.featureShowcaseImage && (
                <img className="cs-image" src={study.featureShowcaseImage} alt="" loading="lazy" />
              )}
              <div className="cs-shipped-list">
                {study.features.map((f, i) => (
                  <div className={"cs-shipped-item" + (i % 2 === 1 ? " is-reverse" : "")} key={f.title}>
                    <div className="cs-shipped-text">
                      <span className="cs-shipped-num">{String(i + 1).padStart(2, "0")}</span>
                      <h4>{f.title}</h4>
                      <p>{f.desc}</p>
                    </div>
                    <div className="cs-shipped-media">
                      {f.video ? (
                        <VideoPlaceholder />
                      ) : f.image ? (
                        <img src={f.image} alt="" loading="lazy" />
                      ) : (
                        <div className="cs-image-placeholder">Image Placeholder</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Row>
          )}

          {study.sections && study.sections.map((s) => <Section key={s.title} section={s} />)}

          {study.results && (
            <Row label="Outcomes">
              <p>{study.results.text}</p>
              {study.results.bullets && (
                <ul className="cs-list">
                  {study.results.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}
              {study.results.stats && <StatGrid stats={study.results.stats} />}
              {study.results.quote && (
                <blockquote className="cs-quote">
                  “{study.results.quote}”
                  {study.results.quoteAttribution && (
                    <cite>— {study.results.quoteAttribution}</cite>
                  )}
                </blockquote>
              )}
            </Row>
          )}

          {study.reflection && (
            <Row label="Reflection">
              <blockquote className="cs-quote">{study.reflection}</blockquote>
            </Row>
          )}

          {study.deckLink && (
            <Row label="Deck">
              <p>{study.deckLink.text}</p>
              {study.deckLink.image && (
                <img className="cs-image" src={study.deckLink.image} alt="Presentation deck" loading="lazy" />
              )}
            </Row>
          )}
        </div>
      )}

      {otherLinks.length > 0 && (
        <div className="wrap cs-other">
          <p className="eyebrow">Explore my other projects</p>
          <div className="cs-other-links">
            {otherLinks.map((cs) => (
              <Link key={cs.slug} to={`/case-studies/${cs.slug}`} className="cs-other-link">
                {cs.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      <ContactCta />
    </article>
  );
}
