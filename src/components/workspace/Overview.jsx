import { useState } from "react";
import { Icon } from "../lra/ui";
import {
  HEALTH_SPLIT,
  HEALTH_TILES,
  INSIGHTS,
  MATURITIES,
  NEWSLETTER,
  PENDING_APPROVALS,
  PIPELINE,
  TASKS,
  TOP_DEALS,
} from "./data";
import { HealthRing, PipelineBar, Sparkline, Timeline } from "./charts";

/* Overview — the landing dashboard: three columns of cards. Card titles and
   metric tiles jump to the matching section. */

const fmt = (n) => n.toLocaleString("en-US");

export function Card({ title, onOpen, aside, children, className = "" }) {
  return (
    <section className={`ws-card ${className}`}>
      <div className="ws-card-head">
        {onOpen ? (
          <h5>
            <button type="button" className="ws-card-link" onClick={onOpen}>
              {title}
              <Icon name="chevronRight" size={20} />
            </button>
          </h5>
        ) : (
          <h5>{title}</h5>
        )}
        {aside}
      </div>
      {children}
    </section>
  );
}

// `labelFirst` puts the caption above the number
function Metric({ label, value, onClick, labelFirst = false, tone }) {
  const v = <span className="ws-metric-value">{typeof value === "number" ? fmt(value) : value}</span>;
  const l = (
    <span className="ws-metric-label">
      {tone && <span className={`ws-dot is-${tone}`} aria-hidden="true" />}
      {label}
    </span>
  );
  const body = labelFirst ? (
    <>
      {l}
      {v}
    </>
  ) : (
    <>
      {v}
      {l}
    </>
  );
  return onClick ? (
    <button type="button" className="ws-metric is-link" onClick={onClick}>
      {body}
    </button>
  ) : (
    <div className="ws-metric">{body}</div>
  );
}

const PRIORITY_TONE = { High: "is-critical", Medium: "is-warn", Low: "is-neutral" };
const PER_PAGE = 3;

function pagesFor(total, current) {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set([1, 2, total - 1, total, current]);
  const out = [];
  [...set]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b)
    .forEach((p, i, arr) => {
      if (i && p - arr[i - 1] > 1) out.push("…" + p);
      out.push(p);
    });
  return out;
}

function OpenTasks({ onPlaceholder }) {
  const [tab, setTab] = useState("me");
  const [page, setPage] = useState(1);
  const all = TASKS[tab];
  const total = Math.ceil(all.length / PER_PAGE);
  const rows = all.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <Card title="My Open Tasks">
      <div className="lra-tabs ws-task-tabs" role="tablist" aria-label="Tasks">
        {[
          ["me", `Assigned to me (${TASKS.me.length})`],
          ["team", `Assigned to My Team (${TASKS.team.length})`],
        ].map(([k, label]) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={tab === k}
            className={"lra-tab" + (tab === k ? " is-active" : "")}
            onClick={() => {
              setTab(k);
              setPage(1);
            }}
          >
            <span>{label}</span>
          </button>
        ))}
      </div>
      <ul className="ws-tasks" role="tabpanel">
        {rows.map((t) => (
          <li key={t.ticket}>
            <button
              type="button"
              className="ws-task"
              onClick={() => onPlaceholder("Tasks open the unified-workflow prototype, which isn't embedded here.")}
            >
              <span className="ws-task-main">
                <span className="ws-task-ticket">Ticket #{t.ticket}</span>
                <span className="ws-task-title">{t.title}</span>
                <span className="ws-task-assignee">
                  <span className="ws-task-avatar" aria-hidden="true">
                    {t.assignee
                      .split(" ")
                      .map((w) => w[0])
                      .join("")}
                  </span>
                  {t.assignee}
                </span>
              </span>
              <span className="ws-task-meta">
                <span className={`lra-pill ${PRIORITY_TONE[t.priority]}`}>{t.priority}</span>
                <span className="lra-muted">Due in {t.due} days</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <nav className="ws-pager" aria-label="Task pages">
        {pagesFor(total, page).map((p) =>
          typeof p === "string" ? (
            <span key={p} className="ws-pager-gap" aria-hidden="true">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              className={p === page ? "is-on" : ""}
              aria-current={p === page ? "page" : undefined}
              aria-label={`Page ${p}`}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          )
        )}
      </nav>
    </Card>
  );
}

export default function Overview({ go, onPlaceholder }) {
  const placeholder = () => onPlaceholder("Table tools on the Overview are placeholders — open Deal Journey for the full table.");
  return (
    <div className="ws-overview">
      {/* Column 1 */}
      <div className="ws-col">
        <Card title="Deal Journey Tracker" onOpen={() => go("deals")}>
          <PipelineBar stages={PIPELINE} />
          <div className="ws-mini-head">
            <p className="ws-mini-title">Top deals</p>
            <div className="ws-mini-tools">
              {[
                ["filter", "Filter top deals"],
                ["search", "Search top deals"],
                ["columns", "Choose columns"],
              ].map(([icon, label]) => (
                <button key={icon} type="button" className="lra-icon-btn is-small ws-tool" aria-label={label} onClick={placeholder}>
                  <Icon name={icon} size={18} />
                </button>
              ))}
            </div>
          </div>
          <table className="ws-mini-table">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col" className="is-num">
                  Line Size
                </th>
              </tr>
            </thead>
            <tbody>
              {TOP_DEALS.map((n) => (
                <tr key={n}>
                  <th scope="row">{n}</th>
                  <td className="is-num">$0.00</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card title="Portfolio Health" onOpen={() => go("health")}>
          <HealthRing segments={HEALTH_SPLIT} value={336} label="need action" />
          <div className="ws-tiles">
            {HEALTH_TILES.map(([label, value, pill, tone]) => (
              <Metric key={label} label={label} value={value} labelFirst tone={tone} onClick={() => go("health", pill ?? "portfolio")} />
            ))}
          </div>
        </Card>

        <Card title="Pending Approvals" aside={<span className="lra-pill is-neutral">{PENDING_APPROVALS.length} waiting</span>} onOpen={() => go("deals")}>
          <table className="ws-mini-table">
            <thead>
              <tr>
                <th scope="col">Client</th>
                <th scope="col">With</th>
                <th scope="col">Waiting</th>
                <th scope="col" className="is-num">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {PENDING_APPROVALS.map(([client, product, team, days, amount]) => (
                <tr key={client}>
                  <th scope="row">
                    {client}
                    <span className="ws-mini-sub">{product}</span>
                  </th>
                  <td>{team}</td>
                  <td>
                    <span className={"lra-pill " + (days >= 7 ? "is-warn" : "is-neutral")}>{days} days</span>
                  </td>
                  <td className="is-num">{amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {/* Column 2 */}
      <div className="ws-col">
        <Card title="Insights" aside={<span className="lra-pill is-neutral">May 2026</span>}>
          <div className="ws-tiles is-2">
            {INSIGHTS.map(([label, value, series]) => (
              <div key={label} className="ws-metric">
                <span className="ws-metric-label">{label}</span>
                <span className="ws-metric-value">{value}</span>
                <Sparkline points={series} />
                <span className="ws-delta">
                  <Icon name="trendingUp" size={16} />
                  30-day trend
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Margin Call/Near Margin">
          <table className="ws-mini-table">
            <thead>
              <tr>
                <th scope="col">Product Group</th>
                <th scope="col" className="is-num">
                  Margin Call
                </th>
                <th scope="col" className="is-num">
                  Near Margin
                </th>
              </tr>
            </thead>
            <tbody>
              {["Reg T Margin", "Reg U SBL"].map((g) => (
                <tr key={g}>
                  <th scope="row">{g}</th>
                  <td className="is-num">0</td>
                  <td className="is-num">0</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card title="Past Due Payments">
          <dl className="ws-list">
            {["60+ days", "30–59 Days", "< 30 days", "Current not on auto-debit"].map((k) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>0</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card title="Upcoming Maturities" aside={<span className="lra-pill is-neutral">Next 90 days</span>} onOpen={() => go("deals")}>
          <Timeline items={MATURITIES} />
          <table className="ws-mini-table">
            <thead>
              <tr>
                <th scope="col">Client</th>
                <th scope="col">Facility</th>
                <th scope="col">Matures</th>
                <th scope="col" className="is-num">
                  Line Size
                </th>
              </tr>
            </thead>
            <tbody>
              {MATURITIES.map(([client, facility, type, days, line]) => (
                <tr key={facility}>
                  <th scope="row">{client}</th>
                  <td>
                    {facility}
                    <span className="ws-mini-sub">{type}</span>
                  </td>
                  <td>
                    <span className={"lra-pill " + (days <= 30 ? "is-warn" : "is-neutral")}>{days} days</span>
                  </td>
                  <td className="is-num">{line}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {/* Column 3 */}
      <div className="ws-col">
        <OpenTasks onPlaceholder={onPlaceholder} />

        <Card title="New" aside={<span className="lra-muted">{NEWSLETTER.date}</span>}>
          <article className="ws-news">
            <h6>{NEWSLETTER.title}</h6>
            {NEWSLETTER.paragraphs.map((p) => (
              <p key={p.slice(0, 20)}>{p}</p>
            ))}
            <p className="ws-news-sign">
              <strong>{NEWSLETTER.signature}</strong>
              <br />
              {NEWSLETTER.role}
            </p>
          </article>
        </Card>
      </div>
    </div>
  );
}
