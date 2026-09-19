import { useId, useState } from "react";
import {
  ASSET_TYPES,
  COLLATERALS,
  CURRENCIES,
  DM_ACCOUNTS,
  DOCUMENTS,
  EXCHANGES,
  FACILITY_TYPES,
  HOST_ACCOUNTS,
  REPAYMENTS,
  TRANSACTION_TYPES,
} from "./data";
import { hasCrf, money, offersFor } from "./rules";
import { Banner, Field, Icon, Section } from "./ui";
import Dropdown from "./dropdown";

/* Step 2 — Loan details: collateral, host accounts, the facility, the
   supporting documents and notes, then the offers. Only facility type and
   requested line size are required; the rest is guidance. */

const VERB = {
  Amend: "Amending",
  Restructure: "Restructuring",
  Renew: "Renewing",
  "Increase limit": "Increasing the limit on",
  "Close facility": "Closing",
};

// Any change to the inputs an offer is built from withdraws the offers
const NO_OFFER = { offers: null, offer: null };

export default function StepDetails({ deal, update, setField, verdict, region, tried, onTried }) {
  const uid = useId();
  const [over, setOver] = useState(false); // a file is being dragged over the drop zone
  const f = deal.fields;
  const { errors, missing, facility } = verdict;
  const required = tried && (missing.facilityType || missing.lineSize);

  function toggleCollateral(acct) {
    update((d) => ({
      collaterals: d.collaterals.includes(acct)
        ? d.collaterals.filter((a) => a !== acct)
        : [...d.collaterals, acct],
      ...NO_OFFER,
    }));
  }

  function toggleHost(acct) {
    update((d) => ({
      hostAccounts: d.hostAccounts.includes(acct)
        ? d.hostAccounts.filter((a) => a !== acct)
        : [...d.hostAccounts, acct],
      ...NO_OFFER,
    }));
  }

  // The next sample document the upload area attaches
  const nextDoc = DOCUMENTS.find((doc) => !deal.documents.some((x) => x.id === doc.id));
  function addDocument() {
    if (nextDoc) update((d) => ({ documents: [...d.documents, nextDoc] }));
  }

  function createOffer() {
    if (missing.facilityType || missing.lineSize) {
      onTried();
      return;
    }
    update((d) => ({ offers: offersFor(d), offer: null }));
  }

  return (
    <div className="lra-step">
      {facility && deal.facilityAction && (
        <Banner>
          <strong>{VERB[deal.facilityAction] ?? deal.facilityAction}</strong> {facility.type}, facility{" "}
          {facility.facilityId}. Its current terms are filled in below — change what's needed.
        </Banner>
      )}
      {verdict.showSafCal && (
        <Banner>
          Please check that the client's Suitability Assessment Form (SAF) and Client Affirmation
          Letter (CAL) are valid and lodged in Doc Manager.
        </Banner>
      )}

      {/* Collateral */}
      <Section title="Collateral">
        <div className="lra-tabs" role="tablist" aria-label="Collateral source">
          {[
            ["collaterals", "Collaterals"],
            ["dm", "DM Account"],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={deal.collateralTab === key}
              className={"lra-tab" + (deal.collateralTab === key ? " is-active" : "")}
              onClick={() => update({ collateralTab: key })}
            >
              <span>{label}</span>
            </button>
          ))}
        </div>

        {deal.collateralTab === "collaterals" ? (
          <div className="lra-table-wrap" role="tabpanel">
            <table className="lra-table">
              <thead>
                <tr>
                  <th scope="col">
                    <span className="lra-sr">Select</span>
                  </th>
                  <th scope="col">Account owner(s)</th>
                  <th scope="col">Account #</th>
                  <th scope="col">Platform</th>
                  <th scope="col">Account type</th>
                  <th scope="col">Already pledged</th>
                  <th scope="col">Standard LV</th>
                  <th scope="col">EML LV</th>
                  <th scope="col">MV currency</th>
                  <th scope="col" className="is-num">
                    Market value
                  </th>
                </tr>
              </thead>
              <tbody>
                {COLLATERALS.map((c) => (
                  <tr key={c.acct}>
                    <td>
                      <input
                        type="checkbox"
                        checked={deal.collaterals.includes(c.acct)}
                        onChange={() => toggleCollateral(c.acct)}
                        aria-label={`Use account ${c.acct} as collateral`}
                      />
                    </td>
                    <td>{c.owners}</td>
                    <th scope="row">{c.acct}</th>
                    <td>{c.platform}</td>
                    <td>{c.type}</td>
                    <td>{c.pledged}</td>
                    <td>{c.stdLv}</td>
                    <td>{c.emlLv}</td>
                    <td>
                      <Dropdown
                        compact
                        label={`Market value currency for ${c.acct}`}
                        value={deal.collateralCcy[c.acct] ?? c.ccy}
                        onChange={(v) =>
                          update((d) => ({ collateralCcy: { ...d.collateralCcy, [c.acct]: v } }))
                        }
                        options={CURRENCIES}
                      />
                    </td>
                    <td className="is-num">{money(c.mv)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="lra-table-wrap" role="tabpanel">
            <table className="lra-table">
              <thead>
                <tr>
                  <th scope="col">DM account</th>
                  <th scope="col">Owner</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {DM_ACCOUNTS.map((a) => (
                  <tr key={a.acct}>
                    <th scope="row">{a.acct}</th>
                    <td>{a.owner}</td>
                    <td>
                      <span className="lra-pill is-good">{a.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* Host accounts — any number of existing ones, or a new one */}
      <Section title="Host accounts">
        <div className="lra-radios" role="radiogroup" aria-label="Host account">
          {[
            ["existing", "Existing"],
            ["new", "New"],
          ].map(([key, label]) => (
            <label key={key} className="lra-radio">
              <input
                type="radio"
                name={`${uid}-host`}
                checked={deal.hostMode === key}
                onChange={() => update({ hostMode: key, ...NO_OFFER })}
              />
              {label}
            </label>
          ))}
        </div>
        {deal.hostMode === "existing" ? (
          <>
            <div className="lra-table-wrap">
              <table className="lra-table">
                <thead>
                  <tr>
                    <th scope="col">
                      <span className="lra-sr">Select</span>
                    </th>
                    <th scope="col">Account #</th>
                    <th scope="col">Internal acct #</th>
                  </tr>
                </thead>
                <tbody>
                  {HOST_ACCOUNTS.map((h) => (
                    <tr key={h.acct}>
                      <td>
                        <input
                          type="checkbox"
                          checked={deal.hostAccounts.includes(h.acct)}
                          onChange={() => toggleHost(h.acct)}
                          aria-label={`Host account ${h.acct}`}
                        />
                      </td>
                      <th scope="row">{h.acct}</th>
                      <td>{h.internal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="lra-field-hint">
              {deal.hostAccounts.length
                ? `${deal.hostAccounts.length} of ${HOST_ACCOUNTS.length} selected.`
                : "Select one or more host accounts, or open a new account for the borrower."}
            </p>
          </>
        ) : (
          <p className="lra-field-hint">A new host account will be opened for the borrower.</p>
        )}
      </Section>

      {/* Facility */}
      <Section title="Facility" aside={<span className="lra-muted">* Required</span>}>
        <div className="lra-grid">
          <Field
            label="Facility type"
            id={`${uid}-ftype`}
            required
            error={required && missing.facilityType ? "Select a facility type." : undefined}
          >
            <Dropdown
              id={`${uid}-ftype`}
              value={deal.facilityType}
              onChange={(v) => update({ facilityType: v, fields: {}, cdsDismissed: false, ...NO_OFFER })}
              placeholder="Select a facility type…"
              options={FACILITY_TYPES}
            />
          </Field>
          <Field
            label="Requested line size"
            id={`${uid}-line`}
            required
            error={required && missing.lineSize ? "Enter the requested line size." : undefined}
          >
            <div className="lra-money">
              <input
                id={`${uid}-line`}
                inputMode="decimal"
                placeholder="0.00"
                value={deal.lineSize}
                aria-required="true"
                aria-invalid={Boolean(required && missing.lineSize)}
                onChange={(e) => update({ lineSize: e.target.value, ...NO_OFFER })}
              />
              <Dropdown
                label="Line size currency"
                value={deal.currency}
                onChange={(v) => update({ currency: v, ...NO_OFFER })}
                options={CURRENCIES}
              />
            </div>
          </Field>
          <Field label="Asset type" id={`${uid}-asset`}>
            <Dropdown
              id={`${uid}-asset`}
              value={deal.assetType}
              onChange={(v) => update({ assetType: v })}
              options={ASSET_TYPES}
            />
          </Field>

          {deal.facilityType === "FX/OTC Derivatives" && (
            <>
              <Field
                label="Peak limit (USD)"
                id={`${uid}-peak`}
                error={errors.peakLimit}
                hint="Streamlined up to USD 2.5MM"
              >
                <input
                  id={`${uid}-peak`}
                  inputMode="decimal"
                  placeholder="e.g. 2,000,000"
                  value={f.peakLimit ?? ""}
                  aria-invalid={Boolean(errors.peakLimit)}
                  onChange={(e) => setField("peakLimit", e.target.value)}
                />
              </Field>
              <Field label="Initial margin (%)" id={`${uid}-im`}>
                <input
                  id={`${uid}-im`}
                  inputMode="decimal"
                  placeholder="e.g. 20"
                  value={f.initialMargin ?? ""}
                  onChange={(e) => setField("initialMargin", e.target.value)}
                />
              </Field>
              <Field label="Tenor (months)" id={`${uid}-tenor`} error={errors.tenor} hint="Up to 120 months">
                <input
                  id={`${uid}-tenor`}
                  inputMode="numeric"
                  placeholder="e.g. 60"
                  value={f.tenor ?? ""}
                  aria-invalid={Boolean(errors.tenor)}
                  onChange={(e) => setField("tenor", e.target.value)}
                />
              </Field>
              <Field label="Expected notional (USD)" id={`${uid}-notional`}>
                <input
                  id={`${uid}-notional`}
                  inputMode="decimal"
                  placeholder="e.g. 5,000,000"
                  value={f.notional ?? ""}
                  onChange={(e) => setField("notional", e.target.value)}
                />
              </Field>
              <Field label="Transaction type" id={`${uid}-txn`}>
                <Dropdown
                  id={`${uid}-txn`}
                  value={f.txnType ?? ""}
                  onChange={(v) => {
                    setField("txnType", v);
                    update({ cdsDismissed: false });
                  }}
                  placeholder="Select…"
                  options={TRANSACTION_TYPES}
                />
              </Field>
            </>
          )}

          {deal.facilityType === "F&O / ETP" && (
            <>
              <Field label="Initial margin (%)" id={`${uid}-fo-im`}>
                <input
                  id={`${uid}-fo-im`}
                  inputMode="decimal"
                  placeholder="e.g. 15"
                  value={f.initialMargin ?? ""}
                  onChange={(e) => setField("initialMargin", e.target.value)}
                />
              </Field>
              <Field label="Exchange" id={`${uid}-exch`}>
                <Dropdown
                  id={`${uid}-exch`}
                  value={f.exchange ?? EXCHANGES[0]}
                  onChange={(v) => setField("exchange", v)}
                  options={EXCHANGES}
                />
              </Field>
            </>
          )}

          {deal.facilityType === "Commitment – Term loan" && (
            <>
              <Field label="Term (months)" id={`${uid}-term`}>
                <input
                  id={`${uid}-term`}
                  inputMode="numeric"
                  placeholder="e.g. 36"
                  value={f.term ?? ""}
                  onChange={(e) => setField("term", e.target.value)}
                />
              </Field>
              <Field label="Repayment" id={`${uid}-repay`}>
                <Dropdown
                  id={`${uid}-repay`}
                  value={f.repayment ?? REPAYMENTS[0]}
                  onChange={(v) => setField("repayment", v)}
                  options={REPAYMENTS}
                />
              </Field>
            </>
          )}

          {deal.facilityType === "Global limit" && (
            <Field
              label="Equity concentration (%)"
              id={`${uid}-eq`}
              hint={region.compliance ? "Above 40% needs a supporting comment" : undefined}
            >
              <input
                id={`${uid}-eq`}
                inputMode="decimal"
                placeholder="e.g. 35"
                value={f.equityConc ?? ""}
                onChange={(e) => setField("equityConc", e.target.value)}
              />
            </Field>
          )}
        </div>

        {verdict.needsComment && (
          <Field label="Supporting comment" id={`${uid}-comment`} error={errors.comment}>
            <textarea
              id={`${uid}-comment`}
              rows={3}
              placeholder="Explain why the concentration is acceptable for this client…"
              value={f.comment ?? ""}
              aria-invalid={Boolean(errors.comment)}
              onChange={(e) => setField("comment", e.target.value)}
            />
          </Field>
        )}
      </Section>

      {/* Supporting documents */}
      <Section title="Supporting documents">
        <div
          className={"lra-upload" + (nextDoc ? "" : " is-done") + (over ? " is-over" : "")}
          role="button"
          tabIndex={0}
          aria-disabled={!nextDoc}
          aria-label={nextDoc ? `Upload ${nextDoc.name}` : "All sample documents attached"}
          onClick={addDocument}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              addDocument();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setOver(true);
          }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setOver(false);
            addDocument();
          }}
        >
          <span className="lra-upload-icon" aria-hidden="true">
            <Icon name="upload" size={20} />
          </span>
          {nextDoc ? (
            <>
              <p>
                <strong>Click to upload</strong> or drag and drop
              </p>
              <p className="lra-upload-hint">PDF, DOCX or XLSX up to 10 MB — this prototype attaches a sample file</p>
            </>
          ) : (
            <>
              <p>
                <strong>All sample documents attached</strong>
              </p>
              <p className="lra-upload-hint">Remove one to attach it again</p>
            </>
          )}
        </div>

        {deal.documents.length > 0 && (
          <ul className="lra-files">
            {deal.documents.map((doc) => (
              <li key={doc.id} className="lra-file">
                <span className="lra-file-icon" aria-hidden="true">
                  <Icon name="description" size={20} />
                </span>
                <span className="lra-file-body">
                  <span className="lra-file-name">{doc.name}</span>
                  <span className="lra-file-meta">
                    {doc.size} · Uploaded{doc.required ? " · Credit Request Form" : ""}
                  </span>
                </span>
                <span className="lra-file-ok" aria-label="Upload complete">
                  <Icon name="checkCircle" size={20} />
                </span>
                <button
                  type="button"
                  className="lra-icon-btn"
                  aria-label={`Remove ${doc.name}`}
                  onClick={() => update((d) => ({ documents: d.documents.filter((x) => x.id !== doc.id) }))}
                >
                  <Icon name="delete" size={20} />
                </button>
              </li>
            ))}
          </ul>
        )}
        {!hasCrf(deal) && (
          <p className="lra-field-hint">Credit will ask for the Credit Request Form — attach it before submitting.</p>
        )}
      </Section>

      {/* Notes */}
      <Section title="Notes">
        <Field label="Note for Credit" id={`${uid}-note`} hint="Optional — context, timing, anything unusual about the request.">
          <textarea
            id={`${uid}-note`}
            rows={3}
            placeholder="e.g. Client needs funds by month end for a property completion…"
            value={deal.note}
            onChange={(e) => update({ note: e.target.value })}
          />
        </Field>
      </Section>

      {/* Offers — hidden until asked for; three indicative structures */}
      {deal.offers ? (
        <Section
          title="Offer"
          aside={
            <button type="button" className="lra-btn is-ghost" onClick={() => update(NO_OFFER)}>
              Clear offers
            </button>
          }
        >
          <p className="lra-section-intro">
            Three indicative structures for this request. Pick one to carry into the review.
          </p>
          <div className="lra-offers">
            {deal.offers.map((o) => {
              const on = deal.offer?.id === o.id;
              return (
                <article
                  key={o.id}
                  className={"lra-offer" + (on ? " is-selected" : "") + (o.eligible ? "" : " is-ineligible")}
                  aria-label={o.name}
                >
                  <div className="lra-offer-head">
                    <h5>{o.name}</h5>
                    <div className="lra-offer-pills">
                      {o.recommended && <span className="lra-pill is-blue">Recommended</span>}
                      {o.eml ? (
                        <span className={"lra-pill " + (o.eligible ? "is-violet" : "is-neutral")}>
                          {o.eligible ? "EML" : "Not eligible"}
                        </span>
                      ) : (
                        <span className="lra-pill is-good">SBL eligible</span>
                      )}
                    </div>
                  </div>
                  <p className="lra-offer-amount">{o.lineSize}</p>
                  <dl className="lra-kv">
                    <div>
                      <dt>Indicative rate</dt>
                      <dd>{o.rate}</dd>
                    </div>
                    <div>
                      <dt>Structure</dt>
                      <dd>{o.structure}</dd>
                    </div>
                    <div>
                      <dt>Collateral</dt>
                      <dd>{o.collaterals.length ? o.collaterals.join(", ") : "To be pledged"}</dd>
                    </div>
                    <div>
                      <dt>Host account</dt>
                      <dd>{o.host}</dd>
                    </div>
                  </dl>
                  {o.eligible ? (
                    <button
                      type="button"
                      className={"lra-btn is-secondary" + (on ? " is-on" : "")}
                      aria-pressed={on}
                      onClick={() => update({ offer: on ? null : o })}
                    >
                      {on && <Icon name="check" size={18} />}
                      {on ? "Selected" : "Select offer"}
                    </button>
                  ) : (
                    <p className="lra-field-hint">Needs EML-eligible collateral — add an account with an EML LV.</p>
                  )}
                </article>
              );
            })}
          </div>
        </Section>
      ) : (
        <div className="lra-offer-cta">
          <button type="button" className="lra-btn is-primary" onClick={createOffer}>
            <Icon name="sparkle" size={18} />
            Create offer
          </button>
          <p className="lra-field-hint">
            Generates three indicative structures from the facility type and line size above.
          </p>
        </div>
      )}
    </div>
  );
}
