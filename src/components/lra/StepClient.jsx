import { useId, useState } from "react";
import {
  ASSET_TYPES,
  CLIENTS,
  COLLATERALS,
  CURRENCIES,
  DM_ACCOUNTS,
  EXCHANGES,
  FACILITIES,
  FACILITY_TYPES,
  HOST_ACCOUNTS,
  REPAYMENTS,
  ROLES,
  TRANSACTION_TYPES,
} from "./data";
import { money, num } from "./rules";
import { Banner, Icon } from "./ui";
import Dropdown from "./dropdown";
import FacilityCard from "./FacilityCard";

function Field({ label, error, hint, children, id }) {
  return (
    <div className={"lra-field" + (error ? " has-error" : "")}>
      <label htmlFor={id}>{label}</label>
      {children}
      {error ? (
        <p className="lra-field-error" id={`${id}-err`}>
          {error}
        </p>
      ) : (
        hint && <p className="lra-field-hint">{hint}</p>
      )}
    </div>
  );
}

function Section({ title, children, aside }) {
  return (
    <section className="lra-section">
      <div className="lra-section-head">
        <h4>{title}</h4>
        {aside}
      </div>
      {children}
    </section>
  );
}

export default function StepClient({ deal, update, setField, addParty, verdict, region }) {
  const uid = useId();
  const [clientId, setClientId] = useState("");
  const [role, setRole] = useState("");
  const f = deal.fields;
  const { errors } = verdict;

  const canAdd =
    clientId &&
    role &&
    !deal.loading &&
    !deal.parties.some((p) => p.id === clientId && p.role === role);

  function toggleCollateral(acct) {
    update((d) => ({
      collaterals: d.collaterals.includes(acct)
        ? d.collaterals.filter((a) => a !== acct)
        : [...d.collaterals, acct],
      offer: null,
    }));
  }

  const canCreateOffer =
    deal.facilityType &&
    num(deal.lineSize) > 0 &&
    deal.collaterals.length > 0 &&
    (deal.hostMode === "new" || deal.hostAccount) &&
    !errors.peakLimit &&
    !errors.tenor;

  function createOffer() {
    const picked = COLLATERALS.filter((c) => deal.collaterals.includes(c.acct));
    update({
      offer: {
        facilityType: deal.facilityType,
        collaterals: picked.map((c) => c.acct),
        host: deal.hostMode === "new" ? "New host account" : deal.hostAccount,
        lineSize: money(deal.lineSize, deal.currency),
        emlEligible: picked.some((c) => c.emlLv !== "—"),
      },
    });
  }

  return (
    <div className="lra-step">
      {/* Party search */}
      <Section title="Parties">
        <div className="lra-party-row">
          <Field label="Search clients" id={`${uid}-client`}>
            <Dropdown
              id={`${uid}-client`}
              value={clientId}
              onChange={setClientId}
              placeholder="Select a client…"
              options={CLIENTS.map((c) => ({ value: c.id, label: `${c.name} · ECI ${c.eci}` }))}
            />
          </Field>
          <Field label="Role" id={`${uid}-role`}>
            <Dropdown
              id={`${uid}-role`}
              value={role}
              onChange={setRole}
              placeholder="Select a role…"
              options={ROLES}
            />
          </Field>
          <button
            type="button"
            className="lra-btn is-tonal lra-add-party"
            disabled={!canAdd}
            onClick={() => {
              addParty({ ...CLIENTS.find((c) => c.id === clientId), role });
              setClientId("");
              setRole("");
            }}
          >
            <Icon name="add" size={18} />
            Add party
          </button>
        </div>

        {deal.loading && (
          <p className="lra-loading" role="status">
            <span className="lra-spinner" aria-hidden="true" />
            Loading client details…
          </p>
        )}

        {deal.parties.length > 0 && (
          <div className="lra-table-wrap">
            <table className="lra-table">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">ECI</th>
                  <th scope="col">Employee</th>
                  <th scope="col">UCN</th>
                  <th scope="col">Platform</th>
                  <th scope="col">KYC</th>
                  <th scope="col">Role</th>
                  <th scope="col">
                    <span className="lra-sr">Remove</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {deal.parties.map((p, i) => (
                  <tr key={`${p.id}-${p.role}`}>
                    <th scope="row">{p.name}</th>
                    <td>{p.eci}</td>
                    <td>{p.employee}</td>
                    <td>{p.ucn}</td>
                    <td>{p.platform}</td>
                    <td>
                      <span className="lra-pill is-good">{p.kyc}</span>
                    </td>
                    <td>{p.role}</td>
                    <td>
                      <button
                        type="button"
                        className="lra-icon-btn"
                        aria-label={`Remove ${p.name} (${p.role})`}
                        onClick={() =>
                          update((d) => ({ parties: d.parties.filter((_, j) => j !== i) }))
                        }
                      >
                        <Icon name="delete" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {deal.parties.length > 0 && (
        <>
          {/* Existing facilities */}
          <Section title="Existing facilities">
            <div className="lra-facilities lra-fac-grid">
              {FACILITIES.map((fac) => (
                <FacilityCard
                  key={fac.id}
                  fac={fac}
                  selected={deal.facilityId === fac.id}
                  action={deal.facilityAction}
                  onAction={(a, on) =>
                    update(on ? { facilityId: null, facilityAction: null } : { facilityId: fac.id, facilityAction: a })
                  }
                />
              ))}
            </div>
          </Section>

          {/* Build a new deal */}
          <Section title="Build a new deal">
            <div className="lra-build-actions">
              <button
                type="button"
                className="lra-btn is-primary"
                aria-pressed={deal.build === "sbl"}
                onClick={() => update((d) => ({ build: d.build === "sbl" ? null : "sbl" }))}
              >
                {deal.build === "sbl" && <Icon name="check" size={18} />}
                Build your own (SBL) deal
              </button>
              <button
                type="button"
                className={"lra-btn is-toggle" + (deal.build === "custom" ? " is-on" : "")}
                aria-pressed={deal.build === "custom"}
                onClick={() => update((d) => ({ build: d.build === "custom" ? null : "custom" }))}
              >
                {deal.build === "custom" && <Icon name="check" size={18} />}
                Build a tailored (Custom) deal
              </button>
            </div>
            {deal.build === "custom" && (
              <Banner>
                Tailored (Custom) deals are captured in the Custom intake — outside this prototype.
              </Banner>
            )}
          </Section>

          {deal.build === "sbl" && (
            <div className="lra-sbl">
              {verdict.showSafCal && (
                <Banner>
                  Please check that the client's Suitability Assessment Form (SAF) and Client
                  Affirmation Letter (CAL) are valid and lodged in Doc Manager.
                </Banner>
              )}
              {!deal.crfUploaded && (
                <Banner tone="warning">
                  Required: Upload the Credit Request Form before submitting your ticket.
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
                                  update((d) => ({
                                    collateralCcy: { ...d.collateralCcy, [c.acct]: v },
                                  }))
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

              {/* Host accounts */}
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
                        onChange={() => update({ hostMode: key, offer: null })}
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
                                  type="radio"
                                  name={`${uid}-host-acct`}
                                  checked={deal.hostAccount === h.acct}
                                  onChange={() => update({ hostAccount: h.acct, offer: null })}
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
                    {!deal.hostAccount && (
                      <p className="lra-field-hint">
                        Select at least one host account or create a new account for the borrower.
                      </p>
                    )}
                  </>
                ) : (
                  <p className="lra-field-hint">A new host account will be opened for the borrower.</p>
                )}
              </Section>

              {/* Facility */}
              <Section title="Facility">
                <div className="lra-grid">
                  <Field label="Facility type" id={`${uid}-ftype`}>
                    <Dropdown
                      id={`${uid}-ftype`}
                      value={deal.facilityType}
                      onChange={(v) => update({ facilityType: v, fields: {}, offer: null, cdsDismissed: false })}
                      placeholder="Select a facility type…"
                      options={FACILITY_TYPES}
                    />
                  </Field>
                  <Field label="Requested line size" id={`${uid}-line`}>
                    <div className="lra-money">
                      <input
                        id={`${uid}-line`}
                        inputMode="decimal"
                        placeholder="0.00"
                        value={deal.lineSize}
                        onChange={(e) => update({ lineSize: e.target.value, offer: null })}
                      />
                      <Dropdown
                        label="Line size currency"
                        value={deal.currency}
                        onChange={(v) => update({ currency: v, offer: null })}
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
                      <Field
                        label="Tenor (months)"
                        id={`${uid}-tenor`}
                        error={errors.tenor}
                        hint="Up to 120 months"
                      >
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

              {/* Documents */}
              <Section title="Documents">
                {deal.crfUploaded ? (
                  <div className="lra-file">
                    <Icon name="description" size={18} />
                    <span>credit-request-form.pdf</span>
                    <button
                      type="button"
                      className="lra-icon-btn is-small"
                      aria-label="Remove credit-request-form.pdf"
                      onClick={() => update({ crfUploaded: false })}
                    >
                      <Icon name="close" size={18} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="lra-btn is-secondary"
                    onClick={() => update({ crfUploaded: true })}
                  >
                    <Icon name="upload" size={18} />
                    Upload Credit Request Form
                  </button>
                )}
              </Section>

              {/* Offer */}
              <Section title="Offer">
                {deal.offer ? (
                  <article className="lra-offer">
                    <div className="lra-facility-top">
                      <span className="lra-pill is-blue">Streamlined (SBL) eligible</span>
                      {deal.offer.emlEligible && <span className="lra-pill is-good">EML eligible</span>}
                      <span className="lra-muted">Fixed term loan</span>
                    </div>
                    <dl className="lra-kv">
                      <div>
                        <dt>Facility type</dt>
                        <dd className="is-caps">{deal.offer.facilityType}</dd>
                      </div>
                      <div>
                        <dt>Collateral accounts</dt>
                        <dd>{deal.offer.collaterals.join(", ")}</dd>
                      </div>
                      <div>
                        <dt>Host account</dt>
                        <dd>{deal.offer.host}</dd>
                      </div>
                      <div>
                        <dt>Requested line size</dt>
                        <dd>{deal.offer.lineSize}</dd>
                      </div>
                    </dl>
                    <button type="button" className="lra-btn is-ghost" onClick={() => update({ offer: null })}>
                      Remove offer
                    </button>
                  </article>
                ) : (
                  <>
                    <button
                      type="button"
                      className="lra-btn is-primary"
                      disabled={!canCreateOffer}
                      onClick={createOffer}
                    >
                      Create offer
                    </button>
                    {!canCreateOffer && (
                      <p className="lra-field-hint">
                        Choose collateral, a host account, a facility type and a line size to create an
                        offer.
                      </p>
                    )}
                  </>
                )}
              </Section>
            </div>
          )}
        </>
      )}

    </div>
  );
}
