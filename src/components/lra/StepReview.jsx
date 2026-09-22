import { COLLATERALS, FACILITIES } from "./data";
import { hasCrf, money, num } from "./rules";
import { Icon } from "./ui";

/* Step 3 — Loan review. Two jobs: scan what's being submitted, and see
   what's still missing. The chosen offer leads; each section is a card
   with an Edit link back to its step; a sticky readiness panel separates
   the two required fields from the recommended ones. Nothing here blocks
   — gaps are shown, not enforced. */

const initials = (name) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("");

function Row({ label, value }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value || "–"}</dd>
    </div>
  );
}

function Card({ title, count, step, onEdit, children, flush = false }) {
  return (
    <section className="lra-review-card" aria-label={title}>
      <div className="lra-review-card-head">
        <h4>{title}</h4>
        {count != null && <span className="lra-pill is-neutral">{count}</span>}
        <button type="button" className="lra-btn is-ghost lra-review-edit" onClick={() => onEdit(step)}>
          Edit
        </button>
      </div>
      <div className={flush ? "" : "lra-review-card-body"}>{children}</div>
    </section>
  );
}

const TONE_ICON = { ok: "checkCircle", warn: "warning", error: "error" };

export default function StepReview({ deal, verdict, onEdit }) {
  const facility = FACILITIES.find((f) => f.id === deal.facilityId);
  const acting = Boolean(facility && deal.facilityAction);
  const collaterals = COLLATERALS.filter((c) => deal.collaterals.includes(c.acct));
  const o = deal.offer;
  const f = deal.fields;
  const { missing } = verdict;
  const host = deal.hostMode === "new" ? "New host account" : deal.hostAccounts.join(", ");

  // Readiness: required first, then what Credit will expect
  const checks = [
    {
      label: "Facility type",
      tone: missing.facilityType ? "error" : "ok",
      note: missing.facilityType ? "Required" : deal.facilityType,
      step: 1,
    },
    {
      label: "Requested line size",
      tone: missing.lineSize ? "error" : "ok",
      note: missing.lineSize ? "Required" : money(deal.lineSize, deal.currency),
      step: 1,
    },
    {
      label: "Parties",
      tone: deal.parties.length ? "ok" : "warn",
      note: deal.parties.length ? `${deal.parties.length} added` : "Add at least one party",
      step: 0,
    },
    {
      label: "Offer",
      tone: o ? "ok" : "warn",
      note: o ? o.name : "None selected — create one in Loan details",
      step: 1,
    },
    {
      label: "Collateral",
      tone: collaterals.length ? "ok" : "warn",
      note: collaterals.length ? `${collaterals.length} account${collaterals.length > 1 ? "s" : ""} pledged` : "No accounts pledged",
      step: 1,
    },
    {
      label: "Host account",
      tone: host ? "ok" : "warn",
      note: host || "Not chosen",
      step: 1,
    },
    {
      label: "Credit Request Form",
      tone: hasCrf(deal) ? "ok" : "warn",
      note: hasCrf(deal) ? "Attached" : "Credit will ask for it",
      step: 1,
    },
  ];
  const errors = checks.filter((c) => c.tone === "error").length;
  const warns = checks.filter((c) => c.tone === "warn").length;
  const status = errors
    ? { tone: "error", title: "Required fields missing", text: `${errors} required field${errors > 1 ? "s" : ""} to complete before submitting.` }
    : warns
      ? { tone: "warn", title: `${warns} thing${warns > 1 ? "s" : ""} to check`, text: "You can submit now — Credit may come back for these." }
      : { tone: "ok", title: "Ready to submit", text: "Everything Credit needs is here." };

  return (
    <div className="lra-step lra-review">
      <div className="lra-review-main">
        {/* The offer leads */}
        {o ? (
          <section className="lra-review-hero" aria-label="Selected offer">
            <div className="lra-review-hero-main">
              <p className="lra-review-eyebrow">Selected offer</p>
              <p className="lra-review-amount">
                {o.lineSize.replace(/ (\w+)$/, "")} <span>{deal.currency}</span>
              </p>
              <div className="lra-review-hero-name">
                <strong>{o.name}</strong>
                {o.recommended && <span className="lra-pill is-blue">Recommended</span>}
                {o.eml ? <span className="lra-pill is-violet">EML</span> : <span className="lra-pill is-good">SBL eligible</span>}
              </div>
            </div>
            <dl>
              <div>
                <dt>Indicative rate</dt>
                <dd>{o.rate}</dd>
              </div>
              <div>
                <dt>Terms</dt>
                <dd>{o.structure}</dd>
              </div>
              <div>
                <dt>Facility type</dt>
                <dd>{o.facilityType}</dd>
              </div>
            </dl>
            <button type="button" className="lra-btn is-secondary" onClick={() => onEdit(1)}>
              Change offer
            </button>
          </section>
        ) : (
          <section className="lra-review-empty" aria-label="No offer selected">
            <span className="lra-review-empty-icon" aria-hidden="true">
              <Icon name="sparkle" />
            </span>
            <div>
              <strong>No offer selected</strong>
              <p>Loan details can generate three indicative structures from the facility type and line size.</p>
            </div>
            <button type="button" className="lra-btn is-primary" onClick={() => onEdit(1)}>
              Create an offer
              <Icon name="arrowForward" size={18} />
            </button>
          </section>
        )}

        <Card title="Parties" count={deal.parties.length} step={0} onEdit={onEdit} flush>
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
                      <th scope="row">
                        <span className="lra-fac-person">
                          <span className="lra-fac-avatar" aria-hidden="true">
                            {initials(p.name)}
                          </span>
                          {p.name}
                        </span>
                      </th>
                      <td>{p.eci}</td>
                      <td>{p.platform}</td>
                      <td>
                        <span className="lra-pill is-good">{p.kyc}</span>
                      </td>
                      <td>{p.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="lra-muted lra-review-none">No parties added.</p>
          )}
        </Card>

        <Card
          title={acting ? `${deal.facilityAction} · Facility ${facility.facilityId}` : "Facility & terms"}
          step={1}
          onEdit={onEdit}
        >
          <dl className="lra-kv is-review">
            {acting && <Row label="Existing facility" value={`${facility.badge} · ${facility.type}`} />}
            <Row label="Deal type" value={deal.build === "custom" ? "Tailored (Custom)" : "Streamlined (SBL)"} />
            {deal.gfg && <Row label="GFG deal" value="Yes — routed to the GFG processing team" />}
            <Row label="Facility type" value={deal.facilityType} />
            <Row label="Requested line size" value={num(deal.lineSize) > 0 ? money(deal.lineSize, deal.currency) : ""} />
            <Row label="Asset type" value={deal.assetType} />
            <Row label="Host account" value={host} />
            {f.peakLimit && <Row label="Peak limit" value={money(f.peakLimit, deal.currency)} />}
            {f.tenor && <Row label="Tenor" value={`${f.tenor} months`} />}
            {f.txnType && <Row label="Transaction type" value={f.txnType} />}
            {f.initialMargin && <Row label="Initial margin" value={`${f.initialMargin}%`} />}
            {f.exchange && <Row label="Exchange" value={f.exchange} />}
            {f.term && <Row label="Term" value={`${f.term} months`} />}
            {f.repayment && <Row label="Repayment" value={f.repayment} />}
            {f.equityConc && <Row label="Equity concentration" value={`${f.equityConc}%`} />}
            {f.comment && <Row label="Supporting comment" value={f.comment} />}
          </dl>
        </Card>

        <Card title="Collateral" count={collaterals.length} step={1} onEdit={onEdit} flush>
          {collaterals.length ? (
            <div className="lra-table-wrap">
              <table className="lra-table">
                <thead>
                  <tr>
                    <th scope="col">Account #</th>
                    <th scope="col">Owner(s)</th>
                    <th scope="col">Type</th>
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
                      <td>{c.type}</td>
                      <td>{c.stdLv}</td>
                      <td>{c.emlLv}</td>
                      <td className="is-num">{money(c.mv, deal.collateralCcy[c.acct] ?? c.ccy ?? deal.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="lra-muted lra-review-none">No collateral pledged.</p>
          )}
        </Card>

        <Card title="Documents & comments" count={deal.documents.length} step={1} onEdit={onEdit}>
          {deal.documents.length ? (
            <ul className="lra-files lra-review-files">
              {deal.documents.map((doc) => (
                <li key={doc.id} className="lra-file">
                  <span className="lra-file-icon" aria-hidden="true">
                    <Icon name="description" size={20} />
                  </span>
                  <span className="lra-file-body">
                    <span className="lra-file-name">{doc.name}</span>
                    <span className="lra-file-meta">
                      {doc.size}
                      {doc.required ? " · Credit Request Form" : ""}
                    </span>
                  </span>
                  <span className="lra-file-ok" aria-label="Uploaded">
                    <Icon name="checkCircle" size={20} />
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="lra-muted">No documents attached.</p>
          )}
          <dl className="lra-kv is-review lra-review-note">
            <Row label="Comment for Credit" value={deal.note.trim()} />
          </dl>
        </Card>
      </div>

      {/* Readiness */}
      <aside className={`lra-ready is-${status.tone}`} aria-label="Readiness">
        <div className="lra-ready-head">
          <span className="lra-ready-status" aria-hidden="true">
            <Icon name={TONE_ICON[status.tone]} size={20} />
          </span>
          <div>
            <h4>{status.title}</h4>
            <p>{status.text}</p>
          </div>
        </div>
        <ul className="lra-ready-list">
          {checks.map((c) => (
            <li key={c.label} className={`lra-ready-item is-${c.tone}`}>
              <span className="lra-ready-icon" aria-hidden="true">
                <Icon name={TONE_ICON[c.tone]} size={18} />
              </span>
              <span className="lra-ready-text">
                <strong>{c.label}</strong>
                <span>{c.note}</span>
              </span>
              {c.tone !== "ok" && (
                <button type="button" className="lra-ready-fix" onClick={() => onEdit(c.step)}>
                  Fix
                </button>
              )}
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
