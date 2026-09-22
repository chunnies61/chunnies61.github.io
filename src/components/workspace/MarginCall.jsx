import { useState } from "react";
import { Icon } from "../lra/ui";
import { MARGIN_CAUSES, MARGIN_COLUMNS, MARGIN_GROUPS, MARGIN_META, USER_ID } from "./data";

/* Margin Call — the GCM margin-calls queue, grouped by review status. Groups
   expand into their calls; the counts are real, the rows are sample. */

const LOBS = ["USPB", "IPB EMEA", "IPB APAC"];
const TEAMS = ["Collateral Ops", "Margin Desk", "Credit Risk"];
const RAG = [
  ["Red", "is-critical"],
  ["Amber", "is-warn"],
  ["Green", "is-good"],
];

const usd = (n) => `$${n.toLocaleString("en-US")}`;

// A group's rows, derived from its id so they stay stable across renders
function rowsFor(id, count) {
  return Array.from({ length: Math.min(count, 4) }, (_, i) => {
    const seed = id.length + i;
    const [rag, ragTone] = RAG[seed % 3];
    return {
      lob: LOBS[seed % 3],
      ticket: `MC-${40100 + seed * 37}`,
      arrangement: `ARR-${880000 + seed * 411}`,
      issued: `${10 + (seed % 18)}/Sep/2026`,
      cause: MARGIN_CAUSES[seed % MARGIN_CAUSES.length],
      classified: id === "invalid" ? "Invalid" : id === "unreviewed" ? "Unreviewed" : "Valid",
      amount: 250000 + seed * 137500,
      rag,
      ragTone,
      team: TEAMS[seed % 3],
    };
  });
}

function Group({ group, open, onToggle }) {
  const [id, label, count, tone] = group;
  const rows = rowsFor(id, count);
  return (
    <>
      <tr className="ws-mc-group">
        <th scope="rowgroup" colSpan={MARGIN_COLUMNS.length}>
          <button type="button" aria-expanded={open} onClick={onToggle}>
            <span className={"ws-mc-caret" + (open ? " is-open" : "")} aria-hidden="true">
              <Icon name="chevronRight" size={20} />
            </span>
            {label}
            <span className={`lra-pill ${tone}`}>{count.toLocaleString("en-US")}</span>
          </button>
        </th>
      </tr>
      {open &&
        rows.map((r) => (
          <tr key={r.ticket}>
            <td>{r.lob}</td>
            <th scope="row">{r.ticket}</th>
            <td>{r.arrangement}</td>
            <td>{r.issued}</td>
            <td>{r.cause}</td>
            <td>{r.classified}</td>
            <td className="is-num">{usd(r.amount)}</td>
            <td>
              <span className={`lra-pill ${r.ragTone}`}>{r.rag}</span>
            </td>
            <td>{r.team}</td>
          </tr>
        ))}
      {open && count > rows.length && (
        <tr className="ws-mc-more">
          <td colSpan={MARGIN_COLUMNS.length}>
            {(count - rows.length).toLocaleString("en-US")} more in this group
          </td>
        </tr>
      )}
    </>
  );
}

export default function MarginCall({ onPlaceholder }) {
  const [open, setOpen] = useState({ invalid: true });
  const [query, setQuery] = useState("");
  const total = MARGIN_GROUPS.reduce((n, g) => n + g[2], 0);

  return (
    <div className="ws-section">
      <div className="ws-mc-head">
        <div>
          <h5 className="ws-page-title">{MARGIN_META.app}</h5>
          <p className="lra-muted">
            {MARGIN_META.env} · {MARGIN_META.release} · Welcome {USER_ID}
          </p>
        </div>
        <label className="ws-mc-ccy">
          <span>CCY</span>
          <select defaultValue="USD" onChange={() => onPlaceholder("Switching reporting currency isn't part of this prototype.")}>
            <option>USD</option>
            <option>EUR</option>
            <option>CHF</option>
          </select>
        </label>
      </div>

      <section className="ws-card">
        <div className="ws-toolbar">
          <p className="ws-count" aria-live="polite">
            {total.toLocaleString("en-US")} shortfalls in {MARGIN_GROUPS.length} groups
          </p>
          <div className="ws-toolbar-btns">
            <label className="ws-mc-search">
              <Icon name="search" size={18} />
              <span className="lra-sr">Search shortfalls</span>
              <input placeholder="Search shortfalls…" value={query} onChange={(e) => setQuery(e.target.value)} />
            </label>
            <button type="button" className="lra-btn is-ghost" onClick={() => onPlaceholder("Refreshing pulls live margin data, which isn't part of this prototype.")}>
              <Icon name="refresh" size={18} />
              Refresh
            </button>
            <button type="button" className="lra-btn is-ghost" onClick={() => onPlaceholder("Download intraday data isn't part of this prototype.")}>
              <Icon name="download" size={18} />
              Download intraday data
            </button>
          </div>
        </div>

        <div className="lra-table-wrap">
          <table className="lra-table ws-mc-table">
            <caption className="lra-sr">Margin calls by review status</caption>
            <thead>
              <tr>
                {MARGIN_COLUMNS.map((c) => (
                  <th key={c} scope="col" className={c.startsWith("Total") ? "is-num" : undefined}>
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MARGIN_GROUPS.map((g) => (
                <Group
                  key={g[0]}
                  group={g}
                  open={!!open[g[0]]}
                  onToggle={() => setOpen((o) => ({ ...o, [g[0]]: !o[g[0]] }))}
                />
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
