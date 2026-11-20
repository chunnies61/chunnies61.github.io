import { useId, useState } from "react";
import {
  CQ_SIGNERS,
  CQ_SIGNING_MODES,
  CUSTOM_FACILITY_TYPES,
  CUSTOM_RISK_MAX,
  CUSTOM_TEAMS,
  DOCUMENTS,
  ROLES,
} from "./data";
import { hasCrf, money, num } from "./rules";
import { Banner, Field, Icon, Section } from "./ui";
import Dropdown from "./dropdown";

/* The tailored (Custom) deal. A request that doesn't fit the streamlined shape goes to Credit's
   Custom intake, so it asks for less structure and more explanation:

   - on Client & facility, four fields start it (CustomDealFields);
   - Loan details (CustomDetails) states the facility, the risk and mitigants, the clients'
     financial data, the documents and who signs;
   - Loan review (CustomReview) reads it all back.

   Required fields are the line size, a team comment, a team and the risk & mitigants; they
   explain themselves once the visitor tries to continue. Documents and signers only hint. */

const patch = (update, p) => update((d) => ({ custom: { ...d.custom, ...p } }));

/* --- Client & facility: the four fields that start a Custom deal ------------------- */

export function CustomDealFields({ deal, update, tried, missing }) {
  const uid = useId();
  const c = deal.custom;
  const show = tried;
  return (
    <div className="lra-custom-start">
      <p className="lra-section-intro">
        Tailored (Custom) deals are structured with Credit in the Custom intake. Start it here; the
        details follow in the next step.
      </p>
      <div className="lra-grid">
        <Field label="Facility type" id={`${uid}-type`} required>
          <Dropdown
            id={`${uid}-type`}
            value={c.facilityType}
            onChange={(v) => patch(update, { facilityType: v })}
            options={CUSTOM_FACILITY_TYPES}
          />
        </Field>
        <Field
          label="Line size"
          id={`${uid}-line`}
          required
          error={show && missing.lineSize ? "Enter a line size greater than 0." : undefined}
        >
          <div className="lra-money">
            <input
              id={`${uid}-line`}
              inputMode="decimal"
              placeholder="0.00"
              value={c.lineSize}
              aria-required="true"
              aria-invalid={Boolean(show && missing.lineSize)}
              onChange={(e) => patch(update, { lineSize: e.target.value })}
              onBlur={(e) => num(e.target.value) > 0 && patch(update, { lineSize: money(e.target.value) })}
            />
            <span className="lra-money-ccy">{deal.currency}</span>
          </div>
        </Field>
        <Field
          label="Team assignment"
          id={`${uid}-team`}
          required
          error={show && missing.team ? "Assign a team." : undefined}
        >
          <Dropdown
            id={`${uid}-team`}
            value={c.team}
            onChange={(v) => patch(update, { team: v })}
            placeholder="Select a team…"
            options={CUSTOM_TEAMS}
          />
        </Field>
      </div>
      <Field
        label="Team comment"
        id={`${uid}-comment`}
        required
        error={show && missing.teamComment ? "Add a comment for the team." : undefined}
        hint="What the team needs to know to pick this up."
      >
        <textarea
          id={`${uid}-comment`}
          rows={3}
          value={c.teamComment}
          aria-required="true"
          aria-invalid={Boolean(show && missing.teamComment)}
          placeholder="e.g. Bridge facility against a pending property sale; client wants terms this week…"
          onChange={(e) => patch(update, { teamComment: e.target.value })}
        />
      </Field>
    </div>
  );
}

/* --- Loan details ------------------------------------------------------------------- */

export function CustomDetails({ deal, update, verdict, tried, onEdit }) {
  const uid = useId();
  const c = deal.custom;
  const [editingClients, setEditingClients] = useState(false);
  const [over, setOver] = useState(false);
  const riskLeft = CUSTOM_RISK_MAX - c.risk.length;
  const mode = CQ_SIGNING_MODES.find((m) => m.id === (deal.signingMode ?? "single"));
  const signers = deal.signers ?? [];
  const short = mode.signers - signers.length;
  const nextDoc = DOCUMENTS.find((doc) => !deal.documents.some((x) => x.id === doc.id));
  const addDocument = () => nextDoc && update((d) => ({ documents: [...d.documents, nextDoc] }));

  return (
    <div className="lra-step">
      <Banner>
        <strong>Tailored (Custom) deal.</strong> This request goes to Credit's Custom intake, so it
        needs the story behind the numbers.
      </Banner>

      {/* Read-only here: it was set on the first step */}
      <Section
        title="Facility details"
        aside={
          <button type="button" className="lra-btn is-ghost" onClick={() => onEdit(0)}>
            Change on Client & facility
          </button>
        }
      >
        <dl className="lra-kv is-review">
          <div>
            <dt>Facility type</dt>
            <dd>{c.facilityType}</dd>
          </div>
          <div>
            <dt>Line size</dt>
            <dd>{num(c.lineSize) > 0 ? money(c.lineSize, deal.currency) : "–"}</dd>
          </div>
          <div>
            <dt>Team</dt>
            <dd>{c.team || "–"}</dd>
          </div>
        </dl>
      </Section>

      <Section title="Risk & mitigants" aside={<span className="lra-muted">* Required</span>}>
        <Field
          label="Risk & mitigants"
          id={`${uid}-risk`}
          required
          error={tried && verdict.customMissing.risk ? "Enter the risk & mitigants to continue." : undefined}
          hint={`${riskLeft.toLocaleString("en-US")} characters left`}
        >
          <textarea
            id={`${uid}-risk`}
            rows={5}
            maxLength={CUSTOM_RISK_MAX}
            value={c.risk}
            aria-required="true"
            aria-invalid={Boolean(tried && verdict.customMissing.risk)}
            placeholder="What could go wrong with this deal, and what protects the bank if it does…"
            onChange={(e) => patch(update, { risk: e.target.value })}
          />
        </Field>
      </Section>

      <Section
        title="Client financial data"
        aside={
          <button type="button" className="lra-btn is-secondary" onClick={() => setEditingClients((v) => !v)}>
            {editingClients ? "Done" : "Edit"}
          </button>
        }
      >
        {deal.parties.length ? (
          <div className="lra-table-wrap">
            <table className="lra-table">
              <thead>
                <tr>
                  <th scope="col">Client name</th>
                  <th scope="col">ECI</th>
                  <th scope="col">Platform</th>
                  <th scope="col">KYC status</th>
                  <th scope="col">Role</th>
                </tr>
              </thead>
              <tbody>
                {deal.parties.map((p, i) => (
                  <tr key={`${p.id}-${p.role}`}>
                    <th scope="row">{p.name}</th>
                    <td>{p.eci}</td>
                    <td>{p.platform}</td>
                    <td>
                      <span className="lra-pill is-good">{p.kyc}</span>
                    </td>
                    <td>
                      {editingClients ? (
                        <Dropdown
                          compact
                          value={p.role}
                          onChange={(v) =>
                            update((d) => ({ parties: d.parties.map((q, j) => (j === i ? { ...q, role: v } : q)) }))
                          }
                          options={ROLES}
                        />
                      ) : (
                        p.role
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="lra-muted">No parties added yet — add them on Client & facility.</p>
        )}
      </Section>

      <Section title="Documents">
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
                <button
                  type="button"
                  className="lra-icon-btn"
                  aria-label={`Download ${doc.name}`}
                  onClick={() => {}}
                >
                  <Icon name="download" size={20} />
                </button>
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
          <p className="lra-field-hint">The Credit Request Form is mandatory for a Custom deal — attach it before submitting.</p>
        )}
      </Section>

      <Section title="Signers & platform">
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
            onChange={(id) => update((d) => ((d.signers ?? []).includes(id) ? {} : { signers: [...(d.signers ?? []), id] }))}
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
                          onClick={() => update((d) => ({ signers: (d.signers ?? []).filter((x) => x !== id) }))}
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
        {short > 0 && (
          <p className="lra-field-hint">
            {mode.label} usually takes {mode.signers} signer{mode.signers === 1 ? "" : "s"} — {short} still to add.
          </p>
        )}
      </Section>
    </div>
  );
}

/* --- Loan review ---------------------------------------------------------------------- */

export function CustomReview({ deal, onEdit }) {
  const c = deal.custom;
  const signers = (deal.signers ?? []).map((id) => CQ_SIGNERS.find((s) => s.id === id)).filter(Boolean);
  const edit = (step) => (
    <button type="button" className="lra-btn is-ghost lra-review-edit" onClick={() => onEdit(step)}>
      Edit
    </button>
  );
  return (
    <div className="lra-step">
      <Banner>
        <strong>Tailored (Custom) deal.</strong> Credit's Custom intake picks this up once it is submitted.
      </Banner>

      <Section title="Facility" aside={edit(0)}>
        <dl className="lra-kv is-review">
          <div>
            <dt>Facility type</dt>
            <dd>{c.facilityType}</dd>
          </div>
          <div>
            <dt>Line size</dt>
            <dd>{num(c.lineSize) > 0 ? money(c.lineSize, deal.currency) : "–"}</dd>
          </div>
          <div>
            <dt>Team</dt>
            <dd>{c.team || "–"}</dd>
          </div>
          <div>
            <dt>Team comment</dt>
            <dd>{c.teamComment || "–"}</dd>
          </div>
        </dl>
      </Section>

      <Section title="Risk & mitigants" aside={edit(1)}>
        <p className="lra-review-text">{c.risk || <span className="lra-muted">Not entered yet.</span>}</p>
      </Section>

      <Section title="Parties" aside={edit(0)}>
        {deal.parties.length ? (
          <div className="lra-table-wrap">
            <table className="lra-table">
              <thead>
                <tr>
                  <th scope="col">Client name</th>
                  <th scope="col">ECI</th>
                  <th scope="col">Platform</th>
                  <th scope="col">Role</th>
                </tr>
              </thead>
              <tbody>
                {deal.parties.map((p) => (
                  <tr key={`${p.id}-${p.role}`}>
                    <th scope="row">{p.name}</th>
                    <td>{p.eci}</td>
                    <td>{p.platform}</td>
                    <td>{p.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="lra-muted">No parties added.</p>
        )}
      </Section>

      <Section title="Documents & signers" aside={edit(1)}>
        <dl className="lra-kv is-review">
          <div>
            <dt>Documents</dt>
            <dd>{deal.documents.length ? deal.documents.map((d) => d.name).join(", ") : "None attached"}</dd>
          </div>
          <div>
            <dt>Credit Request Form</dt>
            <dd>{hasCrf(deal) ? "Attached" : "Credit will ask for it"}</dd>
          </div>
          <div>
            <dt>Signers</dt>
            <dd>{signers.length ? signers.map((s) => s.name).join(", ") : "None added"}</dd>
          </div>
        </dl>
      </Section>
    </div>
  );
}
