import { FACILITIES, RULES, TICKET } from "./data";

/* Submitted — confirmation, the ticket card and the rules that ran. */

export default function Submission({ deal, onRestart }) {
  const facility = FACILITIES.find((f) => f.id === deal.facilityId);
  const usingOffer = Boolean(deal.offer) && facility?.kind !== "sbl";
  const borrower =
    deal.parties.find((p) => p.role === "Borrower")?.name ?? deal.parties[0]?.name ?? "–";

  const card = usingOffer
    ? {
        facility: deal.offer.facilityType,
        lineSize: deal.offer.lineSize,
        collateral: deal.offer.collaterals.join(", "),
      }
    : { facility: facility.type, lineSize: facility.lineSize, collateral: facility.collateral };

  return (
    <div className="lra-step">
      <div className="lra-banner is-success" role="status">
        <span className="lra-banner-icon" aria-hidden="true">
          ✓
        </span>
        <p>
          Loan origination request has been successfully submitted. You can view and share ticket
          information.
        </p>
      </div>
      <div className="lra-banner is-info">
        <span className="lra-banner-icon" aria-hidden="true">
          i
        </span>
        <p>Loan pricing entry was unable to be generated. The pricing request will be completed in Underwriting.</p>
      </div>

      <article className="lra-ticket">
        <h4>Loan request # {TICKET.number}</h4>
        <dl className="lra-kv is-review">
          <div>
            <dt>Primary borrower</dt>
            <dd>{borrower}</dd>
          </div>
          <div>
            <dt>Ticket number</dt>
            <dd>{TICKET.number}</dd>
          </div>
          <div>
            <dt>Facility</dt>
            <dd className="is-caps">{card.facility}</dd>
          </div>
          <div>
            <dt>Line size</dt>
            <dd>{card.lineSize}</dd>
          </div>
          <div>
            <dt>Collateral account(s)</dt>
            <dd>{card.collateral}</dd>
          </div>
        </dl>
      </article>

      <details className="lra-rules" open>
        <summary>Detailed results</summary>
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

      <button type="button" className="lra-btn is-secondary" onClick={onRestart}>
        Start a new request
      </button>
    </div>
  );
}
