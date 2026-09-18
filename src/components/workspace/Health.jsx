import { useState } from "react";
import { Icon } from "../lra/ui";
import {
  ALLOCATION,
  ANNUAL,
  CAPACITY,
  COACH,
  COVENANTS,
  CRITICAL,
  HEALTH_PILLS,
  KPIS,
  REVIEWS,
  UTILIZATION,
} from "./data";
import { Card } from "./Overview";
import { DataTable } from "./table";

/* Portfolio Health — pill tabs over a portfolio dashboard (Portfolio View)
   and an exceptions table (Annual Review). The other pills aren't built. */

const R = 40;
const C = 2 * Math.PI * R;
const GAP = 2; // px between donut segments

function Donut() {
  let offset = 0;
  return (
    <div className="ws-chart">
      <svg viewBox="0 0 100 100" className="ws-donut" role="img" aria-label="Collateral allocation, $305B pledged">
        {ALLOCATION.map(([label, pct, color]) => {
          const len = (pct / 100) * C;
          const seg = (
            <circle
              key={label}
              cx="50"
              cy="50"
              r={R}
              fill="none"
              stroke={color}
              strokeWidth="14"
              strokeDasharray={`${Math.max(len - GAP, 0)} ${C}`}
              strokeDashoffset={-offset}
              transform="rotate(-90 50 50)"
            />
          );
          offset += len;
          return seg;
        })}
        <text x="50" y="48" textAnchor="middle" className="ws-donut-value">
          $305B
        </text>
        <text x="50" y="60" textAnchor="middle" className="ws-donut-label">
          pledged
        </text>
      </svg>
      <ul className="ws-legend">
        {ALLOCATION.map(([label, pct, color]) => (
          <li key={label}>
            <span className="ws-swatch" style={{ background: color }} aria-hidden="true" />
            <span>{label}</span>
            <strong>{pct}%</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Utilization() {
  const len = (UTILIZATION.pct / 100) * C;
  return (
    <div className="ws-chart">
      <svg viewBox="0 0 100 100" className="ws-donut" role="img" aria-label={`${UTILIZATION.pct}% of lines utilized`}>
        <circle cx="50" cy="50" r={R} fill="none" className="ws-ring-track" strokeWidth="14" />
        <circle
          cx="50"
          cy="50"
          r={R}
          fill="none"
          stroke="var(--md-primary)"
          strokeWidth="14"
          strokeDasharray={`${len} ${C}`}
          transform="rotate(-90 50 50)"
        />
        <text x="50" y="48" textAnchor="middle" className="ws-donut-value">
          {UTILIZATION.pct}%
        </text>
        <text x="50" y="60" textAnchor="middle" className="ws-donut-label">
          utilized
        </text>
      </svg>
      <dl className="ws-list">
        {[
          ["Used/OS", UTILIZATION.used],
          ["Available", UTILIZATION.available],
          ["Undrawn", UTILIZATION.undrawn],
        ].map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

const SEVERITY = {
  critical: ["is-critical", "Critical"],
  warning: ["is-warn", "Due soon"],
  opportunity: ["is-good", "Opportunity"],
};
const COVENANT_TONE = { Breached: "is-critical", "Cert due": "is-warn", "At risk": "is-warn", "In compliance": "is-good" };

function PortfolioView({ openAnnual, onPlaceholder }) {
  return (
    <div className="ws-health">
      <dl className="ws-kpis">
        {KPIS.map(([label, value, note, tone]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
            <dd className={`ws-kpi-note is-${tone}`}>
              {tone === "up" && <Icon name="trendingUp" size={16} />}
              {note}
            </dd>
          </div>
        ))}
      </dl>

      <div className="ws-grid-2">
        <Card title="Collateral Allocation">
          <Donut />
        </Card>
        <Card title="Line Utilization">
          <Utilization />
        </Card>

        <Card title={`Critical Actions (${CRITICAL.length})`}>
          <ul className="ws-rows">
            {CRITICAL.map(([sev, kind, client, detail]) => (
              <li key={kind}>
                <span className={`ws-dot ${SEVERITY[sev][0]}`} aria-hidden="true" />
                <span className="ws-row-main">
                  <strong>{kind}</strong>
                  <span className="lra-muted">
                    {client} · {detail}
                  </span>
                </span>
                <span className={`lra-pill ${SEVERITY[sev][0]}`}>{SEVERITY[sev][1]}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title={`Covenant Monitoring (${COVENANTS.length})`}>
          <ul className="ws-rows">
            {COVENANTS.map(([client, status, detail]) => (
              <li key={client}>
                <span className="ws-row-main">
                  <strong>{client}</strong>
                  <span className="lra-muted">{detail}</span>
                </span>
                <span className={`lra-pill ${COVENANT_TONE[status]}`}>{status}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title={`Annual Review (${REVIEWS.length})`}>
          <ul className="ws-rows">
            {REVIEWS.map(([client, status, detail]) => (
              <li key={client}>
                <span className="ws-row-main">
                  <strong>{client}</strong>
                  <span className={status === "Overdue" ? "ws-overdue" : "lra-muted"}>{detail}</span>
                </span>
                <button type="button" className="lra-btn is-ghost" onClick={openAnnual}>
                  Start review
                </button>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Capacity — Servicing vs. Origination">
          <div
            className="ws-split-bar"
            role="img"
            aria-label={`${CAPACITY.servicing}% servicing, ${CAPACITY.origination}% new origination`}
          >
            <span style={{ width: `${CAPACITY.servicing}%` }} />
            <span style={{ width: `${CAPACITY.origination}%` }} />
          </div>
          <dl className="ws-list is-inline">
            <div>
              <dt>
                <span className="ws-swatch is-servicing" aria-hidden="true" />
                Servicing
              </dt>
              <dd>{CAPACITY.servicing}%</dd>
            </div>
            <div>
              <dt>
                <span className="ws-swatch is-origination" aria-hidden="true" />
                New origination
              </dt>
              <dd>{CAPACITY.origination}%</dd>
            </div>
          </dl>
          <p className="ws-ai-note">
            <Icon name="sparkle" size={18} />
            Automating collateral follow-ups and review prep could free about 9 hrs/week for
            origination.
          </p>
        </Card>
      </div>

      <Card
        title="Proactive Insights & Deepening Opportunities"
        aside={
          <span className="lra-pill is-blue ws-pill-icon">
            <Icon name="sparkle" size={14} />
            Coach AI
          </span>
        }
      >
        <div className="ws-coach">
          {COACH.map((c) => (
            <article key={c.kind} className="ws-coach-card">
              <p className="ws-coach-kind">{c.kind}</p>
              <p className="ws-coach-title">{c.title}</p>
              <p className="lra-muted">{c.body}</p>
              <div className="ws-coach-actions">
                <button type="button" className="lra-btn is-secondary" onClick={() => onPlaceholder("Simulate opens Book Simulation, which isn't built here.")}>
                  Simulate
                </button>
                <button type="button" className="lra-btn is-tonal" onClick={() => onPlaceholder("Start in LRA opens the Loan Request App — try it in the prototype above.")}>
                  Start in LRA
                </button>
              </div>
            </article>
          ))}
        </div>
      </Card>
    </div>
  );
}

const SEGMENTS = [
  ["all", "All", 36],
  ["Collateral Shortfall", "Collateral Shortfall", 1],
  ["Misc. Collateral", "Misc. Collateral", 35],
];

function AnnualReview({ onPlaceholder }) {
  const [seg, setSeg] = useState("all");
  const rows = seg === "all" ? ANNUAL : ANNUAL.filter((r) => r.sub === seg);
  return (
    <div className="ws-section">
      <div className="ws-segmented" role="group" aria-label="Exception type">
        {SEGMENTS.map(([k, label, count]) => (
          <button
            key={k}
            type="button"
            aria-pressed={seg === k}
            className={seg === k ? "is-on" : ""}
            onClick={() => setSeg(k)}
          >
            {seg === k && <Icon name="check" size={18} />}
            {label} {count}
          </button>
        ))}
      </div>
      <DataTable
        key={seg}
        caption="Annual review exceptions"
        onPlaceholder={onPlaceholder}
        rows={rows}
        columns={[
          { key: "client", label: "Client Name" },
          { key: "decisionMaker", label: "Decision Maker" },
          { key: "facility", label: "Facility Type" },
          { key: "type", label: "Exception Type" },
          { key: "sub", label: "Exception Sub-type" },
          { key: "age", label: "Exception Age", num: true, render: (r) => `${r.age} days` },
          { key: "status", label: "Status" },
          { key: "owner", label: "Owner" },
        ]}
      />
    </div>
  );
}

export default function PortfolioHealth({ pill, setPill, onPlaceholder }) {
  return (
    <div className="ws-section">
      <div className="ws-pills" role="tablist" aria-label="Portfolio Health views">
        {HEALTH_PILLS.map(([k, label, built]) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={pill === k}
            aria-disabled={!built}
            className={"lra-chip" + (pill === k ? " is-on" : "") + (built ? "" : " is-disabled")}
            onClick={() => (built ? setPill(k) : onPlaceholder(`${label} isn't built in this prototype.`))}
          >
            {pill === k && <Icon name="check" size={18} />}
            {label}
          </button>
        ))}
      </div>
      <div role="tabpanel">
        {pill === "annual" ? (
          <AnnualReview onPlaceholder={onPlaceholder} />
        ) : (
          <PortfolioView openAnnual={() => setPill("annual")} onPlaceholder={onPlaceholder} />
        )}
      </div>
    </div>
  );
}
