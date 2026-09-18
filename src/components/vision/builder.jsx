import { useId } from "react";
import { Banner, Icon } from "../lra/ui";
import {
  ASSET_TYPES,
  BESPOKE_FACILITIES,
  COLLATERALS,
  CURRENCIES,
  DM_FACILITIES,
  DOC_TYPES,
  FACILITIES,
  FBI_ROWS,
  HOST_ACCOUNTS,
  LIFE_POLICY,
  NEXT_DOC_NAMES,
  OPPORTUNITIES,
  OPPORTUNITY_COLLATERAL,
  RISK_COMMENT,
  SAMPLE_DOCS,
  STANDARD_LV,
  TEAMS,
} from "./data";
import { Field, RiskComment, Section, Select, Tabs, YesNo, clientOf, money, num } from "./parts";

/* The bespoke deal builder (Collateral and DM account tabs), and the logic
   that turns whichever path the banker took into one offer summary. */

export const emptyBespoke = () => ({
  open: false,
  reason: "",
  unsecured: "No",
  tab: "collateral",
  collaterals: [],
  ccy: {},
  life: "No",
  lifeRow: { ...LIFE_POLICY },
  lifeValuation: false,
  additional: "No",
  addl: { value: "", assetType: "Equities", owner: "Adam Ross", comments: "" },
  hostMode: "existing",
  host: "",
  facility: "Fixed term loan",
  lineSize: "8,000,000.00",
  currency: "USD",
  eml: false,
  offer: null,
  dm: {
    facility: "Committed line",
    lineSize: "10,000,000.00",
    grades: Object.fromEntries(FBI_ROWS.map((r) => [r.key, r.initial])),
    overview: "",
    docs: SAMPLE_DOCS,
    team: "",
  },
});

export const fbiTotal = (grades) => FBI_ROWS.reduce((sum, r) => sum + Number(grades[r.key]), 0);

// Lending value of the selected collateral, plus any extra security
export function lendingValue(b) {
  const pledged = COLLATERALS.filter((c) => b.collaterals.includes(c.acct)).reduce(
    (sum, c) => sum + c.mv * STANDARD_LV,
    0
  );
  const life = b.life === "Yes" ? num(b.lifeRow.mv) * 0.9 : 0;
  const addl = b.additional === "Yes" ? num(b.addl.value) * 0.5 : 0;
  return pledged + life + addl;
}

export function evaluateOffer(b, borrower = "Adam Ross") {
  const collateral = b.unsecured === "Yes" ? [] : b.collaterals;
  return {
    kind: "offer",
    product: b.facility,
    facility: "GLOBAL LIMIT",
    lineSize: num(b.lineSize),
    currency: b.currency,
    rate: "2.4% (SOFR +0.00%)",
    collateral,
    host: b.hostMode === "new" ? "New host account" : b.host,
    borrowers: borrower,
    grading: "+5",
    tags: ["Streamlined (SBL) eligible", ...(b.eml ? ["EML eligible"] : [])],
  };
}

/* Whatever the banker picked, as one summary — or null if nothing is picked */
export function resolveOffer(deal) {
  const names = deal.parties.map((p) => clientOf(p.id).name).join(", ");
  const [kind, id] = (deal.choice ?? "").split(":");
  if (kind === "opp") {
    const o = OPPORTUNITIES.find((x) => x.id === id);
    return {
      kind,
      product: o.product,
      facility: o.product.toUpperCase(),
      lineSize: o.lineSize,
      currency: "USD",
      rate: o.rate,
      collateral: OPPORTUNITY_COLLATERAL,
      borrowers: names,
    };
  }
  if (kind === "amend") {
    const f = FACILITIES.find((x) => x.id === id);
    return {
      kind,
      product: `Amendment to ${f.id}`,
      facility: f.facility.toUpperCase(),
      lineSize: f.lineSize,
      currency: "USD",
      rate: f.rate,
      collateral: OPPORTUNITY_COLLATERAL,
      borrowers: f.borrowers,
    };
  }
  if (kind === "offer" && deal.b.offer) return deal.b.offer;
  // Proposals 1–3 hand over a ready-made offer
  if (kind === "custom") return deal.custom;
  if (kind === "dm" && deal.b.dm.team && num(deal.b.dm.lineSize) > 0) {
    const dm = deal.b.dm;
    return {
      kind,
      product: dm.facility,
      facility: dm.facility.toUpperCase(),
      lineSize: num(dm.lineSize),
      currency: "USD",
      rate: "Set in underwriting",
      collateral: [],
      borrowers: names,
      team: dm.team,
      fbi: fbiTotal(dm.grades),
    };
  }
  return null;
}

/* --- Pieces ------------------------------------------------------------------ */

export function CollateralTable({ b, set }) {
  const toggle = (acct) =>
    set({
      collaterals: b.collaterals.includes(acct)
        ? b.collaterals.filter((a) => a !== acct)
        : [...b.collaterals, acct],
    });
  return (
    <div className="lra-table-wrap">
      <table className="lra-table">
        <thead>
          <tr>
            <th scope="col">
              <span className="lra-sr">Select</span>
            </th>
            <th scope="col">Account owner(s)</th>
            <th scope="col">Account #</th>
            <th scope="col">Internal account #</th>
            <th scope="col">Legacy account #</th>
            <th scope="col">Account type</th>
            <th scope="col">Facility</th>
            <th scope="col" className="is-num">
              Market value
            </th>
            <th scope="col">Currency</th>
            <th scope="col">Standard LV</th>
            <th scope="col">Maintenance LV</th>
            <th scope="col">PLV</th>
          </tr>
        </thead>
        <tbody>
          {COLLATERALS.map((c) => (
            <tr key={c.acct}>
              <td>
                <input
                  type="checkbox"
                  checked={b.collaterals.includes(c.acct)}
                  onChange={() => toggle(c.acct)}
                  aria-label={`Use account ${c.acct} as collateral`}
                />
              </td>
              <td>{c.owners}</td>
              <th scope="row">{c.acct}</th>
              <td>{c.internal}</td>
              <td>{c.legacy}</td>
              <td>{c.type}</td>
              <td>{c.facility}</td>
              <td className="is-num">{money(c.mv, "").trim()}</td>
              <td>
                <Select
                  className="is-compact"
                  label={`Currency for ${c.acct}`}
                  value={b.ccy[c.acct] ?? c.ccy}
                  onChange={(v) => set({ ccy: { ...b.ccy, [c.acct]: v } })}
                  options={CURRENCIES}
                />
              </td>
              <td>{c.std}</td>
              <td>{c.maint}</td>
              <td>{c.plv}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function LifeInsurance({ b, set }) {
  const uid = useId();
  const row = b.lifeRow;
  const setRow = (patch) => set({ lifeRow: { ...row, ...patch } });
  return (
    <Section title="Life insurance">
      <YesNo
        name={`${uid}-life`}
        legend="Do you wish to use any existing life insurance contracts as collateral for this loan?"
        value={b.life}
        onChange={(v) => set({ life: v })}
      />
      {b.life === "Yes" && (
        <div className="lra-table-wrap">
          <table className="lra-table vp-edit-table">
            <thead>
              <tr>
                <th scope="col">Policy number</th>
                <th scope="col">Policy holder</th>
                <th scope="col">Life insurance company</th>
                <th scope="col">Currency</th>
                <th scope="col">Market value</th>
                <th scope="col">JPMSE broker</th>
                <th scope="col">Valuation</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                {[
                  ["policy", "Policy number"],
                  ["holder", "Policy holder"],
                  ["company", "Life insurance company"],
                ].map(([k, label]) => (
                  <td key={k}>
                    <input aria-label={label} value={row[k]} onChange={(e) => setRow({ [k]: e.target.value })} />
                  </td>
                ))}
                <td>
                  <Select
                    className="is-compact"
                    label="Policy currency"
                    value={row.ccy}
                    onChange={(v) => setRow({ ccy: v })}
                    options={CURRENCIES}
                  />
                </td>
                <td>
                  <input
                    aria-label="Policy market value"
                    inputMode="decimal"
                    value={row.mv}
                    onChange={(e) => setRow({ mv: e.target.value })}
                  />
                </td>
                <td>
                  <Select
                    className="is-compact"
                    label="JPMSE broker"
                    value={row.broker}
                    onChange={(v) => setRow({ broker: v })}
                    options={["Yes", "No"]}
                  />
                </td>
                <td>
                  {b.lifeValuation ? (
                    <span className="lra-pill is-good vp-pill-icon">
                      <Icon name="check" size={14} />
                      Uploaded
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="lra-btn is-ghost"
                      onClick={() => set({ lifeValuation: true })}
                    >
                      <Icon name="upload" size={18} />
                      Upload
                    </button>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </Section>
  );
}

export function AdditionalAssets({ b, set }) {
  const uid = useId();
  const a = b.addl;
  const setA = (patch) => set({ addl: { ...a, ...patch } });
  return (
    <Section title="Additional assets">
      <YesNo
        name={`${uid}-addl`}
        legend="Does the client have additional assets held away that support this loan?"
        value={b.additional}
        onChange={(v) => set({ additional: v })}
      />
      {b.additional === "Yes" && (
        <>
          <p className="vp-subhead">Account details</p>
          <div className="lra-grid">
            <Field label="Account value (USD)" id={`${uid}-val`}>
              <input
                id={`${uid}-val`}
                inputMode="decimal"
                placeholder="0.00"
                value={a.value}
                onChange={(e) => setA({ value: e.target.value })}
              />
            </Field>
            <Field label="Asset type" id={`${uid}-type`}>
              <Select id={`${uid}-type`} value={a.assetType} onChange={(v) => setA({ assetType: v })} options={ASSET_TYPES} />
            </Field>
            <Field label="Account owner" id={`${uid}-owner`}>
              <input id={`${uid}-owner`} value={a.owner} onChange={(e) => setA({ owner: e.target.value })} />
            </Field>
          </div>
          <Field
            label="Comments"
            id={`${uid}-comments`}
            className="vp-field-top"
            hint={`${a.comments.length}/5000`}
          >
            <textarea
              id={`${uid}-comments`}
              rows={3}
              maxLength={5000}
              value={a.comments}
              onChange={(e) => setA({ comments: e.target.value })}
            />
          </Field>
        </>
      )}
    </Section>
  );
}

export function HostAccounts({ b, set }) {
  const uid = useId();
  return (
    <Section title="Host accounts" sub="Select at least one host account or create a new account.">
      <div className="lra-radios" role="radiogroup" aria-label="Host account">
        {["existing", "new"].map((k) => (
          <label key={k} className="lra-radio">
            <input
              type="radio"
              name={`${uid}-mode`}
              checked={b.hostMode === k}
              onChange={() => set({ hostMode: k })}
            />
            {k === "existing" ? "Existing" : "New"}
          </label>
        ))}
      </div>
      {b.hostMode === "existing" ? (
        <div className="lra-table-wrap">
          <table className="lra-table">
            <thead>
              <tr>
                <th scope="col">
                  <span className="lra-sr">Select</span>
                </th>
                <th scope="col">Account #</th>
                <th scope="col">Internal #</th>
                <th scope="col">Owner(s)</th>
              </tr>
            </thead>
            <tbody>
              {HOST_ACCOUNTS.map((h) => (
                <tr key={h.acct}>
                  <td>
                    <input
                      type="radio"
                      name={`${uid}-acct`}
                      checked={b.host === h.acct}
                      onChange={() => set({ host: h.acct })}
                      aria-label={`Host account ${h.acct}`}
                    />
                  </td>
                  <th scope="row">{h.acct}</th>
                  <td>{h.internal}</td>
                  <td>{h.owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="lra-field-hint">A new host account will be opened for the primary borrower.</p>
      )}
    </Section>
  );
}

export function FacilityFields({ b, set }) {
  const uid = useId();
  return (
    <Section title="Select facility">
      <div className="lra-grid">
        <Field label="Facility" id={`${uid}-fac`}>
          <Select id={`${uid}-fac`} value={b.facility} onChange={(v) => set({ facility: v })} options={BESPOKE_FACILITIES} />
        </Field>
        <Field label="Line size (USD)" id={`${uid}-line`}>
          <div className="lra-money">
            <input
              id={`${uid}-line`}
              inputMode="decimal"
              value={b.lineSize}
              onChange={(e) => set({ lineSize: e.target.value })}
            />
            <Select label="Line size currency" value={b.currency} onChange={(v) => set({ currency: v })} options={CURRENCIES} />
          </div>
        </Field>
      </div>
      <label className="lra-radio vp-check">
        <input type="checkbox" checked={b.eml} onChange={(e) => set({ eml: e.target.checked })} />
        EML/PLC
      </label>
    </Section>
  );
}

export function OfferCard({ offer, onRemove, onSelect, selected }) {
  return (
    <article className={"lra-offer vp-offer" + (selected ? " is-selected" : "")}>
      <div className="lra-facility-top">
        {offer.tags?.map((t) => (
          <span key={t} className={"lra-pill " + (t.startsWith("EML") ? "is-good" : "is-blue")}>
            {t}
          </span>
        ))}
        <span className="lra-muted">{offer.product}</span>
      </div>
      <dl className="lra-kv is-review">
        <div>
          <dt>Facility type</dt>
          <dd>{offer.facility}</dd>
        </div>
        <div>
          <dt>Line size</dt>
          <dd>{money(offer.lineSize, offer.currency)}</dd>
        </div>
        <div>
          <dt>Rate</dt>
          <dd>{offer.rate}</dd>
        </div>
        <div>
          <dt>Collateral</dt>
          <dd>{offer.collateral.length ? offer.collateral.join("; ") : "Unsecured"}</dd>
        </div>
        <div>
          <dt>Borrowers</dt>
          <dd>{offer.borrowers}</dd>
        </div>
        {offer.grading && (
          <div>
            <dt>Grading</dt>
            <dd>{offer.grading}</dd>
          </div>
        )}
      </dl>
      <div className="vp-offer-actions">
        {onSelect && (
          <button
            type="button"
            className={"lra-btn is-toggle" + (selected ? " is-on" : "")}
            aria-pressed={selected}
            onClick={onSelect}
          >
            {selected && <Icon name="check" size={18} />}
            {selected ? "Selected" : "Select offer"}
          </button>
        )}
        {onRemove && (
          <button type="button" className="lra-btn is-ghost" onClick={onRemove}>
            Remove
          </button>
        )}
      </div>
    </article>
  );
}

/* DM account: credit-underwritten deals */
export function DmAccount({ b, set, onTeam }) {
  const uid = useId();
  const dm = b.dm;
  const setDm = (patch) => set({ dm: { ...dm, ...patch } });
  const have = new Set(dm.docs.map((d) => d.type));
  const fbi = fbiTotal(dm.grades);

  function addDocs(names) {
    const docs = [...dm.docs];
    names.forEach((name) => {
      const type = DOC_TYPES.find((t) => !docs.some((d) => d.type === t)) ?? "Other";
      docs.push({ name: name ?? NEXT_DOC_NAMES[type] ?? "Document.pdf", by: "Stephen Green", type, date: "17-Sep-2026" });
    });
    setDm({ docs });
  }

  return (
    <>
      <div className="lra-grid">
        <Field label="Facility" id={`${uid}-fac`}>
          <Select id={`${uid}-fac`} value={dm.facility} onChange={(v) => setDm({ facility: v })} options={DM_FACILITIES} />
        </Field>
        <Field label="Line size (USD)" id={`${uid}-line`}>
          <input
            id={`${uid}-line`}
            inputMode="decimal"
            value={dm.lineSize}
            onChange={(e) => setDm({ lineSize: e.target.value })}
          />
        </Field>
      </div>

      <Section title="Financial based indicators" className="vp-section-gap">
        <div className="lra-table-wrap">
          <table className="lra-table">
            <thead>
              <tr>
                <th scope="col">Indicator</th>
                <th scope="col">Value</th>
                <th scope="col">Lender's grade</th>
                <th scope="col">Initial grade</th>
              </tr>
            </thead>
            <tbody>
              {FBI_ROWS.map((r) => (
                <tr key={r.key}>
                  <th scope="row">{r.label}</th>
                  <td>{r.value}</td>
                  <td>
                    <Select
                      className="is-compact"
                      label={`Lender's grade for ${r.label}`}
                      value={String(dm.grades[r.key])}
                      onChange={(v) => setDm({ grades: { ...dm.grades, [r.key]: Number(v) } })}
                      options={["1", "2", "3", "4", "5"]}
                    />
                  </td>
                  <td>{r.initial}</td>
                </tr>
              ))}
              <tr className="vp-total-row">
                <th scope="row">Calculated FBI</th>
                <td />
                <td>
                  <strong>{fbi}/20</strong>
                </td>
                <td>17/20</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Field label="Brief overview of balance sheet / cash flows" id={`${uid}-ov`} className="vp-field-top">
          <textarea id={`${uid}-ov`} rows={3} value={dm.overview} onChange={(e) => setDm({ overview: e.target.value })} />
        </Field>
        <RiskComment {...RISK_COMMENT} />
      </Section>

      <Section title="Due diligence documents">
        <div className="vp-dd">
          <div className="vp-dd-main">
            <button
              type="button"
              className="vp-dropzone"
              onClick={() => addDocs([undefined])}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                addDocs([...e.dataTransfer.files].map((f) => f.name));
              }}
            >
              <Icon name="upload" />
              <span>
                <strong>Drag and drop files here</strong> or click to add a sample document
              </span>
              <span className="lra-muted">PDF, DOC, XLSX, PNG · 50 MB max</span>
            </button>
            <div className="lra-table-wrap">
              <table className="lra-table">
                <thead>
                  <tr>
                    <th scope="col">File name</th>
                    <th scope="col">Uploaded by</th>
                    <th scope="col">Document type</th>
                    <th scope="col">Date</th>
                    <th scope="col">
                      <span className="lra-sr">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dm.docs.map((d, i) => (
                    <tr key={d.name + i}>
                      <th scope="row">{d.name}</th>
                      <td>{d.by}</td>
                      <td>{d.type}</td>
                      <td>{d.date}</td>
                      <td>
                        <button
                          type="button"
                          className="lra-icon-btn"
                          aria-label={`Delete ${d.name}`}
                          onClick={() => setDm({ docs: dm.docs.filter((_, j) => j !== i) })}
                        >
                          <Icon name="delete" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <aside className="vp-checklist" aria-label="Document checklist">
            <h5>Document checklist</h5>
            <ul>
              {DOC_TYPES.map((t) => (
                <li key={t} className={have.has(t) ? "is-done" : ""}>
                  <span className="vp-check-dot" aria-hidden="true">
                    {have.has(t) && <Icon name="check" size={14} />}
                  </span>
                  {t}
                  <span className="lra-sr">{have.has(t) ? " — received" : " — missing"}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </Section>

      <Section title="Select your underwriting team">
        <div className="lra-grid">
          <Field label="Underwriting team" id={`${uid}-team`}>
            <Select
              id={`${uid}-team`}
              value={dm.team}
              onChange={(v) => {
                setDm({ team: v });
                onTeam?.(v);
              }}
              options={TEAMS}
              placeholder="Select a team…"
            />
          </Field>
        </div>
      </Section>
    </>
  );
}

/* The full bespoke builder, as in today's app */
export function BespokeBuilder({ deal, setB, choose }) {
  const uid = useId();
  const b = deal.b;
  // Any edit to the build invalidates an evaluated offer
  const set = (patch) =>
    setB({ ...patch, offer: null }, deal.choice === "offer" ? null : undefined);
  const canEvaluate =
    (b.unsecured === "Yes" || b.collaterals.length > 0) &&
    (b.hostMode === "new" || b.host) &&
    num(b.lineSize) > 0;

  return (
    <div className="lra-sbl vp-bespoke">
      <Section
        title="Start a new loan request"
        sub="We show the client's secured and unsecured collateral accounts. Pick what supports this deal, then evaluate an offer."
      >
        <YesNo
          name={`${uid}-unsec`}
          legend="Does the client have unsecured collaterals?"
          value={b.unsecured}
          onChange={(v) => set({ unsecured: v })}
        />
        {b.unsecured === "Yes" && <Banner>No collateral selection is required for unsecured deals.</Banner>}
      </Section>

      <Tabs
        label="Deal type"
        value={b.tab}
        onChange={(tab) => setB({ tab })}
        tabs={[
          ["collateral", "Collateral"],
          ["dm", "DM account"],
        ]}
      />

      {b.tab === "collateral" ? (
        <div role="tabpanel">
          {b.unsecured === "No" && (
            <Section title="Collateral">
              <CollateralTable b={b} set={set} />
            </Section>
          )}
          <LifeInsurance b={b} set={set} />
          <AdditionalAssets b={b} set={set} />
          <HostAccounts b={b} set={set} />
          <FacilityFields b={b} set={set} />
          <Section title="Offer">
            {b.offer ? (
              <>
                <Banner tone="success">Offer(s) suggested for this client</Banner>
                <OfferCard offer={b.offer} onRemove={() => setB({ offer: null }, null)} />
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="lra-btn is-primary"
                  disabled={!canEvaluate}
                  onClick={() => setB({ offer: evaluateOffer(b) }, "offer")}
                >
                  Evaluate offer
                </button>
                {!canEvaluate && (
                  <p className="lra-field-hint">
                    Select collateral (or mark the deal unsecured), a host account and a line size.
                  </p>
                )}
              </>
            )}
          </Section>
        </div>
      ) : (
        <div role="tabpanel">
          <DmAccount b={b} set={(patch) => setB(patch)} onTeam={(team) => choose(team ? "dm" : null)} />
        </div>
      )}
    </div>
  );
}
