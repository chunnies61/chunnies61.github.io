import { useId, useMemo, useState } from "react";
import {
  CQ_EXCEPTIONAL_PCT,
  CQ_PRIOR_LABEL,
  CQ_SECTIONS,
  CQ_SIGNERS,
  CQ_SIGNING_MODES,
  CQ_STATUSES,
  CQ_VALIDITY,
  QUESTIONNAIRES,
} from "./data";
import { Banner, Field, Icon, Section } from "./ui";
import Dropdown from "./dropdown";

/* Step 4 — Credit questionnaire (EMEA only). The questionnaires for this
   request on the left; on the right, the questionnaire itself — one form,
   the same one the client fills in, shown with what they returned.

   It reads as a single form rather than five panels: one header, one set of
   Edit / Cancel / Save, and the sections below it are headings inside that
   form. "Compare with last year" puts the prior figure under each field and
   flags any move of CQ_EXCEPTIONAL_PCT or more. Nothing here blocks: a
   missing signer is a hint, not a disabled button. */

const amount = (n) => n.toLocaleString("en-US");

const changePct = (row) => (row.prior ? ((row.value - row.prior) / row.prior) * 100 : null);

const isExceptional = (row) => {
  const pct = changePct(row);
  return pct !== null && Math.abs(pct) >= CQ_EXCEPTIONAL_PCT;
};

const priorHint = (row) => {
  const pct = changePct(row);
  if (pct === null) return undefined;
  return `${CQ_PRIOR_LABEL}: ${amount(row.prior)} · ${pct > 0 ? "+" : ""}${pct.toFixed(1)}%`;
};

const initialValues = () =>
  Object.fromEntries(
    CQ_SECTIONS.flatMap((s) => s.rows).map((r) => [r.id, r.text ?? amount(r.value)])
  );

export default function StepCq({ deal, update }) {
  const uid = useId();
  const [openId, setOpenId] = useState(QUESTIONNAIRES[0].id);
  const [compare, setCompare] = useState(false);
  // Only the section being corrected is open; everything else stays read-only
  const [editingId, setEditingId] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [values, setValues] = useState(initialValues);

  const open = QUESTIONNAIRES.find((q) => q.id === openId);
  const hasData = open.status === "returned";

  const exceptional = useMemo(
    () => CQ_SECTIONS.flatMap((s) => s.rows).filter((r) => r.prior && isExceptional(r)),
    []
  );

  const mode = CQ_SIGNING_MODES.find((m) => m.id === (deal.signingMode ?? "single"));
  const signers = deal.signers ?? [];
  const short = mode.signers - signers.length;

  function setValue(id, v) {
    setValues((prev) => ({ ...prev, [id]: v }));
    setDirty(true);
  }

  function addSigner(id) {
    update((d) => {
      const current = d.signers ?? [];
      return current.includes(id) ? {} : { signers: [...current, id] };
    });
  }

  function removeSigner(id) {
    update((d) => ({ signers: (d.signers ?? []).filter((s) => s !== id) }));
  }

  return (
    <div className="lra-step">
      <div className="lra-cq">
        {/* The questionnaires on this request */}
        <aside className="lra-cq-list" aria-label="Questionnaires">
          <div className="lra-cq-list-head">
            <h4>Questionnaires</h4>
            <span className="lra-pill is-neutral">{QUESTIONNAIRES.length} required</span>
          </div>
          <p className="lra-section-intro">
            Every party on this request needs one. Select a questionnaire to open it.
          </p>

          {/* The three hang off the request, so they read as its parts rather
              than as a list of clients to pick from */}
          <ul className="lra-cq-tree">
            {QUESTIONNAIRES.map((q) => {
              const status = CQ_STATUSES[q.status];
              return (
                <li key={q.id}>
                  <button
                    type="button"
                    className={"lra-cq-item" + (q.id === openId ? " is-open" : "")}
                    aria-current={q.id === openId ? "true" : undefined}
                    onClick={() => setOpenId(q.id)}
                  >
                    <span className="lra-cq-item-top">
                      <strong>{q.name}</strong>
                      <span className={`lra-pill is-${status.tone}`}>{status.label}</span>
                    </span>
                    <span className="lra-cq-item-meta">
                      {q.id} · {q.role} · {q.type}
                    </span>
                    <span className="lra-cq-item-msg">{q.message}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* The questionnaire, as one form */}
        <div className="lra-cq-panel">
          <div className="lra-cq-formhead">
            <div className="lra-cq-formhead-id">
              <h4>
                {open.id} · {open.name}
              </h4>
              <p className="lra-section-intro">
                {open.role} · {open.type} · {open.message}
              </p>
            </div>
          </div>

          {!hasData ? (
            <Banner>
              {open.message} {CQ_VALIDITY.pending}.
            </Banner>
          ) : (
            <>
              {exceptional.length > 0 ? (
                <Banner tone="warning">
                  {exceptional.length} exceptional change{exceptional.length === 1 ? "" : "s"} vs
                  last year
                </Banner>
              ) : (
                <Banner tone="success">No exceptional changes</Banner>
              )}

              <div className="lra-tabs" role="tablist" aria-label="Client data view">
                {[
                  [false, "Current"],
                  [true, `Compare with ${CQ_PRIOR_LABEL}`],
                ].map(([value, label]) => (
                  <button
                    key={label}
                    type="button"
                    role="tab"
                    aria-selected={compare === value}
                    className={"lra-tab" + (compare === value ? " is-active" : "")}
                    onClick={() => setCompare(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="lra-cq-form">
                {CQ_SECTIONS.map((section) => {
                  const isEditing = editingId === section.id;
                  return (
                    <Section
                      key={section.id}
                      title={section.title}
                      aside={
                        isEditing ? (
                          <span className="lra-section-actions">
                            <span className={"lra-pill " + (dirty ? "is-warn" : "is-good")}>
                              {dirty ? "Not saved" : "Saved"}
                            </span>
                            <button
                              type="button"
                              className="lra-btn is-ghost"
                              onClick={() => {
                                setValues(initialValues());
                                setDirty(false);
                                setEditingId(null);
                              }}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              className="lra-btn is-secondary"
                              onClick={() => {
                                setDirty(false);
                                setEditingId(null);
                              }}
                            >
                              Save
                            </button>
                          </span>
                        ) : (
                          <button
                            type="button"
                            className="lra-btn is-ghost"
                            onClick={() => setEditingId(section.id)}
                          >
                            Edit
                          </button>
                        )
                      }
                    >
                      {/* Answers read as answers. Editing one is the exception,
                          so only the section being corrected turns into fields. */}
                      {isEditing ? (
                        <div className="lra-grid">
                          {section.rows.map((row) => (
                            <Field
                              key={row.id}
                              label={row.label}
                              id={`${uid}-${row.id}`}
                              className={compare && isExceptional(row) ? "is-flagged" : ""}
                              hint={compare ? priorHint(row) : undefined}
                            >
                              <input
                                id={`${uid}-${row.id}`}
                                value={values[row.id]}
                                inputMode={row.text ? undefined : "decimal"}
                                onChange={(e) => setValue(row.id, e.target.value)}
                              />
                            </Field>
                          ))}
                        </div>
                      ) : (
                        <dl className="lra-kv is-review">
                          {section.rows.map((row) => (
                            <div
                              key={row.id}
                              className={
                                "lra-cq-answer" +
                                (compare && isExceptional(row) ? " is-flagged" : "")
                              }
                            >
                              <dt>{row.label}</dt>
                              <dd>
                                {values[row.id] || "–"}
                                {compare && priorHint(row) && (
                                  <span className="lra-cq-prior">{priorHint(row)}</span>
                                )}
                              </dd>
                            </div>
                          ))}
                        </dl>
                      )}
                    </Section>
                  );
                })}
              </div>
            </>
          )}

          {/* Who signs it, and whether it can go out through JPOI */}
          <Section title="Signers & platform">
            <div className="lra-cq-stack">
              <div className="lra-radios" role="radiogroup" aria-label="Signing mode">
                {CQ_SIGNING_MODES.map((m) => (
                  <label key={m.id} className="lra-radio">
                    <input
                      type="radio"
                      name={`${uid}-signing`}
                      checked={mode.id === m.id}
                      onChange={() => update({ signingMode: m.id, signers: [] })}
                    />
                    {m.label}
                  </label>
                ))}
              </div>

              <p className="lra-section-intro">
                {mode.signers} signer{mode.signers === 1 ? "" : "s"} · {mode.note}.
              </p>

              <Field label="Add a signer" id={`${uid}-signer`}>
                <Dropdown
                  id={`${uid}-signer`}
                  value=""
                  onChange={addSigner}
                  placeholder="Search signers…"
                  options={CQ_SIGNERS.filter((s) => !signers.includes(s.id)).map((s) => ({
                    value: s.id,
                    label: `${s.name} · ECI ${s.eci}`,
                  }))}
                />
              </Field>

              {signers.length > 0 && (
                <div className="lra-table-wrap">
                  <table className="lra-table">
                    <thead>
                      <tr>
                        <th scope="col">Signer</th>
                        <th scope="col">ECI</th>
                        <th scope="col">Platform</th>
                        <th scope="col">JPOI eligibility</th>
                        <th scope="col">
                          <span className="lra-sr">Remove</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {signers.map((id) => {
                        const s = CQ_SIGNERS.find((x) => x.id === id);
                        return (
                          <tr key={id}>
                            <th scope="row">{s.name}</th>
                            <td>{s.eci}</td>
                            <td>{s.platform}</td>
                            <td>
                              <span className={"lra-pill " + (s.jpoi ? "is-good" : "is-neutral")}>
                                {s.jpoi ? "JPOI eligible" : "Not JPOI eligible"}
                              </span>
                            </td>
                            <td>
                              <button
                                type="button"
                                className="lra-icon-btn"
                                aria-label={`Remove ${s.name}`}
                                onClick={() => removeSigner(id)}
                              >
                                <Icon name="delete" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Short of signers is worth saying, not worth blocking on */}
              {short > 0 && (
                <p className="lra-field-hint">
                  {mode.label} usually takes {mode.signers} signer
                  {mode.signers === 1 ? "" : "s"} — {short} still to add.
                </p>
              )}

              <div className="lra-build-actions">
                <button type="button" className="lra-btn is-secondary">
                  Save signers
                </button>
              </div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
