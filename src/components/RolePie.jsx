import { useRef, useState } from "react";
import "./PilotScorecard.css"; // the card frame, tooltip and series colours
import "./RolePie.css";

/* Part-to-whole as a pie: who uses a product, by role. Kept to four slices (the
   roles the story is about, then "Other roles"), each with its share printed on it,
   a legend that names every slice with its share (and the roles folded into "Other"),
   and a hover/focus tooltip. */

const pct = (v) => `${v}%`;
const R = 100; // pie radius in the 220-unit viewBox
const C = 110; // centre

// The point at `share` (0–1) of the way round the circle, starting at 12 o'clock
const at = (share, r = R) => {
  const a = share * 2 * Math.PI - Math.PI / 2;
  return [C + r * Math.cos(a), C + r * Math.sin(a)];
};

export default function RolePie({ block }) {
  const { title, caption, segments } = block;
  const total = segments.reduce((n, s) => n + s.value, 0);
  const [tip, setTip] = useState(null);
  const figRef = useRef(null);

  let start = 0;
  const slices = segments.map((s, i) => {
    const from = start / total;
    start += s.value;
    const to = start / total;
    const [x1, y1] = at(from);
    const [x2, y2] = at(to);
    const large = to - from > 0.5 ? 1 : 0;
    const d = `M${C} ${C} L${x1.toFixed(2)} ${y1.toFixed(2)} A${R} ${R} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
    const [lx, ly] = at((from + to) / 2, R * 0.64);
    const cls = s.other ? "is-other" : `is-s${i + 1}`;
    return { ...s, d, lx, ly, cls };
  });

  // The tooltip sits just above the slice's own share label, kept inside the card
  function showTip(e, s) {
    const fig = figRef.current?.getBoundingClientRect();
    const svg = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
    if (!fig || !svg) return;
    const k = svg.width / 220;
    const x = svg.left - fig.left + s.lx * k;
    const y = svg.top - fig.top + s.ly * k - 10;
    const pad = 90;
    setTip({ s, x: Math.min(Math.max(x, pad), fig.width - pad), y });
  }
  const hideTip = () => setTip(null);

  return (
    <figure className="cs-sc cs-pie" ref={figRef}>
      <div className="cs-sc-head">
        <figcaption>
          <span className="cs-sc-title md-title-small">{title}</span>
          {caption && <span className="cs-sc-caption md-body-small">{caption}</span>}
        </figcaption>
      </div>

      <div className="cs-pie-body">
          <svg className="cs-pie-svg" viewBox="0 0 220 220" role="img" aria-label={`${title}: ${segments.map((s) => `${s.name} ${pct(s.value)}`).join(", ")}`}>
            {slices.map((s) => (
              <path
                key={s.name}
                d={s.d}
                className={`cs-pie-slice ${s.cls}`}
                tabIndex={0}
                aria-label={`${s.name}: ${pct(s.value)}`}
                onPointerEnter={(e) => showTip(e, s)}
                onPointerLeave={hideTip}
                onFocus={(e) => showTip(e, s)}
                onBlur={hideTip}
              />
            ))}
            {slices.map((s) => (
              <text key={s.name} x={s.lx} y={s.ly} className={`cs-pie-pct ${s.cls}`} textAnchor="middle" dominantBaseline="central" aria-hidden="true">
                {pct(s.value)}
              </text>
            ))}
          </svg>

          <ul className="cs-pie-legend">
            {slices.map((s) => (
              <li key={s.name}>
                <span className={`cs-pie-swatch ${s.cls}`} aria-hidden="true" />
                <span className="cs-pie-name">
                  {s.name}
                  {s.parts && <span className="cs-pie-parts">{s.parts.map((p) => `${p.name} ${pct(p.value)}`).join(" · ")}</span>}
                </span>
                <span className="cs-pie-val">{pct(s.value)}</span>
              </li>
            ))}
          </ul>

          {tip && (
            <div className="cs-sc-tip md-label-medium" style={{ left: tip.x, top: tip.y }} role="presentation">
              <strong>
                {tip.s.name}: {pct(tip.s.value)}
              </strong>
            </div>
          )}
      </div>
    </figure>
  );
}
