import { useEffect, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { getCaseStudy, caseStudies } from "../data/caseStudies";
import site from "../data/site.json";
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

function renderHighlighted(text) {
  const parts = text.split(/(==.+?==)/g);
  if (parts.length === 1) return text;
  return parts.map((part, i) => {
    const match = part.match(/^==(.+)==$/);
    return match ? (
      <mark className="cs-highlight" key={i}>
        {match[1]}
      </mark>
    ) : (
      part
    );
  });
}

function Paragraphs({ value }) {
  const items = Array.isArray(value) ? value : [value];
  return items.map((p, i) => <p key={i}>{renderHighlighted(p)}</p>);
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
        <div
          className={
            "cs-cards cs-cards-" +
            (block.columns || block.items.length) +
            (block.variant ? " cs-cards--" + block.variant : "")
          }
        >
          {block.items.map((item) => (
            <div className="cs-card" key={item.title || item.label}>
              {item.label && <span className="cs-card-label">{item.label}</span>}
              {item.title && <h4>{item.title}</h4>}
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      );

    case "honest-note":
      return (
        <div className="cs-honest-note">
          <span className="cs-honest-note-label">Honest note</span>
          <p>{renderHighlighted(block.value)}</p>
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
          <p>{renderHighlighted(block.value)}</p>
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
            <h4 className="cs-step-title">{renderHighlighted(block.title)}</h4>
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
    <section
      className={"cs-row cs-section" + (section.variant ? " cs-section--" + section.variant : "")}
      id={section.id}
    >
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

  const nextCaseStudy = otherLinks[0]
    ? {
        ...otherLinks[0],
        ...site.home.caseStudies.find((cs) => cs.slug === otherLinks[0].slug),
      }
    : null;

  const indexItems = study.indexedSections
    ? study.indexedSections.map((s) => ({ id: s.id, label: s.kicker }))
    : ["Index 1", "Index 2", "Index 3", "Index 4", "Index 5", "Index 6"].map((label) => ({
        id: null,
        label,
      }));

  const [activeId, setActiveId] = useState(indexItems[0]?.id ?? null);

  useEffect(() => {
    setActiveId(indexItems[0]?.id ?? null);
    if (!study?.indexedSections?.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 }
    );

    study.indexedSections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [slug]);

  return (
    <article className={"case-study case-study--" + study.slug}>
      <nav className="cs-index wrap" aria-label="Case study index">
        <Link to="/" className="cs-index-back">
          ← Back to work
        </Link>
        <div className="cs-index-items">
          {indexItems.map((item, i) => {
            const isActive = item.id !== null && item.id === activeId;
            const content = item.label;
            return item.id ? (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={"cs-index-item" + (isActive ? " is-active" : "")}
              >
                {content}
              </a>
            ) : (
              <span className="cs-index-item" key={item.label + i}>
                {content}
              </span>
            );
          })}
        </div>
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
          {(() => {
            const metaItems =
              study.meta ||
              [
                study.role && { label: "Role", value: study.role },
                study.timeline && { label: "Timeline", value: study.timeline },
                study.team && { label: "Team", value: study.team },
                study.platform && { label: "Platform", value: study.platform },
              ].filter(Boolean);

            return (
              metaItems.length > 0 && (
                <div className="cs-meta-row" style={{ "--cs-meta-count": metaItems.length }}>
                  {metaItems.map((m) => (
                    <div className="cs-meta-item" key={m.label}>
                      <span className="cs-meta-label">{m.label}</span>
                      <span className="cs-meta-value">{m.value}</span>
                    </div>
                  ))}
                </div>
              )
            );
          })()}

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

      {nextCaseStudy && (
        <div className="wrap cs-other">
          <p className="eyebrow">Next case study</p>
          <Link to={`/case-studies/${nextCaseStudy.slug}`} className="cs-next-card">
            <div className="cs-next-thumb">
              <img src={nextCaseStudy.thumb || nextCaseStudy.heroImage} alt="" loading="lazy" />
              {nextCaseStudy.locked && <span className="cs-next-lock">🔒</span>}
            </div>
            <div className="cs-next-body">
              <h3>{nextCaseStudy.title}</h3>
              {nextCaseStudy.desc && <p>{nextCaseStudy.desc}</p>}
            </div>
            <span className="cs-next-arrow" aria-hidden="true">→</span>
          </Link>
        </div>
      )}

      <ContactCta />
    </article>
  );
}
