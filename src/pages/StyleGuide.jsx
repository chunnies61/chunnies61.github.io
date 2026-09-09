import Tag from "../components/Tag";
import "./StyleGuide.css";

const NEUTRALS = [
  "gray-900",
  "gray-800",
  "gray-700",
  "gray-600",
  "gray-500",
  "gray-400",
  "gray-300",
  "gray-200",
  "gray-100",
  "gray-50",
];

const ROLES = [
  { token: "text", note: "Primary text & headings" },
  { token: "text-soft", note: "Secondary text, captions" },
  { token: "accent", note: "Accents, rules, tints — never body text on white" },
  { token: "accent-dark", note: "Interactive text on white (AA)" },
  { token: "card-border", note: "Hairline rules" },
  { token: "pill-blue-bg", note: "Wells, chips, quiet fills" },
  { token: "placeholder-bg", note: "Image & media placeholders" },
];

const PILLS = [
  { name: "Blue", bg: "pill-blue-bg", fg: "pill-blue-text" },
  { name: "Pink", bg: "pill-pink-bg", fg: "pill-pink-text" },
  { name: "Yellow", bg: "pill-yellow-bg", fg: "pill-yellow-text" },
  { name: "Green", bg: "pill-green-bg", fg: "pill-green-text" },
];

const TYPE = [
  { label: "Page header title — h2", cls: "sg-t-section", spec: "Bricolage 26px / 700 / 1.25" },
  { label: "Section title — h2", cls: "sg-t-section", spec: "Bricolage 26px / 700 / 1.25" },
  { label: "Step title — h4", cls: "sg-t-step", spec: "Bricolage 18px / 700" },
  { label: "Body", cls: "sg-t-body", spec: "Poppins 16px / 400 / 1.6 / --text-soft" },
  { label: "Header subtitle", cls: "sg-t-subtitle", spec: "Poppins 16px / 500 / 1.6 / --text-soft" },
  { label: "Small / caption", cls: "sg-t-small", spec: "Poppins 14px / 500 / --text-soft" },
  { label: "Eyebrow", cls: "sg-t-eyebrow", spec: "Poppins 11–13px / 600 / uppercase / 0.05em" },
];

const RADII = ["radius-tag", "radius-btn", "radius-media", "radius-card"];
const SPACING = ["space-page-top", "space-section", "space-title-gap"];

function Swatch({ token, note }) {
  return (
    <div className="sg-swatch">
      <div className="sg-swatch-chip" style={{ background: `var(--${token})` }} />
      <code>--{token}</code>
      {note && <span className="sg-swatch-note">{note}</span>}
    </div>
  );
}

function Block({ title, children, note }) {
  return (
    <section className="sg-block">
      <h2>{title}</h2>
      {note && <p className="sg-note">{note}</p>}
      {children}
    </section>
  );
}

export default function StyleGuide() {
  return (
    <article className="style-guide">
      <div className="wrap">
        <header className="sg-header">
          <p className="sg-eyebrow">Reference</p>
          <h1>Style guide</h1>
          <p className="sg-lede">
            Every token and pattern this site is built from. Values read live from{" "}
            <code>src/index.css</code>, so this page always shows what the site is
            actually using.
          </p>
        </header>

        <Block title="Neutral ramp" note="Cool slate, LCH-consistent (Material 50–900, hue ~270).">
          <div className="sg-swatches">
            {NEUTRALS.map((t) => (
              <Swatch key={t} token={t} />
            ))}
          </div>
        </Block>

        <Block title="Semantic roles" note="Prefer these over raw ramp values.">
          <div className="sg-swatches sg-swatches--wide">
            {ROLES.map((r) => (
              <Swatch key={r.token} token={r.token} note={r.note} />
            ))}
          </div>
        </Block>

        <Block title="Pill pairs" note="Always use the matching background and text token together.">
          <div className="sg-pills">
            {PILLS.map((p) => (
              <div
                className="sg-pill"
                key={p.name}
                style={{ background: `var(--${p.bg})`, color: `var(--${p.fg})` }}
              >
                {p.name}
                <code>
                  --{p.bg} / --{p.fg}
                </code>
              </div>
            ))}
          </div>
        </Block>

        <Block title="Type scale">
          <div className="sg-type">
            {TYPE.map((t) => (
              <div className="sg-type-row" key={t.label}>
                <div className="sg-type-meta">
                  <strong>{t.label}</strong>
                  <code>{t.spec}</code>
                </div>
                <p className={t.cls}>The quick brown fox jumps over the lazy dog</p>
              </div>
            ))}
          </div>
        </Block>

        <Block title="Radii">
          <div className="sg-radii">
            {RADII.map((r) => (
              <div className="sg-radius" key={r}>
                <div className="sg-radius-box" style={{ borderRadius: `var(--${r})` }} />
                <code>--{r}</code>
              </div>
            ))}
            <div className="sg-radius">
              <div className="sg-radius-box" style={{ borderRadius: "24px" }} />
              <code>24px — page header &amp; hero</code>
            </div>
          </div>
        </Block>

        <Block title="Spacing rhythm" note="Three values carry the whole vertical rhythm.">
          <div className="sg-spacing">
            {SPACING.map((v) => (
              <div className="sg-space-row" key={v}>
                <code>--{v}</code>
                <div className="sg-space-bar" style={{ width: `var(--${v})` }} />
              </div>
            ))}
          </div>
        </Block>

        <Block title="Buttons">
          <div className="sg-row">
            <button className="btn btn-primary" type="button">
              Primary
            </button>
            <button className="btn btn-secondary" type="button">
              Secondary
            </button>
          </div>
        </Block>

        <Block title="Tags">
          <div className="sg-row">
            <Tag>Fintech</Tag>
            <Tag>B2B</Tag>
            <Tag>Design System</Tag>
          </div>
        </Block>

        <Block title="Case study blocks" note="The patterns the case study renderer draws from.">
          <div className="sg-samples">
            <div className="cs-callout">
              <span className="cs-callout-label">Callout label</span>
              <p>Accent-dark panel, white body text, yellow label.</p>
            </div>

            <div className="cs-cards cs-cards-3">
              {["Card one", "Card two", "Card three"].map((t) => (
                <div className="cs-card" key={t}>
                  <span className="cs-card-emoji">✦</span>
                  <span className="cs-card-label">Label</span>
                  <h4>{t}</h4>
                  <p>Tinted card on rgba(240, 241, 244, 0.5).</p>
                </div>
              ))}
            </div>

            <div className="cs-outcomes-grid">
              {[
                ["−70%", "Task completion time"],
                ["3×", "Active users"],
                ["+30%", "Satisfaction"],
              ].map(([v, l]) => (
                <div className="cs-outcome-tile" key={l}>
                  <p className="cs-outcome-value">{v}</p>
                  <p className="cs-outcome-label">{l}</p>
                </div>
              ))}
            </div>

            <blockquote className="cs-quote">
              “A pull quote, set in the display face.”
              <cite>
                <span className="cs-quote-name">Name</span>
                <span className="cs-quote-role">Role</span>
              </cite>
            </blockquote>
          </div>
        </Block>
      </div>
    </article>
  );
}
