import { useEffect, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { getCaseStudy, caseStudies } from "../data/caseStudies";
import site from "../data/site.json";
import ContactCta from "../components/ContactCta";
import "./CaseStudy.css";

const UNLOCK_PASSWORD = "0620";

function QuoteAttribution({ value }) {
  if (!value) return null;
  const splitAt = value.indexOf(",");
  const cite =
    splitAt === -1 ? (
      <cite className="cs-quote-name">{value}</cite>
    ) : (
      <cite>
        <span className="cs-quote-name">{value.slice(0, splitAt)}</span>
        <span className="cs-quote-role">{value.slice(splitAt + 1).trim()}</span>
      </cite>
    );
  return cite;
}

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

const SLIDESHOW_INTERVAL_MS = 3000;

function Slideshow({ images, interval = SLIDESHOW_INTERVAL_MS }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (images.length <= 1 || paused) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, interval);
    return () => clearInterval(id);
  }, [images.length, interval, paused]);

  return (
    <div
      className="cs-slideshow"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="cs-slideshow-frame">
        {images.map((src, i) => (
          <img
            key={src}
            className={"cs-slideshow-img" + (i === index ? " is-active" : "")}
            src={src}
            alt=""
            loading="eager"
            aria-hidden={i !== index}
          />
        ))}
        {images.length > 1 && (
          <>
            <button
              type="button"
              className="cs-slideshow-nav cs-slideshow-nav--prev"
              aria-label="Previous slide"
              onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)}
            >
              ‹
            </button>
            <button
              type="button"
              className="cs-slideshow-nav cs-slideshow-nav--next"
              aria-label="Next slide"
              onClick={() => setIndex((i) => (i + 1) % images.length)}
            >
              ›
            </button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="cs-slideshow-dots" role="tablist">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              className={"cs-slideshow-dot" + (i === index ? " is-active" : "")}
              aria-label={`Show slide ${i + 1}`}
              aria-selected={i === index}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      )}
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
              {item.image && (
                <img
                  className="cs-card-avatar"
                  src={item.image}
                  alt={item.title || item.label || ""}
                  loading="lazy"
                />
              )}
              {item.emoji && <span className="cs-card-emoji">{item.emoji}</span>}
              {item.label && <span className="cs-card-label">{item.label}</span>}
              {item.title && <h4>{item.title}</h4>}
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      );

    case "personas":
      return (
        <div className="cs-personas">
          {block.items.map((p) => (
            <article className="cs-persona" key={p.name}>
              <header className="cs-persona-head">
                <span className="cs-persona-avatar" aria-hidden="true">
                  {p.emoji}
                </span>
                <div>
                  <h4 className="cs-persona-name">{p.name}</h4>
                  {p.role && <span className="cs-persona-role">{p.role}</span>}
                </div>
              </header>
              {p.facts && <p className="cs-persona-facts">{p.facts}</p>}
              <dl className="cs-persona-fields">
                {p.fields.map((f) => (
                  <div className="cs-persona-field" key={f.label}>
                    <dt>{f.label}</dt>
                    <dd>{f.value}</dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>
      );

    case "honest-note":
      return (
        <div className="cs-honest-note">
          <span className="cs-honest-note-label">{block.label || "Honest note"}</span>
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

    case "callout": {
      const invert = block.label || block.invert;
      return (
        <div
          className={
            "cs-callout" +
            (invert ? " cs-callout-invert" : "") +
            (block.variant ? " cs-callout--" + block.variant : "")
          }
        >
          {block.label && <span className="cs-callout-label">{block.label}</span>}
          <p>{renderHighlighted(block.value)}</p>
        </div>
      );
    }

    case "quote":
      return (
        <blockquote className="cs-quote">
          “{block.value}”
          <QuoteAttribution value={block.attribution} />
        </blockquote>
      );

    case "whys":
      return (
        <ol className="cs-whys">
          {block.steps.map((s, i) => (
            <li className={"cs-why" + (s.root ? " cs-why--root" : "")} key={i}>
              <span className="cs-why-label">{s.label}</span>
              <p className="cs-why-text">{s.text}</p>
            </li>
          ))}
        </ol>
      );

    case "phases":
      return (
        <div className="cs-phases">
          {block.steps.map((s) => (
            <div className="cs-phase" key={s.num}>
              <span className="cs-phase-num">{s.num}</span>
              <h4 className="cs-phase-title">{s.title}</h4>
              <ul className="cs-phase-points">
                {s.points.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      );

    case "award":
      return (
        <div className="cs-award">
          {block.logo ? (
            <img
              className="cs-award-logo"
              src={block.logo}
              alt={block.title || "Award"}
            />
          ) : (
            <span className="cs-award-dot" aria-hidden="true" />
          )}
          {(block.title || block.subtitle || block.desc) && (
            <div className="cs-award-text">
              {block.title && <strong>{block.title}</strong>}
              {block.subtitle && <span>{block.subtitle}</span>}
              {block.desc && <p>{block.desc}</p>}
            </div>
          )}
        </div>
      );

    case "slideshow":
      return <Slideshow images={block.images} interval={block.interval} />;

    case "contrast":
      return (
        <div className={"cs-contrast" + (block.variant ? " cs-contrast--" + block.variant : "")}>
          {block.items.map((item) => (
            <div className="cs-contrast-item" key={item.label}>
              {item.emoji && <span className="cs-contrast-emoji">{item.emoji}</span>}
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

    case "surface-showcase": {
      const alternate = block.alternate !== false;
      return (
        <div
          className={
            "cs-surface-showcase" +
            (alternate ? "" : " cs-surface-showcase--wide") +
            (block.layout?.startsWith("split") ? " cs-surface-showcase--split" : "") +
            (block.layout === "split-portrait" ? " cs-surface-showcase--portrait" : "")
          }
        >
          {block.items.map((item, i) => (
            <div
              className={
                "cs-surface-row" +
                ((item.reverse !== undefined ? item.reverse : alternate && i % 2 === 1)
                  ? " cs-surface-row--reverse"
                  : "")
              }
              key={item.title}
            >
              <div className="cs-surface-media">
                <video
                  className="cs-surface-video"
                  src={item.video}
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              </div>
              <div className="cs-surface-text">
                {item.label && <span className="cs-surface-label">{item.label}</span>}
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      );
    }

    case "image":
      return block.src ? (
        <img
          className={"cs-image" + (block.variant ? " cs-image--" + block.variant : "")}
          src={block.src}
          alt={block.label || ""}
          loading="lazy"
        />
      ) : (
        <ImagePlaceholder label={block.label} />
      );

    case "video":
      if (!block.src) return <VideoPlaceholder label={block.label} />;
      return (
        <video
          className={"cs-video" + (block.variant ? " cs-video--" + block.variant : "")}
          src={block.src}
          autoPlay
          loop
          muted
          playsInline
        />
      );

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
      className={"cs-section" + (section.variant ? " cs-section--" + section.variant : "")}
      id={section.id}
    >
      <div className="cs-section-content">
        {section.title && <h2 className="cs-section-title">{section.title}</h2>}
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

  const currentIndex = caseStudies.findIndex((cs) => cs.slug === slug);
  const withHomeMeta = (cs) =>
    cs && { ...cs, ...site.home.caseStudies.find((h) => h.slug === cs.slug) };
  const prevCaseStudy = withHomeMeta(currentIndex > 0 ? caseStudies[currentIndex - 1] : null);
  const nextCaseStudy = withHomeMeta(
    currentIndex >= 0 && currentIndex < caseStudies.length - 1
      ? caseStudies[currentIndex + 1]
      : null
  );

  const indexItems = study.indexedSections
    ? study.indexedSections.map((s) => ({ id: s.id, label: s.kicker }))
    : ["Index 1", "Index 2", "Index 3", "Index 4", "Index 5", "Index 6"].map((label) => ({
        id: null,
        label,
      }));

  const [activeId, setActiveId] = useState(indexItems[0]?.id ?? null);
  // Follow a #section hash on arrival (react-router doesn't scroll to it).
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const el = document.getElementById(hash);
    if (el) el.scrollIntoView();
  }, [slug]);

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
      <div className="cs-topbar wrap">
        <Link to="/" className="cs-index-back">
          ← All work
        </Link>
      </div>

      <header className="cs-header">
        <div className="cs-header-panel">
          <div className="cs-header-copy">
            {study.tags && study.tags.length > 0 && (
              <p className="cs-header-eyebrow">{study.tags.join(" · ")}</p>
            )}
            <h2 className="cs-header-title md-display-medium">{study.title}</h2>
            {study.subtitle && <p className="cs-header-subtitle md-title-small">{study.subtitle}</p>}
          </div>
        </div>
        {study.heroImage ? (
          <img className="cs-hero-image" src={study.heroImage} alt={study.title} />
        ) : (
          study.heroVideo && <VideoPlaceholder className="cs-hero-image" />
        )}
      </header>

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
          <nav className="cs-index" aria-label="On this page">
            <div className="cs-index-inner">
              <div className="cs-index-items">
                {indexItems.map((item, i) =>
                  item.id ? (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className={"cs-index-item md-label-medium" + (item.id === activeId ? " is-active" : "")}
                    >
                      {item.label}
                    </a>
                  ) : (
                    <span className="cs-index-item md-label-medium" key={item.label + i}>
                      {item.label}
                    </span>
                  )
                )}
              </div>
            </div>
          </nav>

          <div className="cs-body-main">
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
                  <QuoteAttribution value={study.results.quoteAttribution} />
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
        </div>
      )}

      {(prevCaseStudy || nextCaseStudy) && (
        <nav className="wrap cs-pager" aria-label="Case study pagination">
          {[
            ["prev", prevCaseStudy],
            ["next", nextCaseStudy],
          ].map(([dir, cs]) =>
            cs ? (
              <Link
                key={dir}
                to={`/case-studies/${cs.slug}`}
                className={"cs-pager-card cs-pager-card--" + dir}
              >
                <span className="cs-pager-thumb">
                  <img src={cs.thumb || cs.heroImage} alt="" loading="lazy" />
                  {cs.locked && (
                    <span className="cs-pager-lock" aria-label="Password protected">
                      🔒
                    </span>
                  )}
                </span>
                <span className="cs-pager-body">
                  <span className="cs-pager-label">
                    {dir === "prev" ? (
                      <>
                        <span aria-hidden="true">←</span> Previous
                      </>
                    ) : (
                      <>
                        Up next <span aria-hidden="true">→</span>
                      </>
                    )}
                  </span>
                  <span className="cs-pager-title">{cs.title}</span>
                  {(cs.summary || cs.desc || cs.subtitle) && (
                    <span className="cs-pager-desc">{cs.summary || cs.desc || cs.subtitle}</span>
                  )}
                </span>
              </Link>
            ) : (
              <span key={dir} className="cs-pager-empty" aria-hidden="true" />
            )
          )}
        </nav>
      )}

      <ContactCta />
    </article>
  );
}
