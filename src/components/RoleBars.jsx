import { useRef, useState } from "react";
import "./PilotScorecard.css"; // the card frame, toggle, tooltip, table and series colours
import "./RoleBars.css";

/* Who uses a product, by role, as ranked horizontal bars on one baseline. An
   "emphasis" chart: the roles the story is about ("highlight") are in the primary
   blue, the rest in gray, with a small key saying which is which. Every bar carries
   its name and share, bars have a hover/focus tooltip, and a table view holds the
   same numbers. Scaled to the largest share so the bars use the full width. */

const pct = (v) => `${v}%`;

export default function RoleBars({ block }) {
  const { title, caption, rows, highlightLabel, otherLabel } = block;
  const max = Math.max(...rows.map((r) => r.value));
  const [asTable, setAsTable] = useState(false);
  const [tip, setTip] = useState(null);
  const figRef = useRef(null);

  function showTip(e, r) {
    const fig = figRef.current?.getBoundingClientRect();
    const b = e.currentTarget.getBoundingClientRect();
    if (!fig) return;
    const pad = 70;
    const x = Math.min(Math.max(b.right - fig.left, pad), fig.width - pad);
    setTip({ r, x, y: b.top - fig.top });
  }
  const hideTip = () => setTip(null);

  return (
    <figure className="cs-sc cs-rb" ref={figRef}>
      <div className="cs-sc-head">
        <figcaption>
          <span className="cs-sc-title md-title-small">{title}</span>
          {caption && <span className="cs-sc-caption md-body-small">{caption}</span>}
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
                <th scope="col">Role</th>
                <th scope="col" className="is-num">
                  Share of usage
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.name}>
                  <th scope="row">
                    {r.name}
                    {r.highlight && highlightLabel ? ` (${highlightLabel.toLowerCase()})` : ""}
                  </th>
                  <td className="is-num">{pct(r.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          {(highlightLabel || otherLabel) && (
            <ul className="cs-rb-key md-body-small" aria-hidden="true">
              {highlightLabel && (
                <li>
                  <span className="cs-rb-swatch is-hl" />
                  {highlightLabel}
                </li>
              )}
              {otherLabel && (
                <li>
                  <span className="cs-rb-swatch" />
                  {otherLabel}
                </li>
              )}
            </ul>
          )}
          <ol className="cs-rb-list">
            {rows.map((r) => (
              <li key={r.name} className={"cs-rb-row" + (r.highlight ? " is-hl" : "")}>
                <span className="cs-rb-name">{r.name}</span>
                <span className="cs-rb-track">
                  <span
                    className="cs-rb-bar"
                    style={{ width: `${(r.value / max) * 100}%` }}
                    tabIndex={0}
                    aria-label={`${r.name}: ${pct(r.value)}`}
                    onPointerEnter={(e) => showTip(e, r)}
                    onPointerLeave={hideTip}
                    onFocus={(e) => showTip(e, r)}
                    onBlur={hideTip}
                  />
                </span>
                <span className="cs-rb-val">{pct(r.value)}</span>
              </li>
            ))}
          </ol>
          {tip && (
            <div className="cs-sc-tip md-label-medium" style={{ left: tip.x, top: tip.y }} role="presentation">
              <strong>
                {tip.r.name}: {pct(tip.r.value)}
              </strong>
            </div>
          )}
        </>
      )}
    </figure>
  );
}
