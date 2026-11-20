import { useId, useState } from "react";
import {
  AMEND_ORIGINAL,
  AMEND_ROLES,
  AMEND_UNCHANGED,
  BASE_RATE_TYPES,
  CLIENTS,
  COLLATERALS,
  COVENANTS,
  FACILITIES,
  PRICING_MODES,
} from "./data";
import { amendDiff, money } from "./rules";
import { Banner, Field, Icon, Section } from "./ui";
import Dropdown from "./dropdown";

/* Amendment — change an existing facility's terms. Loan details has four sections: Clients,
   Pricing, Collateral and Covenants. Each starts as the facility is today. Pressing Edit opens
   the controls; once something differs, the section shows Original beside Updated, with New and
   Deleted badges on the lines that moved. A section nothing has touched says so.

   Loan review (AmendReview) is the same comparison, read-only. Submitting needs at least one
   change, and the footer says so rather than going quiet. */

const set = (update, key, value) => update((d) => ({ amend: { ...d.amend, [key]: value } }));

/* A line in a comparison list, with its badge if it was added or removed */
function Line({ kind, children }) {
  return (
    <li className={"lra-diff-line" + (kind ? ` is-${kind}` : "")}>
      <span>{children}</span>
      {kind === "new" && <span className="lra-pill is-good">New</span>}
      {kind === "deleted" && <span className="lra-pill is-critical">Deleted</span>}
      {kind === "changed" && <span className="lra-pill is-warn">Changed</span>}
    </li>
  );
}

/* Original beside Updated */
function Compare({ original, updated }) {
  return (
    <div className="lra-compare">
      <div className="lra-compare-card">
        <h5>Original</h5>
        <ul>{original}</ul>
      </div>
      <div className="lra-compare-card is-updated">
        <h5>Updated</h5>
        <ul>{updated}</ul>
      </div>
    </div>
  );
}

/* A section of the amendment: title, a changed/unchanged pill, Edit, then the editor (while
   open) and the comparison (once something differs) */
function ChangeSection({ title, changed, count, editing, onToggle, editor, compare, readOnly }) {
  return (
    <Section
      title={title}
      aside={
        <span className="lra-section-actions">
          <span className={"lra-pill " + (changed ? "is-warn" : "is-neutral")}>
            {changed ? `${count} change${count === 1 ? "" : "s"}` : "No changes"}
          </span>
          {!readOnly && (
            <button type="button" className="lra-btn is-secondary" aria-expanded={editing} onClick={onToggle}>
              {editing ? "Done" : "Edit"}
            </button>
          )}
        </span>
      }
    >
      {editing && editor}
      {changed ? compare : !editing && <p className="lra-muted">{AMEND_UNCHANGED}</p>}
    </Section>
  );
}

const partyLine = (p) => `${p.name} · ${p.role}`;

/* The four comparisons, shared by Loan details and Loan review */
function sections(amend, diff) {
  const o = AMEND_ORIGINAL;
  const p = amend.pricing;
  const priceRows = (v) =>
    v.mode === "Exception"
      ? [
          ["Pricing", "Exception"],
          ["Base rate type", v.baseRate],
          ["Spread", `${v.spread || "–"} bps`],
        ]
      : [["Pricing", "Standard"]];
  return {
    clients: (
      <Compare
        original={o.parties.map((x) => (
          <Line key={partyKey(x)} kind={diff.clients.some((c) => c.kind === "deleted" && partyKey(c.p) === partyKey(x)) ? "deleted" : ""}>
            {partyLine(x)}
          </Line>
        ))}
        updated={amend.parties.map((x) => (
          <Line key={partyKey(x)} kind={diff.clients.some((c) => c.kind === "new" && partyKey(c.p) === partyKey(x)) ? "new" : ""}>
            {partyLine(x)}
          </Line>
        ))}
      />
    ),
    pricing: (
      <Compare
        original={priceRows(o.pricing).map(([k, v]) => (
          <Line key={k}>
            <span className="lra-diff-key">{k}</span> {v}
          </Line>
        ))}
        updated={priceRows(p).map(([k, v], i) => (
          <Line key={k} kind={diffRowChanged(k, o.pricing, p) ? "changed" : ""}>
            <span className="lra-diff-key">{k}</span> {v}
          </Line>
        ))}
      />
    ),
    collateral: (
      <Compare
        original={o.collaterals.map((a) => (
          <Line key={a} kind={diff.collateral.some((c) => c.kind === "deleted" && c.a === a) ? "deleted" : ""}>
            {acctLabel(a)}
          </Line>
        ))}
        updated={amend.collaterals.map((a) => (
          <Line key={a} kind={diff.collateral.some((c) => c.kind === "new" && c.a === a) ? "new" : ""}>
            {acctLabel(a)}
          </Line>
        ))}
      />
    ),
    covenants: (
      <Compare
        original={diff.covenants.map((id) => (
          <Line key={id}>
            {covTitle(id)}
            <span className="lra-diff-sub">{o.covenants[id] || "No comment"}</span>
          </Line>
        ))}
        updated={diff.covenants.map((id) => (
          <Line key={id} kind="changed">
            {covTitle(id)}
            <span className="lra-diff-sub">{amend.covenants[id] || "No comment"}</span>
          </Line>
        ))}
      />
    ),
  };
}

const partyKey = (p) => `${p.name}|${p.role}`;
const acctLabel = (a) => {
  const c = COLLATERALS.find((x) => x.acct === a);
  return c ? `${c.acct} · ${c.owners} · ${money(c.mv, "EUR")}` : a;
};
const covTitle = (id) => {
  const c = COVENANTS.find((x) => x.id === id);
  return c ? `${c.id} · ${c.title}` : id;
};
function diffRowChanged(label, o, p) {
  if (label === "Pricing") return o.mode !== p.mode;
  if (label === "Base rate type") return o.baseRate !== p.baseRate;
  return o.spread !== p.spread;
}

/* --- Loan details --------------------------------------------------------------------- */

export function AmendDetails({ deal, update }) {
  const uid = useId();
  const [open, setOpen] = useState({ clients: false, pricing: false, collateral: false, covenants: false });
  const toggle = (k) => setOpen((o) => ({ ...o, [k]: !o[k] }));
  const [clientId, setClientId] = useState("");
  const [role, setRole] = useState("");
  const a = deal.amend;
  const diff = amendDiff(a);
  const cmp = sections(a, diff);
  const fac = FACILITIES.find((f) => f.id === deal.facilityId);
  const eligible = CLIENTS.filter((c) => !c.error);
  const canAdd = clientId && role && !a.parties.some((p) => p.name === CLIENTS.find((c) => c.id === clientId)?.name && p.role === role);

  return (
    <div className="lra-step">
      <Banner>
        <strong>Amending</strong> {fac?.type}, facility {fac?.facilityId}. Its current terms are the starting point —
        edit a section to change it. An amendment needs at least one change.
      </Banner>

      <ChangeSection
        title="Clients"
        changed={diff.clients.length > 0}
        count={diff.clients.length}
        editing={open.clients}
        onToggle={() => toggle("clients")}
        compare={cmp.clients}
        editor={
          <div className="lra-amend-edit">
            <div className="lra-table-wrap">
              <table className="lra-table">
                <thead>
                  <tr>
                    <th scope="col">Client name</th>
                    <th scope="col">ECI</th>
                    <th scope="col">Role</th>
                    <th scope="col">
                      <span className="lra-sr">Remove</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {a.parties.map((p, i) => (
                    <tr key={partyKey(p)}>
                      <th scope="row">{p.name}</th>
                      <td>{p.eci}</td>
                      <td>
                        <Dropdown
                          compact
                          value={p.role}
                          onChange={(v) => set(update, "parties", a.parties.map((q, j) => (j === i ? { ...q, role: v } : q)))}
                          options={AMEND_ROLES}
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="lra-icon-btn"
                          aria-label={`Remove ${p.name} (${p.role})`}
                          onClick={() => set(update, "parties", a.parties.filter((_, j) => j !== i))}
                        >
                          <Icon name="delete" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="lra-party-row">
              <Field label="Search clients" id={`${uid}-client`}>
                <Dropdown
                  id={`${uid}-client`}
                  value={clientId}
                  onChange={setClientId}
                  placeholder="Search by name, ECI or UCN"
                  options={eligible.map((c) => ({ value: c.id, label: `${c.name} · ECI ${c.eci}` }))}
                />
              </Field>
              <Field label="Role" id={`${uid}-role`}>
                <Dropdown id={`${uid}-role`} value={role} onChange={setRole} placeholder="Select a role…" options={AMEND_ROLES} />
              </Field>
              <button
                type="button"
                className="lra-btn is-tonal lra-add-party"
                disabled={!canAdd}
                onClick={() => {
                  const c = CLIENTS.find((x) => x.id === clientId);
                  set(update, "parties", [...a.parties, { name: c.name, eci: c.eci, role }]);
                  setClientId("");
                  setRole("");
                }}
              >
                <Icon name="add" size={18} />
                Add party
              </button>
            </div>
          </div>
        }
      />

      <ChangeSection
        title="Pricing"
        changed={diff.pricing.length > 0}
        count={diff.pricing.length}
        editing={open.pricing}
        onToggle={() => toggle("pricing")}
        compare={cmp.pricing}
        editor={
          <div className="lra-amend-edit">
            <div className="lra-radios" role="radiogroup" aria-label="Pricing">
              {PRICING_MODES.map((m) => (
                <label key={m} className="lra-radio">
                  <input
                    type="radio"
                    name={`${uid}-pricing`}
                    checked={a.pricing.mode === m}
                    onChange={() => set(update, "pricing", { ...a.pricing, mode: m })}
                  />
                  {m}
                </label>
              ))}
            </div>
            {a.pricing.mode === "Exception" && (
              <div className="lra-grid">
                <Field label="Base rate type" id={`${uid}-base`}>
                  <Dropdown
                    id={`${uid}-base`}
                    value={a.pricing.baseRate}
                    onChange={(v) => set(update, "pricing", { ...a.pricing, baseRate: v })}
                    options={BASE_RATE_TYPES}
                  />
                </Field>
                <Field label="Spread (bps)" id={`${uid}-spread`}>
                  <input
                    id={`${uid}-spread`}
                    inputMode="decimal"
                    value={a.pricing.spread}
                    onChange={(e) => set(update, "pricing", { ...a.pricing, spread: e.target.value.replace(/[^\d.]/g, "") })}
                  />
                </Field>
              </div>
            )}
          </div>
        }
      />

      <ChangeSection
        title="Collateral"
        changed={diff.collateral.length > 0}
        count={diff.collateral.length}
        editing={open.collateral}
        onToggle={() => toggle("collateral")}
        compare={cmp.collateral}
        editor={
          <div className="lra-amend-edit">
            <div className="lra-table-wrap">
              <table className="lra-table">
                <thead>
                  <tr>
                    <th scope="col">
                      <span className="lra-sr">Select</span>
                    </th>
                    <th scope="col">Account owner(s)</th>
                    <th scope="col">Account #</th>
                    <th scope="col">Account type</th>
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
                          checked={a.collaterals.includes(c.acct)}
                          aria-label={`Use account ${c.acct} as collateral`}
                          onChange={() =>
                            set(
                              update,
                              "collaterals",
                              a.collaterals.includes(c.acct) ? a.collaterals.filter((x) => x !== c.acct) : [...a.collaterals, c.acct]
                            )
                          }
                        />
                      </td>
                      <td>{c.owners}</td>
                      <th scope="row">{c.acct}</th>
                      <td>{c.type}</td>
                      <td className="is-num">{money(c.mv)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        }
      />

      <ChangeSection
        title="Covenants"
        changed={diff.covenants.length > 0}
        count={diff.covenants.length}
        editing={open.covenants}
        onToggle={() => toggle("covenants")}
        compare={cmp.covenants}
        editor={
          <div className="lra-amend-edit">
            <div className="lra-table-wrap">
              <table className="lra-table">
                <thead>
                  <tr>
                    <th scope="col">Covenant</th>
                    <th scope="col">Category</th>
                    <th scope="col">Description</th>
                    <th scope="col">Comment</th>
                  </tr>
                </thead>
                <tbody>
                  {COVENANTS.map((c) => (
                    <tr key={c.id}>
                      <th scope="row">
                        {c.id} · {c.title}
                      </th>
                      <td>{c.category}</td>
                      <td>{c.description}</td>
                      <td>
                        <input
                          aria-label={`Comment on ${c.title}`}
                          value={a.covenants[c.id] ?? ""}
                          placeholder="Add a comment"
                          onChange={(e) => set(update, "covenants", { ...a.covenants, [c.id]: e.target.value })}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        }
      />
    </div>
  );
}

/* --- Loan review ----------------------------------------------------------------------- */

export function AmendReview({ deal, onEdit }) {
  const a = deal.amend;
  const diff = amendDiff(a);
  const cmp = sections(a, diff);
  const list = [
    ["Clients", "clients", diff.clients.length],
    ["Pricing", "pricing", diff.pricing.length],
    ["Collateral", "collateral", diff.collateral.length],
    ["Covenants", "covenants", diff.covenants.length],
  ];
  return (
    <div className="lra-step">
      {diff.total ? (
        <Banner tone="success">
          {diff.total} change{diff.total === 1 ? "" : "s"} to the facility, across{" "}
          {list.filter(([, , n]) => n).length} section{list.filter(([, , n]) => n).length === 1 ? "" : "s"}. Original
          and updated terms are side by side below.
        </Banner>
      ) : (
        <Banner tone="warning">
          Nothing has changed yet. An amendment needs at least one change —{" "}
          <button type="button" className="lra-link" onClick={() => onEdit(1)}>
            go back to Loan details
          </button>
          .
        </Banner>
      )}
      {list.map(([title, key, n]) => (
        <ChangeSection key={key} title={title} readOnly changed={n > 0} count={n} compare={cmp[key]} />
      ))}
    </div>
  );
}
