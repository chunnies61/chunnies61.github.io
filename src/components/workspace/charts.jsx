/* Small visuals for the Overview cards — plain SVG and CSS, in the design
   system's tokens, so each card carries one picture that reads at a glance. */

const fmt = (n) => n.toLocaleString("en-US");

/* A stacked bar of the pipeline by stage, with a legend */
export function PipelineBar({ stages }) {
  const total = stages.reduce((s, [, n]) => s + n, 0);
  return (
    <div className="ws-pipe">
      <div className="ws-pipe-bar" role="img" aria-label={`${fmt(total)} deals by stage`}>
        {stages.map(([label, n], i) => (
          <span
            key={label}
            className={`ws-pipe-seg is-${i}`}
            style={{ flexGrow: n, flexBasis: n ? "6px" : 0 }}
            title={`${label}: ${fmt(n)}`}
          />
        ))}
      </div>
      <ul className="ws-pipe-legend">
        {stages.map(([label, n], i) => (
          <li key={label}>
            <span className={`ws-dot is-seg-${i}`} aria-hidden="true" />
            <span className="ws-pipe-label">{label}</span>
            <strong>{fmt(n)}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* A ring split into healthy / watch / needs action, with the action count
   in the centre */
const R = 40;
const C = 2 * Math.PI * R;
export function HealthRing({ segments, value, label }) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  let offset = 0;
  return (
    <div className="ws-hring">
      <svg viewBox="0 0 100 100" role="img" aria-label={`${fmt(value)} ${label} of ${fmt(total)} facilities`}>
        <circle cx="50" cy="50" r={R} className="ws-hring-track" />
        {segments.map((s) => {
          const len = (s.value / total) * C;
          const el = (
            <circle
              key={s.label}
              cx="50"
              cy="50"
              r={R}
              className={`ws-hring-seg is-${s.tone}`}
              strokeDasharray={`${Math.max(len - 2, 0)} ${C - Math.max(len - 2, 0)}`}
              strokeDashoffset={-offset}
              transform="rotate(-90 50 50)"
            />
          );
          offset += len;
          return el;
        })}
        <text x="50" y="47" textAnchor="middle" className="ws-hring-value">
          {fmt(value)}
        </text>
        <text x="50" y="60" textAnchor="middle" className="ws-hring-label">
          {label}
        </text>
      </svg>
      <ul className="ws-hring-legend">
        {segments.map((s) => (
          <li key={s.label}>
            <span className={`ws-dot is-${s.tone}`} aria-hidden="true" />
            <span>{s.label}</span>
            <strong>{fmt(s.value)}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* A 30-day trend under a KPI */
export function Sparkline({ points }) {
  const w = 100;
  const h = 28;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const xy = points.map((p, i) => [(i / (points.length - 1)) * w, h - 3 - ((p - min) / span) * (h - 6)]);
  const line = xy.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `0,${h} ${line} ${w},${h}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="ws-spark" aria-hidden="true">
      <polygon points={area} className="ws-spark-area" />
      <polyline points={line} className="ws-spark-line" />
      <circle cx={xy[xy.length - 1][0]} cy={xy[xy.length - 1][1]} r="2.2" className="ws-spark-end" />
    </svg>
  );
}

/* Facilities plotted on the next 90 days */
export function Timeline({ items, horizon = 90, soon = 30 }) {
  return (
    <div className="ws-tl" role="img" aria-label={`${items.length} facilities maturing in the next ${horizon} days`}>
      <div className="ws-tl-track">
        <span className="ws-tl-soon" style={{ width: `${(soon / horizon) * 100}%` }} />
        {items.map(([client, facility, , days]) => (
          <span
            key={facility}
            className={"ws-tl-dot" + (days <= soon ? " is-soon" : "")}
            style={{ left: `${(days / horizon) * 100}%` }}
            title={`${client} · ${facility} · ${days} days`}
          >
            <span className="ws-tl-name">{client.split(" ").pop()}</span>
          </span>
        ))}
      </div>
      <div className="ws-tl-ticks">
        {[0, 30, 60, 90].map((d) => (
          <span key={d} style={{ left: `${(d / horizon) * 100}%` }}>
            {d === 0 ? "Today" : `${d}d`}
          </span>
        ))}
      </div>
    </div>
  );
}
