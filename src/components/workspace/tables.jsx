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

export function Opportunities({ onPlaceholder }) {
  return (
    <div className="ws-section">
      <OffersTable onPlaceholder={onPlaceholder} />
    </div>
  );
}
