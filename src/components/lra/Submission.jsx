import { FACILITIES, RULES, TICKET } from "./data";
import { amendDiff, flowOf, fmtDate, money, num } from "./rules";
import { Banner, Icon } from "./ui";

/* Submitted — confirmation, the ticket card and the rules that ran. */

export default function Submission({ deal, onRestart }) {
  const facility = FACILITIES.find((f) => f.id === deal.facilityId);
  const borrower =
    deal.parties.find((p) => p.role === "Borrower")?.name ?? deal.parties[0]?.name ?? "–";

  // The chosen offer, else what was entered (or the facility's own terms)
  const card = deal.offer
    ? {
        facility: deal.offer.facilityType,
        lineSize: deal.offer.lineSize,
        collateral: deal.offer.collaterals.join(", ") || "–",
      }
    : {
        facility: deal.facilityType || facility?.type || "–",
        lineSize: num(deal.lineSize) > 0 ? money(deal.lineSize, deal.currency) : facility ? money(facility.lineValue, deal.currency) : "–",
        collateral: deal.collaterals.join(", ") || facility?.collateral || "–",
      };

  const flow = flowOf(deal);
  const diff = amendDiff(deal.amend);
  const ccy = deal.currency;

  /* What the ticket lists, by kind of request. Only a streamlined (SBL) deal also shows the
     engine's detailed results; the others go to people rather than through the engine. */
  const rows =
    flow === "annual"
      ? [
          ["Request type", "Annual review"],
          ["Facility", `${facility?.type} · ${facility?.facilityId}`],
          ["Line size", money(facility?.lineValue, ccy)],
          ["Current NRD", fmtDate(facility?.nrd ?? "")],
          ["New NRD", deal.annual.newNrd ? fmtDate(deal.annual.newNrd) : "Not set"],
          ...(deal.annual.comment ? [["Comment", deal.annual.comment]] : []),
        ]
      : flow === "amendment"
        ? [
            ["Request type", "Amendment"],
            ["Facility", `${facility?.type} · ${facility?.facilityId}`],
            [
              "Amendment type",
              [
                diff.clients.length && "Clients",
                diff.pricing.length && "Pricing",
                diff.collateral.length && "Collateral",
                diff.covenants.length && "Covenants",
              ].filter(Boolean),
            ],
            ["Line size", money(facility?.lineValue, ccy)],
            ["Collateral account(s)", deal.amend.collaterals.join(", ") || "–"],
            ["Pricing", deal.amend.pricing.mode],
            ...(deal.amend.pricing.mode === "Exception"
              ? [
                  ["Base rate", deal.amend.pricing.baseRate],
                  ["Spread", `${deal.amend.pricing.spread || "–"} bps`],
                ]
              : []),
          ]
        : flow === "custom"
          ? [
              ["Request type", "Custom deal"],
              ["Primary borrower", borrower],
              ["Facility", deal.custom.facilityType],
              ["Line size", money(deal.custom.lineSize, ccy)],
              ["Team", deal.custom.team || "–"],
            ]
          : [
              ["Primary borrower", borrower],
              ["Ticket number", TICKET.number],
              ["Facility", card.facility],
              ["Line size", card.lineSize],
              ["Collateral account(s)", card.collateral],
            ];

  const message =
    flow === "annual"
      ? "Annual review has been successfully submitted. You can view and share ticket information."
      : flow === "amendment"
        ? "Amendment request has been successfully submitted. You can view and share ticket information."
        : "Loan origination request has been successfully submitted. You can view and share ticket information.";

  return (
    <div className="lra-step">
      <Banner tone="success">{message}</Banner>
      {flow === "sbl" && (
        <Banner>
          Loan pricing entry was unable to be generated. The pricing request will be completed in
          Underwriting.
        </Banner>
      )}
      {flow === "custom" && (
        <Banner>This request has been routed to Credit's Custom intake. The team will pick it up from the comment you left.</Banner>
      )}
      {flow === "annual" && deal.annual.state === "late" && (
        <Banner tone="warning">
          The new NRD is after the loan's maturity ({fmtDate(facility?.maturityDate ?? "")}). Credit may ask about it.
        </Banner>
      )}

      <article className="lra-ticket">
        <h4>Loan request # {TICKET.number}</h4>
        <dl className="lra-kv is-review">
          {rows.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd className={label === "Facility" && flow === "sbl" ? "is-caps" : undefined}>
                {Array.isArray(value) ? (
                  <span className="lra-badges">
                    {value.map((v) => (
                      <span key={v} className="lra-pill is-blue">
                        {v}
                      </span>
                    ))}
                  </span>
                ) : (
                  value
                )}
              </dd>
            </div>
          ))}
        </dl>
      </article>

      {flow === "sbl" && (
      <details className="lra-rules" open>
        <summary>
          Detailed results
          <Icon name="expand" />
        </summary>
        <div className="lra-table-wrap">
          <table className="lra-table">
            <thead>
              <tr>
                <th scope="col">Rule ID – Rule name</th>
                <th scope="col">Result</th>
                <th scope="col">Comments</th>
              </tr>
            </thead>
            <tbody>
              {RULES.map((r) => (
                <tr key={r.id}>
                  <th scope="row">
                    {r.id} – {r.name}
                  </th>
                  <td>
                    <span className="lra-pill is-good">Pass</span>
                  </td>
                  <td>–</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
      )}

      <button type="button" className="lra-btn is-secondary" onClick={onRestart}>
        Start a new request
      </button>
    </div>
  );
}
