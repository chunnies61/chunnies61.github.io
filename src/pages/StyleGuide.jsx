import Tag from "../components/Tag";
import tonal from "../data/tonal-palettes.json";
import typeScale from "../data/type-scale.json";
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

        <Block
          title="Tonal palettes"
          note="Each source colour expanded into the 13-step M3 HCT tonal scale. Tone is perceptual lightness — 0 is black, 100 is white — so the same tone reads at the same weight across every palette."
        >
          <div className="sg-tonals">
            {tonal.palettes.map((p) => (
              <div className="sg-tonal" key={p.key}>
                <div className="sg-tonal-head">
                  <strong>{p.name}</strong>
                  <code>
                    --{p.token} · {p.hex} · HCT {p.hct.h} / {p.hct.c} / {p.hct.t}
                  </code>
                  <span className="sg-swatch-note">{p.note}</span>
                </div>
                <div className="sg-tonal-ramp">
                  {tonal.tones.map((t) => (
                    <div className="sg-tone" key={t}>
                      <div
                        className="sg-tone-chip"
                        style={{
                          background: p.tones[t],
                          color: t >= 60 ? "#000" : "#fff",
                        }}
                      >
                        {t}
                      </div>
                      <code>{p.tones[t]}</code>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Block>

        <Block
          title="Role mapping"
          note="Which tone each M3 role takes from its palette. Accent roles read from an accent palette; surface roles read from the neutral one."
        >
          <div className="sg-roles">
            {[
              ["Accent roles — light", tonal.roles.light, "primary"],
              ["Accent roles — dark", tonal.roles.dark, "primary"],
              ["Surface roles — light", tonal.roles.neutralLight, "neutral"],
              ["Surface roles — dark", tonal.roles.neutralDark, "neutral"],
            ].map(([heading, rows, paletteKey]) => {
              const pal = tonal.palettes.find((x) => x.key === paletteKey);
              return (
                <div className="sg-role-group" key={heading}>
                  <h3>{heading}</h3>
                  <table className="sg-role-table">
                    <tbody>
                      {rows.map((r) => (
                        <tr key={r.role}>
                          <td>
                            <span
                              className="sg-role-dot"
                              style={{ background: pal.tones[r.tone] }}
                            />
                          </td>
                          <td>{r.role}</td>
                          <td>
                            <code>Tone {r.tone}</code>
                          </td>
                          <td>
                            <code>{pal.tones[r.tone]}</code>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
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

        <Block
          title="Type scale"
          note="The Material Design 3 scale — 15 roles across Display, Headline, Title, Body and Label. MD3 sizes, line-heights and letter-spacings; our families and weights. Every role ships as a class in src/index.css."
        >
          {typeScale.groups.map((g) => (
            <div className="sg-type-group" key={g.name}>
              <div className="sg-type-group-head">
                <h3>{g.name}</h3>
                <code>
                  {g.family} · {g.weight}
                </code>
                <span className="sg-swatch-note">{g.use}</span>
              </div>
              <table className="sg-type-table">
                <thead>
                  <tr>
                    <th>Role</th>
                    <th>Size</th>
                    <th>Line height</th>
                    <th>Tracking</th>
                    <th>Weight</th>
                    <th>Class</th>
                    <th>Specimen</th>
                  </tr>
                </thead>
                <tbody>
                  {g.roles.map((r) => (
                    <tr key={r.role}>
                      <td className="sg-type-role">{r.role}</td>
                      <td>{r.size}px</td>
                      <td>{r.lineHeight}px</td>
                      <td>{r.letterSpacing === 0 ? "0" : `${r.letterSpacing}px`}</td>
                      <td>{g.weight}</td>
                      <td>
                        <code>.{r.class}</code>
                      </td>
                      <td>
                        <span
                          className="sg-specimen"
                          style={{
                            fontFamily: `var(${g.familyToken})`,
                            fontSize: r.size,
                            lineHeight: `${r.lineHeight}px`,
                            letterSpacing: `${r.letterSpacing}px`,
                            fontWeight: g.weight,
                          }}
                        >
                          Design that ships
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
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
