import { useEffect, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { getCaseStudy, caseStudies } from "../data/caseStudies";
import ContactCta from "../components/ContactCta";
import "./CaseStudy.css";

const UNLOCK_PASSWORD = "0620";

function VideoPlaceholder({ className, label }) {
  return (
    <div className={"cs-video-placeholder" + (className ? " " + className : "")}>
      <span className="cs-video-placeholder-icon">▶</span>
      <span className="cs-video-placeholder-label">{label || "Video Placeholder"}</span>
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

/* ---- Indexed-section renderer (content-rich case studies) ---- */

function Paragraphs({ value }) {
  const items = Array.isArray(value) ? value : [value];
  return items.map((p, i) => <p key={i}>{p}</p>);
}

function ImagePlaceholder({ label }) {
  return (
    <div className="cs-image-placeholder">
      <span className="cs-image-placeholder-icon">🖼</span>
      <span>{label || "Image Placeholder"}</span>
    </div>
  );
}

function Block({ block }) {
  switch (block.type) {
    case "text":
      return <Paragraphs value={block.value} />;

    case "cards":
      return (
        <div className={"cs-cards cs-cards-" + (block.columns || block.items.length)}>
          {block.items.map((item) => (
            <div className="cs-card" key={item.title || item.label}>
              {item.label && <span className="cs-card-label">{item.label}</span>}
              {item.title && <h4>{item.title}</h4>}
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      );

    case "pills":
      return (
        <div className="cs-pill-groups">
          {block.groups.map((g) => (
            <div className="cs-pill-group" key={g.label}>
              <span className="cs-pill-group-label">{g.label}</span>
              <span className="cs-pill-group-value">{g.value}</span>
            </div>
          ))}
        </div>
      );

    case "callout":
      return (
        <div className={"cs-callout" + (block.label ? " cs-callout-invert" : "")}>
          {block.label && <span className="cs-callout-label">{block.label}</span>}
          <p>{block.value}</p>
        </div>
      );

    case "quote":
      return (
        <blockquote className="cs-quote">
          “{block.value}”
          {block.attribution && <cite>— {block.attribution}</cite>}
        </blockquote>
      );

    case "contrast":
      return (
        <div className="cs-contrast">
          {block.items.map((item) => (
            <div className="cs-contrast-item" key={item.label}>
              <span className="cs-contrast-label">{item.label}</span>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      );

    case "stats":
      return (
        <div className="cs-outcomes-grid">
          {block.items.map((item) => (
            <div className="cs-outcome-tile" key={item.label}>
              {item.value && <p className="cs-outcome-value">{item.value}</p>}
              <p className="cs-outcome-label cs-outcome-label-strong">{item.label}</p>
              {item.desc && <p className="cs-outcome-desc">{item.desc}</p>}
            </div>
          ))}
        </div>
      );

    case "image":
      return block.src ? (
        <img className="cs-image" src={block.src} alt={block.label || ""} loading="lazy" />
      ) : (
        <ImagePlaceholder label={block.label} />
      );

    case "video":
      return <VideoPlaceholder label={block.label} />;

    case "step":
      return (
        <div className="cs-step">
          <div className="cs-step-head">
            {block.num && <span className="cs-step-num">{block.num}</span>}
            <h4 className="cs-step-title">{block.title}</h4>
          </div>
          <div className="cs-step-body">
            {block.blocks.map((b, i) => (
              <Block block={b} key={i} />
            ))}
          </div>
        </div>
      );

    default:
      return null;
  }
}

function IndexedSection({ section }) {
  return (
    <section className="cs-row cs-section" id={section.id}>
      <div className="cs-row-label cs-section-label">{section.kicker}</div>
      <div className="cs-section-content">
        <h2 className="cs-section-title">{section.title}</h2>
        {section.blocks.map((b, i) => (
          <Block block={b} key={i} />
        ))}
      </div>
    </section>
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

  const indexItems = study.indexedSections
    ? study.indexedSections.map((s) => s.kicker)
    : ["Index 1", "Index 2", "Index 3", "Index 4", "Index 5", "Index 6"];

  return (
    <article className="case-study">
      <nav className="cs-index wrap" aria-label="Case study index">
        {indexItems.map((label, i) => (
          <span className="cs-index-item" key={label + i}>
            <span className="cs-index-num">{String(i + 1).padStart(2, "0")}</span>
            {label}
          </span>
        ))}
      </nav>

      {study.heroImage ? (
        <div className="wrap">
          <img className="cs-hero-image" src={study.heroImage} alt={study.title} />
        </div>
      ) : (
        study.heroVideo && (
          <div className="wrap">
            <VideoPlaceholder className="cs-hero-image" />
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
          {study.meta ? (
            <div className="cs-meta-row">
              {study.meta.map((m) => (
                <div key={m.label}>
                  <p className="eyebrow">{m.label}</p>
                  <p>{m.value}</p>
                </div>
              ))}
            </div>
          ) : (
            (study.role || study.team || study.timeline || study.platform) && (
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
                {study.platform && (
                  <div>
                    <p className="eyebrow">Platform</p>
                    <p>{study.platform}</p>
                  </div>
                )}
              </div>
            )
          )}

          {study.indexedSections &&
            study.indexedSections.map((s) => <IndexedSection key={s.id} section={s} />)}

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
