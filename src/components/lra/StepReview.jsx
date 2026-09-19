import { COLLATERALS, FACILITIES } from "./data";
import { money, num } from "./rules";
import { Banner } from "./ui";

/* Step 3 — Loan review: a read-only summary of the request before it's
   submitted. Gaps show as dashes rather than stopping the user here. */

function Row({ label, value }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value || "–"}</dd>
    </div>
  );
}

export default function StepReview({ deal }) {
  const facility = FACILITIES.find((f) => f.id === deal.facilityId);
  const acting = Boolean(facility && deal.facilityAction);
  const collaterals = COLLATERALS.filter((c) => deal.collaterals.includes(c.acct));
  const o = deal.offer;
  const f = deal.fields;

  return (
    <div className="lra-step">
      <Banner>Check everything below — submitting sends the loan request to Credit.</Banner>

      <section className="lra-section">
        <div className="lra-section-head">
          <h4>Parties</h4>
        </div>
        {deal.parties.length ? (
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
        ) : (
          <p className="lra-muted">No parties added.</p>
        )}
      </section>

      <section className="lra-section">
        <div className="lra-section-head">
          <h4>{acting ? `${deal.facilityAction} · Facility ${facility.facilityId}` : "New facility"}</h4>
        </div>
        <dl className="lra-kv is-review">
          {acting && <Row label="Existing facility" value={`${facility.badge} · ${facility.type}`} />}
          <Row label="Deal type" value={deal.build === "custom" ? "Tailored (Custom)" : "Streamlined (SBL)"} />
          <Row label="Facility type" value={deal.facilityType} />
          <Row label="Requested line size" value={num(deal.lineSize) > 0 ? money(deal.lineSize, deal.currency) : ""} />
          <Row label="Asset type" value={deal.assetType} />
          <Row
            label="Host account"
            value={deal.hostMode === "new" ? "New host account" : deal.hostAccounts.join(", ")}
          />
          <Row label="Collateral accounts" value={deal.collaterals.join(", ")} />
          {f.peakLimit && <Row label="Peak limit" value={money(f.peakLimit, "USD")} />}
          {f.tenor && <Row label="Tenor" value={`${f.tenor} months`} />}
          {f.txnType && <Row label="Transaction type" value={f.txnType} />}
          {f.equityConc && <Row label="Equity concentration" value={`${f.equityConc}%`} />}
          {f.comment && <Row label="Supporting comment" value={f.comment} />}
        </dl>
      </section>

      <section className="lra-section">
        <div className="lra-section-head">
          <h4>Offer</h4>
        </div>
        {o ? (
          <dl className="lra-kv is-review">
            <Row label="Structure" value={o.name} />
            <Row label="Line size" value={o.lineSize} />
            <Row label="Indicative rate" value={o.rate} />
            <Row label="Terms" value={o.structure} />
          </dl>
        ) : (
          <p className="lra-muted">No offer selected — Loan details can create one.</p>
        )}
      </section>

      {collaterals.length > 0 && (
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
          <h4>Documents and notes</h4>
        </div>
        <dl className="lra-kv is-review">
          <Row label="Documents" value={deal.documents.map((d) => d.name).join(", ") || "No documents attached"} />
          <Row label="Note for Credit" value={deal.note.trim()} />
        </dl>
      </section>
    </div>
  );
}
