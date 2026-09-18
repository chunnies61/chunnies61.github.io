import { useEffect, useRef, useState } from "react";
import { Icon } from "../lra/ui";
import { DEALS, DEAL_TILES, OFFERS } from "./data";
import { DataTable } from "./table";

/* Deal Journey and Opportunities — the Workspace's two table views. */

const usd = (n) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
const STAGE_TONE = { Documentation: "is-blue", Verify: "is-violet", "Credit Approval": "is-warn" };

export function DealJourney({ onPlaceholder }) {
  return (
    <div className="ws-section">
      <dl className="ws-summary">
        {DEAL_TILES.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value.toLocaleString("en-US")}</dd>
          </div>
        ))}
      </dl>
      <DataTable
        caption="Deal Journey — deals in progress"
        onPlaceholder={onPlaceholder}
        rowActions={["View deal", "Reassign", "Open in Loan Request"]}
        rows={DEALS}
        columns={[
          { key: "client", label: "Client Name" },
          { key: "eci", label: "ECI" },
          { key: "aging", label: "Aging", num: true, render: (r) => `${r.aging} days` },
          { key: "lineSize", label: "Line Size", num: true, render: (r) => usd(r.lineSize) },
          { key: "assignee", label: "Assignee Name" },
          {
            key: "stage",
            label: "Current Stage",
            render: (r) => <span className={`lra-pill ${STAGE_TONE[r.stage]}`}>{r.stage}</span>,
          },
          { key: "ticket", label: "Ticket #" },
          { key: "channel", label: "Channel" },
          { key: "dealType", label: "Deal Type", render: (r) => r.dealType || "–" },
        ]}
      />
    </div>
  );
}

function OffersTable({ onPlaceholder }) {
  return (
    <DataTable
      caption="Pre-approved offers"
      onPlaceholder={onPlaceholder}
      rows={OFFERS}
      columns={[
        { key: "borrower", label: "Borrower(s) Name" },
        { key: "lineSize", label: "Line Size", num: true, render: (r) => usd(r.lineSize) },
        { key: "rate", label: "Interest Rate", num: true, render: (r) => `${r.rate.toFixed(2)}%` },
        { key: "collateral", label: "Collateral Accounts" },
        { key: "dmEci", label: "DM ECI" },
        { key: "borrowerEci", label: "Borrower(s) ECI" },
        { key: "banker", label: "Banker Name" },
      ]}
    />
  );
}

/* PLC Conversions — the feed is down; Retry tries again (and fails again) */
function PlcError() {
  const [loading, setLoading] = useState(false);
  const [tries, setTries] = useState(0);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <div className="ws-state" role="status" aria-live="polite">
      {loading ? (
        <>
          <span className="lra-spinner" aria-hidden="true" />
          <p>Loading PLC conversions…</p>
        </>
      ) : (
        <>
          <span className="ws-state-icon" aria-hidden="true">
            <Icon name="cloudOff" size={32} />
          </span>
          <p className="ws-state-title">No data received from server</p>
          <p className="lra-muted">
            {tries ? `Tried again ${tries} ${tries === 1 ? "time" : "times"} — the feed is still unavailable.` : "The PLC conversions feed didn't respond."}
          </p>
          <button
            type="button"
            className="lra-btn is-secondary"
            onClick={() => {
              setLoading(true);
              clearTimeout(timer.current);
              timer.current = setTimeout(() => {
                setLoading(false);
                setTries((t) => t + 1);
              }, 1200);
            }}
          >
            <Icon name="refresh" size={18} />
            Retry
          </button>
        </>
      )}
    </div>
  );
}

export function Opportunities({ tab, setTab, onPlaceholder }) {
  return (
    <div className="ws-section">
      <div className="lra-tabs" role="tablist" aria-label="Opportunities">
        {[
          ["plc", "PLC Conversions"],
          ["offers", "Pre-Approved Offers"],
        ].map(([k, label]) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={tab === k}
            className={"lra-tab" + (tab === k ? " is-active" : "")}
            onClick={() => setTab(k)}
          >
            <span>{label}</span>
          </button>
        ))}
      </div>
      <div role="tabpanel">
        {tab === "offers" ? <OffersTable onPlaceholder={onPlaceholder} /> : <PlcError />}
      </div>
    </div>
  );
}
