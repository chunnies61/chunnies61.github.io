import { COLLATERALS, FACILITIES } from "./data";
import { money } from "./rules";

/* Steps 2 and 3 — a read-only review of the deal assembled in step 1. */

function Row({ label, value }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value || "–"}</dd>
    </div>
  );
}

export default function StepReview({ deal, final }) {
  const facility = FACILITIES.find((f) => f.id === deal.facilityId);
  const collaterals = COLLATERALS.filter((c) => deal.collaterals.includes(c.acct));
  const usingOffer = Boolean(deal.offer) && facility?.kind !== "sbl";

  return (
    <div className="lra-step">
      {final && (
        <p className="lra-review-note" role="status">
          Check everything below — continuing submits the loan request.
        </p>
      )}

      <section className="lra-section">
        <div className="lra-section-head">
          <h4>Parties</h4>
        </div>
        <div className="lra-table-wrap">
          <table className="lra-table">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">ECI</th>
                <th scope="col">Platform</th>
                <th scope="col">KYC</th>
                <th scope="col">Role</th>
              </tr>
            </thead>
            <tbody>
              {deal.parties.map((p) => (
                <tr key={`${p.id}-${p.role}`}>
                  <th scope="row">{p.name}</th>
                  <td>{p.eci}</td>
                  <td>{p.platform}</td>
                  <td>{p.kyc}</td>
                  <td>{p.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="lra-section">
        <div className="lra-section-head">
          <h4>{usingOffer ? "New facility" : "Existing facility"}</h4>
        </div>
        {usingOffer ? (
          <dl className="lra-kv is-review">
            <Row label="Deal type" value="Streamlined (SBL), fixed term loan" />
            <Row label="Facility type" value={deal.offer.facilityType} />
            <Row label="Requested line size" value={deal.offer.lineSize} />
            <Row label="Asset type" value={deal.assetType} />
            <Row label="Host account" value={deal.offer.host} />
            <Row label="Collateral accounts" value={deal.offer.collaterals.join(", ")} />
            {deal.fields.peakLimit && <Row label="Peak limit" value={money(deal.fields.peakLimit, "USD")} />}
            {deal.fields.tenor && <Row label="Tenor" value={`${deal.fields.tenor} months`} />}
            {deal.fields.txnType && <Row label="Transaction type" value={deal.fields.txnType} />}
            {deal.fields.equityConc && <Row label="Equity concentration" value={`${deal.fields.equityConc}%`} />}
            {deal.fields.comment && <Row label="Supporting comment" value={deal.fields.comment} />}
          </dl>
        ) : (
          <dl className="lra-kv is-review">
            <Row label="Facility" value={`${facility.badge} · ${facility.facilityId}`} />
            <Row label="Action" value={deal.facilityAction} />
            <Row label="Borrower(s)" value={facility.borrowers} />
            <Row label="Line size" value={facility.lineSize} />
            <Row label="Facility type" value={facility.type} />
            <Row label="Maturity date" value={facility.maturity} />
          </dl>
        )}
      </section>

      {usingOffer && collaterals.length > 0 && (
        <section className="lra-section">
          <div className="lra-section-head">
            <h4>Collateral</h4>
          </div>
          <div className="lra-table-wrap">
            <table className="lra-table">
              <thead>
                <tr>
                  <th scope="col">Account #</th>
                  <th scope="col">Owner(s)</th>
                  <th scope="col">Standard LV</th>
                  <th scope="col">EML LV</th>
                  <th scope="col" className="is-num">
                    Market value
                  </th>
                </tr>
              </thead>
              <tbody>
                {collaterals.map((c) => (
                  <tr key={c.acct}>
                    <th scope="row">{c.acct}</th>
                    <td>{c.owners}</td>
                    <td>{c.stdLv}</td>
                    <td>{c.emlLv}</td>
                    <td className="is-num">{money(c.mv, deal.collateralCcy[c.acct] ?? c.ccy)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="lra-section">
        <div className="lra-section-head">
          <h4>Documents</h4>
        </div>
        <p className="lra-muted">
          {deal.crfUploaded ? "credit-request-form.pdf" : "No documents attached"}
        </p>
      </section>
    </div>
  );
}
