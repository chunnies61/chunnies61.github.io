import { useId, useState } from "react";
import { Icon } from "../lra/ui";
import { CLIENTS, KYC_AFFIRMATIONS, ROLES, party } from "./data";

/* Shared building blocks for the future-vision prototype. They reuse the
   Loan Request App's Material 3 classes (.lra-*) so both prototypes speak
   the same design system. */

export const money = (n, ccy = "USD") =>
  `${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${ccy}`;

export const usd = (n) =>
  n >= 1e6
    ? `$${(n / 1e6).toFixed(2).replace(/\.?0+$/, "")}M`
    : n >= 1e3
      ? `$${Math.round(n / 1e3)}K`
      : `$${Math.round(n)}`;

export const num = (v) => Number(String(v ?? "").replace(/[^0-9.]/g, "")) || 0;

export const clientOf = (id) => CLIENTS.find((c) => c.id === id);

export function Field({ label, id, error, hint, children, className = "" }) {
  return (
    <div className={`lra-field ${error ? "has-error" : ""} ${className}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {error ? (
        <p className="lra-field-error">{error}</p>
      ) : (
        hint && <p className="lra-field-hint">{hint}</p>
      )}
    </div>
  );
}

export function Section({ title, sub, aside, children, className = "" }) {
  return (
    <section className={`lra-section ${className}`}>
      <div className="lra-section-head">
        <div>
          <h4>{title}</h4>
          {sub && <p className="vp-section-sub">{sub}</p>}
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}

export function Select({ id, value, onChange, options, placeholder, className, label }) {
  return (
    <select
      id={id}
      className={className}
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  );
}

export function YesNo({ name, value, onChange, legend }) {
  return (
    <fieldset className="vp-yesno">
      <legend>{legend}</legend>
      <div className="lra-radios">
        {["Yes", "No"].map((v) => (
          <label key={v} className="lra-radio">
            <input
              type="radio"
              name={name}
              checked={value === v}
              onChange={() => onChange(v)}
            />
            {v}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function Tabs({ tabs, value, onChange, label }) {
  return (
    <div className="lra-tabs" role="tablist" aria-label={label}>
      {tabs.map(([key, text]) => (
        <button
          key={key}
          type="button"
          role="tab"
          aria-selected={value === key}
          className={"lra-tab" + (value === key ? " is-active" : "")}
          onClick={() => onChange(key)}
        >
          <span>{text}</span>
        </button>
      ))}
    </div>
  );
}

/* Client search — an M3 outlined text field with a menu of matching clients
   (combobox pattern: arrow keys move, Enter picks, Escape closes). */
export function ClientSearch({ id, value, onPick, exclude = [] }) {
  const [query, setQuery] = useState(value ? clientOf(value).name : "");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const listId = `${id}-list`;

  const q = query.trim().toLowerCase();
  const matches = CLIENTS.filter(
    (c) =>
      !exclude.includes(c.id) &&
      (!q || [c.name, c.eci, c.ucn].some((s) => s.toLowerCase().includes(q)))
  );

  function pick(c) {
    onPick(c.id);
    setQuery(c.name);
    setOpen(false);
  }

  function onKeyDown(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(a + 1, matches.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && open && matches[active]) {
      e.preventDefault();
      pick(matches[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="lra-field vp-combo">
      <label htmlFor={id}>Search by client name, ECI, UCN, CAS, SPN or facility ID</label>
      <input
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && matches[active] ? `${id}-${matches[active].id}` : undefined}
        autoComplete="off"
        placeholder="e.g. Adam Ross or 9876543210"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setActive(0);
          if (value) onPick("");
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
      />
      {open && (
        <div className="vp-menu" id={listId} role="listbox" aria-label="Matching clients">
          <div className="vp-menu-head" aria-hidden="true">
            <span>Client code name</span>
            <span>ECI</span>
            <span>UCN</span>
            <span>Platform</span>
          </div>
          {matches.length === 0 && <p className="vp-menu-empty">No matching clients</p>}
          {matches.map((c, i) => (
            <div
              key={c.id}
              id={`${id}-${c.id}`}
              role="option"
              aria-selected={i === active}
              className={"vp-menu-row" + (i === active ? " is-active" : "")}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setActive(i)}
              onClick={() => pick(c)}
            >
              <span>{c.name}</span>
              <span>{c.eci}</span>
              <span>{c.ucn}</span>
              <span>{c.platform}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* Search + role + Add party. Adding looks the client up first. */
export function AddParty({ parties, onAdd, loading }) {
  const uid = useId();
  const [clientId, setClientId] = useState("");
  const [role, setRole] = useState("");
  const [key, setKey] = useState(0); // remounts the search to clear it
  const taken = parties.map((p) => p.id);
  const canAdd = clientId && role && !loading;

  return (
    <div className="lra-party-row">
      <ClientSearch
        key={key}
        id={`${uid}-client`}
        value={clientId}
        exclude={taken}
        onPick={(id) => {
          setClientId(id);
          if (id && !role) setRole(clientOf(id).role);
        }}
      />
      <Field label="Role" id={`${uid}-role`}>
        <Select id={`${uid}-role`} value={role} onChange={setRole} options={ROLES} placeholder="Select a role…" />
      </Field>
      <button
        type="button"
        className="lra-btn is-tonal"
        disabled={!canAdd}
        onClick={() => {
          onAdd(party(clientId, role));
          setClientId("");
          setRole("");
          setKey((k) => k + 1);
        }}
      >
        <Icon name="add" size={18} />
        Add party
      </button>
    </div>
  );
}

/* The parties table. Editable: KYC affirmation and role; rows can be deleted. */
export function PartiesTable({ parties, onChange, readOnly }) {
  const set = (i, patch) => onChange(parties.map((p, j) => (j === i ? { ...p, ...patch } : p)));
  return (
    <div className="lra-table-wrap">
      <table className="lra-table">
        <thead>
          <tr>
            <th scope="col">Client name</th>
            <th scope="col">ECI</th>
            <th scope="col">Lifecycle status</th>
            <th scope="col">UCN</th>
            <th scope="col">KYC status</th>
            <th scope="col">KYC affirmation</th>
            <th scope="col">Role</th>
            <th scope="col">Platform</th>
            {!readOnly && (
              <th scope="col">
                <span className="lra-sr">Delete</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {parties.map((p, i) => {
            const c = clientOf(p.id);
            return (
              <tr key={p.id}>
                <th scope="row">{c.name}</th>
                <td>{c.eci}</td>
                <td>Active</td>
                <td>{c.ucn}</td>
                <td>
                  <span className="lra-pill is-good vp-pill-icon">
                    {readOnly && <Icon name="check" size={14} />}
                    Complete
                  </span>
                </td>
                <td>
                  {readOnly ? (
                    p.kycAff
                  ) : (
                    <Select
                      className="is-compact"
                      label={`KYC affirmation for ${c.name}`}
                      value={p.kycAff}
                      onChange={(v) => set(i, { kycAff: v })}
                      options={KYC_AFFIRMATIONS}
                    />
                  )}
                </td>
                <td>
                  {readOnly ? (
                    p.role
                  ) : (
                    <Select
                      className="is-compact"
                      label={`Role for ${c.name}`}
                      value={p.role}
                      onChange={(v) => set(i, { role: v })}
                      options={ROLES}
                    />
                  )}
                </td>
                <td>{c.platform}</td>
                {!readOnly && (
                  <td>
                    <button
                      type="button"
                      className="lra-icon-btn"
                      aria-label={`Delete ${c.name}`}
                      onClick={() => onChange(parties.filter((_, j) => j !== i))}
                    >
                      <Icon name="delete" />
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* A key–value card. With `renderEdit`, it gains Edit → Cancel / Save: the
   form edits a draft that only lands on Save. */
export function InfoCard({ title, rows, values, renderEdit, onSave, extra }) {
  const [draft, setDraft] = useState(null);
  const editing = draft !== null;
  return (
    <article className="vp-card">
      <div className="vp-card-head">
        <h5>{title}</h5>
        {renderEdit &&
          (editing ? (
            <div className="vp-card-actions">
              <button type="button" className="lra-btn is-ghost" onClick={() => setDraft(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="lra-btn is-primary"
                onClick={() => {
                  onSave(draft);
                  setDraft(null);
                }}
              >
                Save
              </button>
            </div>
          ) : (
            <button type="button" className="lra-btn is-ghost" onClick={() => setDraft({ ...values })}>
              Edit
            </button>
          ))}
      </div>
      {editing ? (
        <div className="lra-grid vp-card-form">
          {renderEdit(draft, (patch) => setDraft((d) => ({ ...d, ...patch })))}
        </div>
      ) : (
        <dl className="lra-kv is-review">
          {rows.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value || "–"}</dd>
            </div>
          ))}
        </dl>
      )}
      {extra}
    </article>
  );
}

/* M3-style expandable list item */
export function Accordion({ title, status, children, defaultOpen = false }) {
  return (
    <details className="vp-accordion" open={defaultOpen}>
      <summary>
        <span className="vp-accordion-title">{title}</span>
        {status && (
          <span className={"lra-pill " + (status === "Complete" ? "is-good" : "is-warn")}>{status}</span>
        )}
        <Icon name="expand" />
      </summary>
      <div className="vp-accordion-body">{children}</div>
    </details>
  );
}

export function RiskComment({ author, when, text }) {
  return (
    <figure className="vp-comment">
      <figcaption>
        <span className="vp-avatar" aria-hidden="true">
          {author
            .split(" ")
            .map((w) => w[0])
            .join("")}
        </span>
        <span>
          <strong>{author}</strong> · Risk officer · {when}
        </span>
      </figcaption>
      <blockquote>{text}</blockquote>
    </figure>
  );
}
