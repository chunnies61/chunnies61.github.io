import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import PasswordGate, { useUnlocked } from "../components/PasswordGate";
import { Banner, ICON_NAMES, Icon, Toggle } from "../components/lra/ui";
import { ScaledFrame } from "../components/lra/frame";
import "../components/lra/Lra.css";
import "../components/vision/Vision.css";
import "../components/workspace/Workspace.css";
import "./StyleGuide.css";
import "./CaseStudy.css";
import "./PrototypeDesignSystem.css";

/* Design system for the JPMC case-study prototypes (Loan Request App, the
   future-vision proposals, Lending Workspace). Every specimen renders with
   the prototypes' own stylesheets inside an .lra scope, and colour values are
   read back from the rendered CSS — so this page shows what the prototypes
   actually use. Protected with the case study's lock. */

const SLUG = "lending-solutions-redesign";

// The Connect Design System palette, as the prototypes implement it:
// [Connect token, what it's for, the --ui-* token that carries it]
const PALETTE = [
  ["Brand", [
    ["$brand-primary", "Primary brand", "brand-600"],
    ["$brand-secondary", "Secondary brand", "white"],
    ["$accent", "Brand accent", "accent"],
  ]],
  ["Surface", [
    ["$background-primary", "Primary background", "bg"],
    ["$background-secondary", "Secondary background", "bg-secondary"],
    ["$background-hover", "Background on hover for components", "bg-hover"],
    ["$background-disabled", "Disabled background for components", "bg-tertiary"],
  ]],
  ["Rows", [
    ["$background-hover", "Row fill on hover", "bg-hover"],
    ["$row-selected-default", "Selected row fill", "row-selected"],
    ["$row-selected-hover", "Selected row fill on hover", "row-selected-hover"],
    ["$editable-grid", "Editable grid row fill", "editable-grid"],
    ["$editable-grid-outline", "Editable grid outline", "editable-grid-outline"],
  ]],
  ["Dividers", [
    ["$divider-primary", "Primary divider — inputs, buttons, tags", "border"],
    ["$divider-secondary", "Secondary divider — cards, tables", "border-secondary"],
  ]],
  ["Icons", [
    ["$icon-default", "Default icon colour", "icon"],
    ["$icon-hover", "Icon on hover", "icon-hover"],
    ["$icon-disabled", "Disabled icon", "icon-disabled"],
  ]],
  ["Text", [
    ["$text-primary", "Primary text, labels", "fg"],
    ["$text-secondary", "Secondary text, body, captions", "fg-tertiary"],
    ["$text-disabled", "Disabled text", "fg-disabled"],
  ]],
  ["Links", [
    ["$link-primary-default", "Primary link", "link"],
    ["$link-primary-hover", "Primary link on hover", "link-hover"],
    ["$link-secondary", "Secondary / definition link", "link-secondary"],
    ["$link-success-default", "Success / gain", "success-600"],
    ["$link-success-hover", "Success / gain on hover", "success-900"],
    ["$link-error-default", "Error / loss", "error-600"],
    ["$link-error-hover", "Error / loss on hover", "error-800"],
  ]],
];

// Full 25–950 scales for every brand colour. Palette values are pinned at
// the listed steps; everything else is generated around them.
const ALL = ["25", "50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"];
const SCALES = [
  ["Brand", "brand", { 600: "$brand-primary", 800: "$link-primary-hover" }],
  ["Accent", "accent", { 300: "$accent" }],
  ["Neutral", "gray", {
    50: "$background-hover", 100: "$background-secondary", 200: "$divider-secondary",
    300: "$divider-primary", 400: "$icon-disabled", 500: "$text-disabled",
    600: "$text-secondary", 700: "$icon-default", 800: "$text-primary",
  }],
  ["Success", "success", { 600: "$link-success-default", 900: "$link-success-hover" }],
  ["Error", "error", { 600: "$link-error-default", 800: "$link-error-hover" }],
];
// Supporting hues, not in the Connect palette (partial Untitled UI ramps)
const SUPPORTING = [
  ["Warning", "warning", ["25", "50", "200", "300", "600", "700"]],
  ["Purple", "purple", ["50", "200", "700"]],
];

// Text/background pairs checked live against WCAG AA (4.5:1)
const PAIRS = [
  ["fg", "bg", "$text-primary on white"],
  ["fg-tertiary", "bg", "$text-secondary on white"],
  ["fg-tertiary", "bg-secondary", "$text-secondary on secondary background"],
  ["link", "bg", "$link-primary on white"],
  ["link", "row-selected", "$link-primary on a selected row"],
  ["white", "primary", "White on the primary button (#0056A6)"],
  ["success-600", "success-50", "Success badge"],
  ["error-600", "error-50", "Error badge"],
  ["warning-700", "warning-50", "Warning badge"],
  ["purple-700", "purple-50", "Purple badge"],
  ["fg", "editable-grid", "Text on the editable grid"],
  ["gray-800", "gray-200", "Table header text on neutral-200"],
  ["icon", "bg", "$icon-default on white (icons need 3:1)", 3],
];

const TYPE = [
  ["Display sm", 30, 38, 600, "KPI values, borrowing capacity"],
  ["Display xs", 24, 32, 600, "Metric tiles, summary counts"],
  ["Text xl", 20, 30, 600, "Live-deal stats"],
  ["Text lg", 18, 28, 600, "App header title, empty-state titles"],
  ["Text md", 16, 24, 600, "Section and card titles (inputs use 400)"],
  ["Text sm", 14, 20, 500, "Body, labels (500), buttons and tabs (600)"],
  ["Text xs", 12, 18, 500, "Captions, key labels (badges use 600)"],
];

const SPACING = [2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48];
const RADII = [
  [4, "Inputs, tags, switches, checkboxes, metric tiles (--ui-radius-sm)"],
  [6, "Cards, tables, alerts, toasts, panels (--ui-radius-md)"],
  [8, "Buttons, icon buttons, menus, tooltips"],
  [12, "The prototype frame"],
  [16, "Badges (pill)"],
  ["50%", "Avatars, radios, featured icons, steps"],
];
const SHADOWS = [
  ["shadow-xs", "Inputs, cards, tables, tags"],
  ["shadow-sm", "Offer cards"],
  ["shadow-md", "Slider thumb"],
  ["shadow-lg", "Menus, toasts, tooltips"],
  ["shadow-skeu", "Primary button edge"],
  ["ring", "Focus ring on inputs (4px brand-100)"],
];

/* --- Helpers ------------------------------------------------------------------ */

const slug = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function Block({ title, note, children }) {
  return (
    <section className="sg-block" id={slug(title)}>
      <h2>{title}</h2>
      {note && <p className="sg-note">{note}</p>}
      {children}
    </section>
  );
}

// A specimen: rendered inside the prototypes' .lra scope
function Specimen({ children, label, className = "" }) {
  return (
    <figure className="pds-specimen">
      <div className={`lra pds-canvas ${className}`}>{children}</div>
      {label && <figcaption>{label}</figcaption>}
    </figure>
  );
}

function Usage({ children }) {
  return <ul className="pds-usage">{children}</ul>;
}

// Resolve a --ui-* token to its computed hex, read off the page
function useToken(name) {
  const ref = useRef(null);
  const [value, setValue] = useState("");
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setValue(toHex(getComputedStyle(el).backgroundColor));
  }, [name]);
  return [ref, value];
}

function toHex(rgb) {
  const m = rgb.match(/\d+(\.\d+)?/g);
  if (!m) return rgb;
  return "#" + m.slice(0, 3).map((n) => Math.round(+n).toString(16).padStart(2, "0")).join("");
}

function luminance(hex) {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const lin = c.map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

const ratio = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

function Chip({ token, name, note, big, maps, pinned }) {
  const [ref, hex] = useToken(token);
  return (
    <div className={"pds-chip" + (big ? " is-big" : "") + (pinned ? " is-pinned" : "")} title={pinned}>
      <span ref={ref} className="pds-chip-color" style={{ background: `var(--ui-${token})` }} />
      <span className="pds-chip-name">{name ?? token}</span>
      <code>{hex.toUpperCase()}</code>
      {note && <span className="pds-chip-note">{note}</span>}
      {maps && <code className="pds-chip-maps">--ui-{token}</code>}
      {pinned && <span className="lra-pill is-blue pds-chip-pin">Connect</span>}
    </div>
  );
}

function ContrastRow({ fg, bg, label, min = 4.5 }) {
  const [fgRef, fgHex] = useToken(fg);
  const [bgRef, bgHex] = useToken(bg);
  const r = fgHex && bgHex ? ratio(fgHex, bgHex) : 0;
  return (
    <tr>
      <td>
        <span className="pds-contrast-sample" style={{ color: `var(--ui-${fg})`, background: `var(--ui-${bg})` }}>
          Aa
        </span>
        <span ref={fgRef} hidden style={{ background: `var(--ui-${fg})` }} />
        <span ref={bgRef} hidden style={{ background: `var(--ui-${bg})` }} />
      </td>
      <td>{label}</td>
      <td>
        <code>{fg}</code> on <code>{bg}</code>
      </td>
      <td className="is-num">{r ? r.toFixed(2) : "–"}:1</td>
      <td>
        <span className={"lra-pill " + (r >= min ? "is-good" : "is-critical")}>{r >= min ? "AA" : "Fails"}</span>
      </td>
    </tr>
  );
}

/* --- Page ------------------------------------------------------------------------ */

export default function PrototypeDesignSystem() {
  const [unlocked, unlock] = useUnlocked(SLUG);
  const [items, setItems] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [demoToggle, setDemoToggle] = useState("a");
  const [demoTab, setDemoTab] = useState("one");

  // Index rail built from the rendered section headings
  useEffect(() => {
    if (!unlocked) return;
    const blocks = Array.from(document.querySelectorAll(".pds .sg-body-main .sg-block"));
    setItems(blocks.map((el) => ({ id: el.id, label: el.querySelector("h2").textContent })));
    setActiveId(blocks[0]?.id ?? null);
    const hash = window.location.hash.slice(1);
    if (hash) document.getElementById(hash)?.scrollIntoView();
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActiveId(e.target.id)),
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 }
    );
    blocks.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [unlocked]);

  if (!unlocked) return <PasswordGate onUnlock={unlock} />;

  return (
    <article className="style-guide pds">
      <div className="wrap">
        <header className="sg-header">
          <p className="sg-eyebrow">
            <Link to={`/case-studies/${SLUG}`}>Lending Solutions Redesign</Link> · Design system
          </p>
          <h1>JPMC prototype design system</h1>
          <p className="sg-lede">
            The foundations, components and patterns behind the three interactive prototypes in the
            case study — the Loan Request App, the future-vision proposals and the Lending Workspace.
            Everything below renders from the prototypes' own stylesheets, so it always matches what
            they ship.
          </p>
          <dl className="pds-facts">
            {[
              ["Built on", "Untitled UI React components"],
              ["Colour", "Connect palette · main #0056A6"],
              ["Typeface", "Poppins"],
              ["Canvas", "1920 × 1080, scaled to fit"],
              ["Tokens", "--ui-*, scoped to .lra"],
            ].map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </header>
      </div>

      <div className="wrap sg-body">
        <nav className="sg-index" aria-label="On this page">
          <div className="sg-index-inner">
            <div className="sg-index-items">
              {items.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={"sg-index-item md-label-medium" + (item.id === activeId ? " is-active" : "")}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </nav>

        <div className="sg-body-main">
          {/* ---------------- Principles ---------------- */}
          <Block title="Principles" note="Five rules every prototype screen follows.">
            <div className="pds-principles">
              {[
                ["One primary", "#0056A6 (brand-700) is the only accent — fills, links, active states and selection. Status colours are for status, never decoration."],
                ["Labels above fields", "Every input has a visible label above it and hint or error text below. No placeholder-as-label."],
                ["Hairlines, not heavy fills", "Surfaces separate with 1px $divider-secondary borders and shadow-xs; $background-secondary is reserved for panels and headers."],
                ["Say what's blocking", "A disabled Continue always sits beside a status line naming the one thing still missing."],
                ["Sample data only", "Every name, account and figure is dummy; URLs use the reserved .example domain."],
              ].map(([t, d]) => (
                <div key={t} className="pds-principle">
                  <h3>{t}</h3>
                  <p>{d}</p>
                </div>
              ))}
            </div>
          </Block>

          {/* ---------------- Foundations ---------------- */}
          <Block title="Colour palette" note="The Connect Design System palette (JPMC), used as-is. Each swatch shows the Connect token, its value — read live from the prototypes' CSS — and the --ui-* token that carries it.">
            <Specimen>
              {PALETTE.map(([group, tokens]) => (
                <div key={group} className="pds-utility">
                  <p className="pds-utility-name">{group}</p>
                  <div className="pds-roles">
                    {tokens.map(([name, note, token]) => (
                      <Chip key={name + token} token={token} name={name} note={note} maps />
                    ))}
                  </div>
                </div>
              ))}
            </Specimen>
            <Usage>
              <li><strong>One primary.</strong> Brand-700 #0056A6 is the main colour: it fills primary buttons and marks links, active tabs, current steps and selection; $link-primary-hover (brand-800) darkens it on hover. $brand-primary #126BC5 sits at 600 in the scale.</li>
              <li><strong>Accent sparingly.</strong> $accent #79E0AD is a brand highlight, never a status or a text colour.</li>
              <li><strong>Gain and loss.</strong> Success #006600 and error #BF2155 are the only status hues for text, badges and alerts; warning (amber) is supplemental.</li>
            </Usage>
          </Block>

          <Block title="Colour scales" note="Every brand colour has a full 25–950 scale, generated in OKLCH so each step is an even jump in perceived lightness, kept inside the sRGB gamut. The palette's own values are pinned where their lightness falls — marked Connect — and every other step is built around them. Brand 700 is the main colour; elsewhere 600 is the default for fills and text. The light end (25–200) is for tints, selected states and badge fills; the dark end for hovers and pressed states.">
            <Specimen>
              {SCALES.map(([label, key, pins]) => (
                <div key={key} className="pds-utility">
                  <p className="pds-utility-name">
                    {label} <code>--ui-{key}-*</code>
                  </p>
                  <div className="pds-scale">
                    {ALL.map((st) => (
                      <Chip
                        key={st}
                        token={`${key}-${st}`}
                        name={st}
                        pinned={pins[st]}
                        big={key === "brand" && st === "700"}
                        note={key === "brand" && st === "700" ? "Main" : undefined}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </Specimen>
            <Specimen label="Supporting hues — warning and purple aren't in the Connect palette; they keep partial Untitled UI ramps">
              {SUPPORTING.map(([label, key, steps]) => (
                <div key={key} className="pds-utility">
                  <p className="pds-utility-name">{label}</p>
                  <div className="pds-ramp">
                    {steps.map((st) => (
                      <Chip key={st} token={`${key}-${st}`} name={st} />
                    ))}
                  </div>
                </div>
              ))}
            </Specimen>
          </Block>

          <Block title="Contrast" note="Every text pairing the prototypes use, measured live against WCAG 2.2 AA (4.5:1 for body text).">
            <Specimen>
              <div className="lra-table-wrap">
                <table className="lra-table pds-contrast">
                  <thead>
                    <tr>
                      <th scope="col">Sample</th>
                      <th scope="col">Used for</th>
                      <th scope="col">Pair</th>
                      <th scope="col" className="is-num">
                        Ratio
                      </th>
                      <th scope="col">WCAG</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PAIRS.map(([fg, bg, label, min]) => (
                      <ContrastRow key={fg + bg} fg={fg} bg={bg} label={label} min={min} />
                    ))}
                  </tbody>
                </table>
              </div>
            </Specimen>
            <p className="pds-caveat">
              Input and tag borders use $divider-primary #CCCCCC (1.6:1 against white) — below WCAG's
              3:1 for component boundaries. It's kept for fidelity to the Connect palette; the label
              above each field and the focus ring carry the affordance. $text-disabled is exempt.
            </p>
          </Block>

          <Block title="Typography" note="Poppins, the portfolio's own face, at Untitled UI's scale. No letter-spacing. Weights: 400 for input text, 500 for body emphasis and labels, 600 for titles, buttons and tabs.">
            <Specimen>
              <table className="pds-type">
                <tbody>
                  {TYPE.map(([name, size, lh, weight, use]) => (
                    <tr key={name}>
                      <td>
                        <span className="pds-type-name">{name}</span>
                        <code>
                          {size}/{lh} · {weight}
                        </code>
                      </td>
                      <td>
                        <span style={{ fontSize: size, lineHeight: `${lh}px`, fontWeight: weight }}>
                          New loan request
                        </span>
                      </td>
                      <td className="pds-type-use">{use}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Specimen>
          </Block>

          <Block title="Spacing" note="A 4px grid, with 2 and 6 for fine adjustments. Windows pad 32; cards 20; sections sit 32 apart; related controls 8–16.">
            <Specimen>
              <div className="pds-spacing">
                {SPACING.map((n) => (
                  <div key={n} className="pds-space">
                    <code>{n}</code>
                    <span style={{ width: n * 4 }} />
                  </div>
                ))}
              </div>
            </Specimen>
          </Block>

          <Block title="Radius" note="Tight corners: 4px for inputs, tags and switches; 6px for cards, tables, alerts and toasts; 8px for buttons and menus; badges are pills.">
            <Specimen>
              <div className="pds-radii">
                {RADII.map(([r, use]) => (
                  <div key={r} className="pds-radius">
                    <span style={{ borderRadius: typeof r === "number" ? r : r }} />
                    <code>{typeof r === "number" ? `${r}px` : r}</code>
                    <p>{use}</p>
                  </div>
                ))}
              </div>
            </Specimen>
          </Block>

          <Block title="Shadows" note="Untitled UI's elevation scale. Most surfaces use xs; lg is only for things that float.">
            <Specimen>
              <div className="pds-shadows">
                {SHADOWS.map(([t, use]) => (
                  <div key={t} className="pds-shadow">
                    <span style={{ boxShadow: `var(--ui-${t})` }} />
                    <code>--ui-{t}</code>
                    <p>{use}</p>
                  </div>
                ))}
              </div>
            </Specimen>
          </Block>

          <Block title="Iconography" note="Material Symbols paths on a 24px grid, drawn in currentColor. 24px in toolbars, 20px in alerts and dropdowns, 16–18px inside buttons and tags.">
            <Specimen>
              <div className="pds-icons">
                {ICON_NAMES.map((n) => (
                  <div key={n} className="pds-icon">
                    <Icon name={n} />
                    <code>{n}</code>
                  </div>
                ))}
              </div>
            </Specimen>
          </Block>

          <Block title="Canvas & frame" note="Each prototype lays out on a 1920×1080 canvas — 96px of browser chrome over a 1920×984 app — then scales uniformly to the column's width. A 2px gray-800 border and a soft shadow set it apart from the page; where a prototype has a toggle, it sits on that border as a tab and the frame's top-left corner goes square.">
            <Specimen className="pds-frame-demo">
              <ScaledFrame title="Example app" path="/lending/example">
                <div className="lra-window">
                  <div className="lra-appbar">
                    <span className="lra-icon-btn" aria-hidden="true">
                      <Icon name="close" />
                    </span>
                    <span className="lra-appbar-title">New loan request</span>
                    <span className="lra-icon-btn" aria-hidden="true">
                      <Icon name="moreVert" />
                    </span>
                  </div>
                  <div className="lra-body pds-frame-body">
                    <p>1920 × 984 app area</p>
                  </div>
                </div>
              </ScaledFrame>
            </Specimen>
            <Usage>
              <li>Menus and popovers that must escape a scroll box portal into the frame's overlay layer, so they scale with the app.</li>
              <li>The address bar's path follows state (region, variant, section) on a reserved <code>.example</code> host.</li>
              <li>Below a 1200px canvas nothing reflows — the prototypes are desktop-only by design.</li>
            </Usage>
          </Block>

          {/* ---------------- Components ---------------- */}
          <Block title="Buttons" note="40px tall, 8px corners, text-sm semibold. One primary per view.">
            <Specimen label="Primary · Secondary · Secondary colour · Tertiary">
              <div className="pds-row">
                <button type="button" className="lra-btn is-primary">Save & continue</button>
                <button type="button" className="lra-btn is-secondary">Back</button>
                <button type="button" className="lra-btn is-tonal">
                  <Icon name="add" size={18} />
                  Add party
                </button>
                <button type="button" className="lra-btn is-ghost">Abandon</button>
              </div>
            </Specimen>
            <Specimen label="Toggle (off / on) · Disabled">
              <div className="pds-row">
                <button type="button" className="lra-btn is-toggle">Build a tailored deal</button>
                <button type="button" className="lra-btn is-toggle is-on">
                  <Icon name="check" size={18} />
                  Build your own deal
                </button>
                <button type="button" className="lra-btn is-primary" disabled>
                  Save & continue
                </button>
                <button type="button" className="lra-btn is-secondary" disabled>
                  Upload
                </button>
              </div>
            </Specimen>
            <Usage>
              <li><strong>Primary</strong> — the step's forward action (Save & continue, Create offer). Hover darkens to brand-800 ($link-primary-hover).</li>
              <li><strong>Secondary</strong> — Back, Upload, Simulate. <strong>Secondary colour</strong> — additive actions (Add party, Mark complete).</li>
              <li><strong>Tertiary</strong> — low-stakes or destructive-but-reversible (Abandon, Edit, Remove).</li>
              <li><strong>Toggle</strong> — a choice that opens a section; gains a check when on.</li>
            </Usage>
          </Block>

          <Block title="Icon buttons" note="36px square utility buttons (24px small) in $icon-default, $icon-hover on hover. Always carry an aria-label.">
            <Specimen>
              <div className="pds-row">
                <button type="button" className="lra-icon-btn" aria-label="Delete">
                  <Icon name="delete" />
                </button>
                <button type="button" className="lra-icon-btn" aria-label="More">
                  <Icon name="moreVert" />
                </button>
                <button type="button" className="lra-icon-btn is-small" aria-label="Remove file">
                  <Icon name="close" size={18} />
                </button>
                <button type="button" className="lra-icon-btn is-send" aria-label="Send">
                  <Icon name="send" />
                </button>
              </div>
            </Specimen>
          </Block>

          <Block title="Inputs" note="Label above (text-sm medium), 40px field, a realistic placeholder in $text-secondary, hint or error below. Focus: brand-300 border + 4px brand-100 ring; error: error-300 border + error-100 ring.">
            <Specimen>
              <div className="lra-grid pds-inputs">
                <div className="lra-field">
                  <label htmlFor="pds-in-1">Line size (USD)</label>
                  <input id="pds-in-1" defaultValue="8,000,000.00" />
                  <p className="lra-field-hint">Streamlined up to USD 2.5MM</p>
                </div>
                <div className="lra-field has-error">
                  <label htmlFor="pds-in-2">Peak limit (USD)</label>
                  <input id="pds-in-2" defaultValue="3,000,000" aria-invalid="true" />
                  <p className="lra-field-error">Exceeds the USD 2.5MM peak limit.</p>
                </div>
                <div className="lra-field">
                  <label htmlFor="pds-in-3">Facility type</label>
                  <div className="lra-body pds-inline">
                    <select id="pds-in-3" defaultValue="FX/OTC Derivatives">
                      <option>Global limit</option>
                      <option>FX/OTC Derivatives</option>
                    </select>
                  </div>
                </div>
                <div className="lra-field">
                  <label htmlFor="pds-in-4">Placeholder</label>
                  <input id="pds-in-4" placeholder="e.g. Adam Ross or 9876543210" />
                </div>
              </div>
              <div className="lra-field pds-textarea">
                <label htmlFor="pds-in-5">Supporting comment</label>
                <textarea id="pds-in-5" rows={3} defaultValue="Equity concentration is above 40% because…" />
              </div>
            </Specimen>
            <Specimen label="Search bar (Workspace) · compact select (table cells)">
              <div className="pds-row">
                <form className="ws-search pds-search" role="search" onSubmit={(e) => e.preventDefault()}>
                  <Icon name="search" />
                  <label htmlFor="pds-search" className="lra-sr">
                    Search
                  </label>
                  <input id="pds-search" placeholder="Search for profiles, accounts or applications…" />
                </form>
                <div className="lra-body pds-inline">
                  <select className="is-compact" aria-label="Currency" defaultValue="USD">
                    <option>USD</option>
                    <option>EUR</option>
                  </select>
                </div>
              </div>
            </Specimen>
          </Block>

          <Block title="Selection controls" note="16px checkboxes (4px corners) and radios, in the main colour (brand-700) when on, brand-50 on hover. The whole label is the hit target.">
            <Specimen>
              <div className="pds-row pds-gap-lg">
                <label className="lra-radio">
                  <input type="checkbox" defaultChecked /> Use as collateral
                </label>
                <label className="lra-radio">
                  <input type="checkbox" /> EML/PLC
                </label>
                <fieldset className="vp-yesno">
                  <legend>How is this deal secured?</legend>
                  <div className="lra-radios">
                    <label className="lra-radio">
                      <input type="radio" name="pds-r" defaultChecked /> Against collateral
                    </label>
                    <label className="lra-radio">
                      <input type="radio" name="pds-r" /> Unsecured
                    </label>
                  </div>
                </fieldset>
              </div>
            </Specimen>
          </Block>

          <Block title="Tags & switches" note="Selectable tags for in-card choices; a button group for filters; the black toggle for switching a whole prototype.">
            <Specimen label="Tags — default, selected, disabled">
              <div className="pds-row">
                <button type="button" className="lra-chip is-on">
                  <Icon name="check" size={18} />
                  Amendment
                </button>
                <button type="button" className="lra-chip">Replace</button>
                <button type="button" className="lra-chip">More actions</button>
                <span className="ws">
                  <button type="button" className="lra-chip is-disabled" aria-disabled="true">
                    Risk Watch
                  </button>
                </span>
              </div>
            </Specimen>
            <Specimen label="Button group">
              <div className="ws">
                <div className="ws-segmented" role="group" aria-label="Exception type">
                  <button type="button" className="is-on" aria-pressed="true">
                    <Icon name="check" size={18} />
                    All 36
                  </button>
                  <button type="button" aria-pressed="false">Collateral Shortfall 1</button>
                  <button type="button" aria-pressed="false">Misc. Collateral 35</button>
                </div>
              </div>
            </Specimen>
            <Specimen label="Prototype toggle — a tab on the frame's outline, flush left, in the site's Poppins">
              <Toggle
                label="Variant"
                value={demoToggle}
                onChange={setDemoToggle}
                options={[
                  { id: "a", label: "Current state" },
                  { id: "b", label: "P1 · One Request" },
                  { id: "c", label: "P2 · AI Agent" },
                ]}
              />
              <div className="pds-tab-edge" aria-hidden="true" />
            </Specimen>
          </Block>

          <Block title="Tabs" note="Underline tabs, text-sm semibold: gray-500 at rest, primary with a 2px underline when active.">
            <Specimen>
              <div className="lra-tabs" role="tablist" aria-label="Example tabs">
                {[
                  ["one", "Collaterals"],
                  ["two", "DM account"],
                  ["three", "Pre-Approved Offers"],
                ].map(([k, t]) => (
                  <button
                    key={k}
                    type="button"
                    role="tab"
                    aria-selected={demoTab === k}
                    className={"lra-tab" + (demoTab === k ? " is-active" : "")}
                    onClick={() => setDemoTab(k)}
                  >
                    <span>{t}</span>
                  </button>
                ))}
              </div>
            </Specimen>
          </Block>

          <Block title="Badges" note="Pill, 22px, text-xs semibold in all caps (0.04em tracking), 1px border. Colour carries meaning — never decoration.">
            <Specimen>
              <div className="pds-row">
                <span className="lra-pill is-good">Complete</span>
                <span className="lra-pill is-blue">Streamlined (SBL)</span>
                <span className="lra-pill is-violet">Tailored (Custom)</span>
                <span className="lra-pill is-warn">Due soon</span>
                <span className="lra-pill is-critical">Breached</span>
                <span className="lra-pill is-neutral">DRAFT</span>
                <span className="lra-pill is-blue ws-pill-icon">
                  <Icon name="sparkle" size={14} />
                  Filled by Coach
                </span>
              </div>
            </Specimen>
          </Block>

          <Block title="Alerts & toasts" note="Inline alerts: 25 tint, 300 border, 700 text, 20px icon. Toasts: white, gray-300 border, shadow-lg, dismissible.">
            <Specimen>
              <Banner>Please check the client's SAF and CAL are valid and lodged in Doc Manager.</Banner>
              <Banner tone="warning">Required: upload the Credit Request Form before submitting your ticket.</Banner>
              <Banner tone="success">Loan origination request has been successfully submitted.</Banner>
              <div className="pds-static">
                <div className="lra-snackbar">
                  <p>CDS transactions require an ISDA agreement. Consult the SBL team before proceeding.</p>
                  <button type="button" className="lra-icon-btn" aria-label="Dismiss">
                    <Icon name="close" />
                  </button>
                </div>
              </div>
            </Specimen>
          </Block>

          <Block title="Cards" note="White, 1px $divider-secondary border, 6px corners, shadow-xs, 20px padding. Selected: a 2px primary edge.">
            <Specimen>
              <div className="lra-facilities">
                {[false, true].map((sel) => (
                  <article key={String(sel)} className={"lra-facility" + (sel ? " is-selected" : "")}>
                    <div className="lra-facility-top">
                      <span className="lra-pill is-blue">Streamlined (SBL)</span>
                      <span className="lra-muted">Facility ID: 100000001</span>
                    </div>
                    <dl className="lra-kv">
                      <div>
                        <dt>Borrower(s)</dt>
                        <dd>Alex Morgan</dd>
                      </div>
                      <div>
                        <dt>Line size</dt>
                        <dd>2,000,000.00 USD</dd>
                      </div>
                    </dl>
                    <div className="lra-facility-actions">
                      <button type="button" className={"lra-chip" + (sel ? " is-on" : "")}>
                        {sel && <Icon name="check" size={18} />}
                        Amendment
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </Specimen>
            <Specimen label="Metric tiles (Workspace)">
              <div className="ws pds-metrics">
                <div className="ws-metrics">
                  <div className="ws-metric">
                    <span className="ws-metric-value">2,554</span>
                    <span className="ws-metric-label">In Flight</span>
                  </div>
                  <button type="button" className="ws-metric is-link">
                    <span className="ws-metric-value">549</span>
                    <span className="ws-metric-label">Pre-Approved Offers</span>
                  </button>
                </div>
              </div>
            </Specimen>
          </Block>

          <Block title="Tables" note="A card with a neutral-200 header row (13px semibold in $text-primary), 56px rows, $text-secondary cells and a $text-primary first column. Rows take $background-hover on hover and $row-selected when checked. Numbers right-aligned and tabular.">
            <Specimen>
              <div className="lra-table-wrap">
                <table className="lra-table">
                  <thead>
                    <tr>
                      <th scope="col">
                        <span className="lra-sr">Select</span>
                      </th>
                      <th scope="col">Client name</th>
                      <th scope="col">ECI</th>
                      <th scope="col">KYC</th>
                      <th scope="col">Currency</th>
                      <th scope="col" className="is-num">
                        Market value
                      </th>
                      <th scope="col">
                        <span className="lra-sr">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Adam Ross", "9876543210", "4,000,000.00"],
                      ["Carol Simpson", "9876543211", "1,250,000.00"],
                    ].map(([n, e, v], i) => (
                      <tr key={n}>
                        <td>
                          <input type="checkbox" defaultChecked={i === 0} aria-label={`Select ${n}`} />
                        </td>
                        <th scope="row">{n}</th>
                        <td>{e}</td>
                        <td>
                          <span className="lra-pill is-good">Complete</span>
                        </td>
                        <td>
                          <div className="lra-body pds-inline">
                            <select className="is-compact" aria-label={`Currency for ${n}`} defaultValue="USD">
                              <option>USD</option>
                              <option>EUR</option>
                            </select>
                          </div>
                        </td>
                        <td className="is-num">{v}</td>
                        <td>
                          <button type="button" className="lra-icon-btn" aria-label={`Delete ${n}`}>
                            <Icon name="delete" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Specimen>
          </Block>

          <Block title="Progress & loading" note="Steps show where the user is; bars show how much is done; the spinner covers short lookups (~1s).">
            <Specimen label="Progress steps">
              <ol className="lra-stepper">
                <li className="is-done">
                  <span className="lra-step-num" aria-hidden="true">
                    <Icon name="check" size={16} />
                  </span>
                  Client & facility
                </li>
                <li className="is-current" aria-current="step">
                  <span className="lra-step-num" aria-hidden="true">2</span>
                  Loan details
                </li>
                <li>
                  <span className="lra-step-num" aria-hidden="true">3</span>
                  Loan review
                </li>
              </ol>
            </Specimen>
            <Specimen label="Progress bar · slider · spinner · skeleton">
              <div className="pds-progress">
                <div className="vp-progress" role="progressbar" aria-label="Example" aria-valuenow={45} aria-valuemin={0} aria-valuemax={100}>
                  <span style={{ width: "45%" }} />
                </div>
                <div className="vp-slider">
                  <input type="range" aria-label="Requested line size" min={0} max={100} defaultValue={36} style={{ "--fill": "36%" }} />
                </div>
                <div className="pds-row">
                  <p className="lra-loading">
                    <span className="lra-spinner" aria-hidden="true" />
                    Loading client details…
                  </p>
                </div>
                <div className="vp-skeleton" aria-hidden="true">
                  <span />
                  <span />
                </div>
              </div>
            </Specimen>
          </Block>

          <Block title="Menus & tooltips" note="Menus: white, $divider-secondary border, 8px, shadow-lg, 40px items that take $background-hover. Tooltips: near-black, 8px, text-xs — for supplementary detail only.">
            <Specimen>
              <div className="pds-row pds-top pds-static">
                <div className="ws">
                  <div className="ws-menu" role="menu" aria-label="Row actions">
                    {["View deal", "Reassign", "Open in Loan Request"].map((t) => (
                      <button key={t} type="button" role="menuitem" className="ws-menu-item">
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="ws">
                  <div className="ws-menu" role="menu" aria-label="Columns">
                    {[
                      ["Client Name", true],
                      ["ECI", false],
                    ].map(([t, on]) => (
                      <button key={t} type="button" role="menuitemcheckbox" aria-checked={on} className="ws-menu-item">
                        <span className={"ws-menu-check" + (on ? " is-on" : "")} aria-hidden="true">
                          {on && <Icon name="check" size={14} />}
                        </span>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <span className="vp-tip" role="tooltip">
                  <strong>Proposal 2 – AI Application Agent</strong>
                  Fill the whole request by chatting with an assistant.
                </span>
              </div>
            </Specimen>
          </Block>

          <Block title="Empty & error states" note="A featured icon ($background-disabled well), one title and one line of guidance — plus the action that recovers, if there is one.">
            <Specimen>
              <div className="pds-states">
                <p className="lra-empty">Add a party to see lending opportunities and existing facilities.</p>
                <div className="ws">
                  <div className="ws-state">
                    <span className="ws-state-icon" aria-hidden="true">
                      <Icon name="cloudOff" size={28} />
                    </span>
                    <p className="ws-state-title">No data received from server</p>
                    <p className="lra-muted">The PLC conversions feed didn't respond.</p>
                    <button type="button" className="lra-btn is-secondary">
                      <Icon name="refresh" size={18} />
                      Retry
                    </button>
                  </div>
                </div>
              </div>
            </Specimen>
          </Block>

          {/* ---------------- Patterns ---------------- */}
          <Block title="Patterns" note="Recurring compositions across the three prototypes.">
            <Specimen label="Blocked continue — the footer names the one thing missing">
              <div className="lra-footer pds-footer">
                <p className="lra-footer-status">To continue: upload the Credit Request Form</p>
                <div className="lra-footer-btns">
                  <button type="button" className="lra-btn is-ghost">Abandon</button>
                  <button type="button" className="lra-btn is-primary" disabled>
                    Save & continue
                  </button>
                </div>
              </div>
            </Specimen>
            <Specimen label="Context strip — who and what the request is about, pinned above the steps">
              <dl className="lra-summary">
                {[
                  ["Client name", "ADAM ROSS"],
                  ["ECI", "9876543210"],
                  ["Loan request", "A12345678"],
                  ["Owner", "STEPHEN GREEN (F123456)"],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
                <div>
                  <dt>Status</dt>
                  <dd>
                    <span className="lra-pill is-neutral">DRAFT</span>
                  </dd>
                </div>
              </dl>
            </Specimen>
            <Specimen label="Path helper — a live route plus a short checklist beside the form (Proposal 1)" className="vp">
              <aside className="vp-path pds-path" aria-label="Path helper">
                <p className="vp-path-eyebrow">
                  <Icon name="sparkle" size={18} />
                  Path helper
                </p>
                <p className="vp-path-route">
                  <span className="lra-pill is-warn">Tailored — needs more security</span>
                </p>
                <p className="vp-path-why">Collateral lends $5.6M against an $8M line. Add $2.4M of security, or lower the line.</p>
                <ul className="vp-path-checks">
                  {[
                    ["Parties added", true],
                    ["Collateral selected", true],
                    ["Collateral covers the line", false],
                  ].map(([t, ok]) => (
                    <li key={t} className={ok ? "is-done" : ""}>
                      <span className="vp-check-dot" aria-hidden="true">
                        {ok && <Icon name="check" size={14} />}
                      </span>
                      {t}
                    </li>
                  ))}
                </ul>
              </aside>
            </Specimen>
          </Block>

          <Block title="Accessibility" note="Built in, not bolted on.">
            <Usage>
              <li>Text pairings meet WCAG AA (see Contrast); every interactive element shows a 2px brand-500 focus ring.</li>
              <li>Status changes are announced: footers, loaders, live stats and the chat log use <code>aria-live</code>.</li>
              <li>Toggles and tags expose <code>aria-pressed</code>; tabs use <code>role="tab"</code>; menus support arrow keys and Escape.</li>
              <li>Icon-only buttons carry <code>aria-label</code>; decorative icons and the browser chrome are <code>aria-hidden</code>.</li>
              <li>Motion (sliding toggle thumb, reveals, spinners) respects <code>prefers-reduced-motion</code>.</li>
            </Usage>
          </Block>

          <Block title="Source" note="Where each piece lives in the codebase.">
            <Usage>
              <li><code>src/components/lra/Lra.css</code> — tokens and every shared component.</li>
              <li><code>src/components/lra/ui.jsx</code> — Icon, Banner, Toggle. <code>frame.jsx</code> — the scaled browser frame.</li>
              <li><code>src/components/vision/Vision.css</code> — combobox, accordions, chat, live builder.</li>
              <li><code>src/components/workspace/Workspace.css</code> — Workspace shell, metrics, menus, button group.</li>
            </Usage>
          </Block>
        </div>
      </div>
    </article>
  );
}
