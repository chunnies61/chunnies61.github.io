import { useRef, useState } from "react";
import "./PilotScorecard.css";

/* The pilot scorecard: three figures, each in the form its data calls for.

   - NIGO rate     before → after on one 0–100% scale (a dumbbell)
   - Adoption      a single ratio against a limit (a meter)
   - Role mix      part-to-whole (a 100% stacked bar, legend always shown)

   Every value is labelled on the page, marks carry a hover/focus tooltip as
   an extra, and a table view holds the same numbers without any chart. */

const pct = (v) => `${Number.isInteger(v) ? v : v.toFixed(1)}%`;
const approx = (v) => `~${pct(v)}`;
// Shares are compared against each other, so they share one decimal place
const share = (v) => `${v.toFixed(1)}%`;

export default function PilotScorecard({ block }) {
  const { nigo, adoption, roleMix } = block;
  const [asTable, setAsTable] = useState(false);
  const [tip, setTip] = useState(null);
  const figRef = useRef(null);

  // Hovering or focusing a mark shows its value beside it.
  function showTip(e, value, label) {
    const fig = figRef.current?.getBoundingClientRect();
    const r = e.currentTarget.getBoundingClientRect();
    if (!fig) return;
    setTip({ value, label, x: r.left + r.width / 2 - fig.left, y: r.top - fig.top });
  }
  const hideTip = () => setTip(null);
  const mark = (value, label) => ({
    tabIndex: 0,
    "aria-label": `${label}: ${value}`,
    onPointerEnter: (e) => showTip(e, value, label),
    onPointerLeave: hideTip,
    onFocus: (e) => showTip(e, value, label),
    onBlur: hideTip,
  });

  const drop = nigo.baseline.value - nigo.current.value;
  const segments = roleMix.segments;

  return (
    <figure className="cs-sc" ref={figRef}>
      <div className="cs-sc-head">
        <figcaption>
          <span className="cs-sc-title md-title-small">{block.title}</span>
          <span className="cs-sc-caption md-body-small">{block.caption}</span>
        </figcaption>
        <button
          type="button"
          className="cs-sc-toggle md-label-medium"
          aria-pressed={asTable}
          onClick={() => {
            setAsTable((t) => !t);
            hideTip();
          }}
        >
          {asTable ? "Show chart" : "Show table"}
        </button>
      </div>

      {asTable ? (
        <div className="cs-sc-table-wrap">
          <table className="cs-sc-table md-body-small">
            <thead>
              <tr>
                <th scope="col">Metric</th>
                <th scope="col" className="is-num">
                  Value
                </th>
                <th scope="col">Context</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">{nigo.label}, {nigo.baseline.label.toLowerCase()}</th>
                <td className="is-num">{approx(nigo.baseline.value)}</td>
                <td>Before the redesign</td>
              </tr>
              <tr>
                <th scope="row">{nigo.label}, {nigo.current.label.toLowerCase()}</th>
                <td className="is-num">{approx(nigo.current.value)}</td>
                <td>{nigo.note}</td>
              </tr>
              <tr>
                <th scope="row">{adoption.label}</th>
                <td className="is-num">{approx(adoption.value)}</td>
                <td>{adoption.note}</td>
              </tr>
              <tr>
                <th scope="row">{roleMix.label}</th>
                <td className="is-num">~{roleMix.value}</td>
                <td>{roleMix.note}</td>
              </tr>
              {segments.map((s) => (
                <tr key={s.name}>
                  <th scope="row">Share of weekly actives: {s.name}</th>
                  <td className="is-num">{share(s.value)}</td>
                  <td>{s.other ? "All roles not listed above" : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="cs-sc-panels">
          {/* NIGO — dumbbell */}
          <section className="cs-sc-panel" aria-label={nigo.label}>
            <p className="cs-sc-label md-label-large">{nigo.label}</p>
            <p className="cs-sc-value">{approx(nigo.current.value)}</p>
            <p className="cs-sc-note md-body-small">
              <span aria-hidden="true">↓ </span>
              {drop} pts from {approx(nigo.baseline.value)} · {nigo.note.toLowerCase()}
            </p>

            <div className="cs-sc-scale">
              <div className="cs-sc-track" aria-hidden="true">
                <span
                  className="cs-sc-span"
                  style={{
                    left: `${nigo.current.value}%`,
                    width: `${drop}%`,
                  }}
                />
              </div>
              {[
                { ...nigo.baseline, cls: "is-baseline" },
                { ...nigo.current, cls: "is-current" },
              ].map((pt) => (
                <span
                  key={pt.label}
                  className={"cs-sc-dot-wrap " + pt.cls}
                  style={{ left: `${pt.value}%` }}
                >
                  <span className="cs-sc-dot-label md-label-small">
                    {pt.label} {approx(pt.value)}
                  </span>
                  <span className="cs-sc-hit" {...mark(approx(pt.value), `${nigo.label}, ${pt.label}`)}>
                    <span className="cs-sc-dot" />
                  </span>
                </span>
              ))}
              <div className="cs-sc-ticks md-label-small" aria-hidden="true">
                {[0, 25, 50, 75, 100].map((t) => (
                  <span key={t} style={{ left: `${t}%` }}>
                    {t}%
                  </span>
                ))}
              </div>
            </div>
            {/* On narrow screens the labels beside the dots don't fit — the same
                values move into a key under the scale */}
            <ul className="cs-sc-dumbbell-key md-body-small">
              {[
                { ...nigo.baseline, cls: "is-baseline" },
                { ...nigo.current, cls: "is-current" },
              ].map((pt) => (
                <li key={pt.label} className={pt.cls}>
                  <span className="cs-sc-dot" aria-hidden="true" />
                  {pt.label} <strong>{approx(pt.value)}</strong>
                </li>
              ))}
            </ul>
          </section>

          {/* Adoption — meter */}
          <section className="cs-sc-panel" aria-label={adoption.label}>
            <p className="cs-sc-label md-label-large">{adoption.label}</p>
            <p className="cs-sc-value">{approx(adoption.value)}</p>
            <p className="cs-sc-note md-body-small">{adoption.note}</p>

            <div className="cs-sc-scale">
              <div className="cs-sc-meter">
                <span
                  className="cs-sc-meter-fill"
                  style={{ width: `${adoption.value}%` }}
                  {...mark(approx(adoption.value), adoption.label)}
                />
              </div>
              <div className="cs-sc-ticks md-label-small" aria-hidden="true">
                {[0, 25, 50, 75, 100].map((t) => (
                  <span key={t} style={{ left: `${t}%` }}>
                    {t}%
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Role mix — 100% stacked bar */}
          <section className="cs-sc-panel is-wide" aria-label="Weekly-active role mix">
            <div className="cs-sc-mix-head">
              <div>
                <p className="cs-sc-label md-label-large">{roleMix.label}</p>
                <p className="cs-sc-value">~{roleMix.value}</p>
                <p className="cs-sc-note md-body-small">{roleMix.note}</p>
              </div>
              <p className="cs-sc-mix-title md-label-medium">Share of weekly actives by role</p>
            </div>

            <div className="cs-sc-stack">
              {segments.map((s, i) => (
                <span
                  key={s.name}
                  className={"cs-sc-seg" + (s.other ? " is-other" : ` is-s${i + 1}`)}
                  style={{ flexBasis: `${s.value}%` }}
                  {...mark(share(s.value), s.name)}
                />
              ))}
            </div>

            <ul className="cs-sc-legend md-body-small">
              {segments.map((s, i) => (
                <li key={s.name}>
                  <span
                    className={"cs-sc-swatch" + (s.other ? " is-other" : ` is-s${i + 1}`)}
                    aria-hidden="true"
                  />
                  <span className="cs-sc-legend-name">{s.name}</span>
                  <span className="cs-sc-legend-value">{share(s.value)}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}

      {tip && !asTable && (
        <div
          className="cs-sc-tip"
          role="presentation"
          style={{ left: tip.x, top: tip.y }}
        >
          <strong className="md-label-large">{tip.value}</strong>
          <span className="md-body-small">{tip.label}</span>
        </div>
      )}
    </figure>
  );
}
