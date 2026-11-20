import { useId, useState } from "react";
import {
  CLIENTS,
  CLIENT_SEARCH_PLACEHOLDER,
  FACILITIES,
  FACILITIES_TOOLTIP,
  ROLES,
} from "./data";
import { amendFor, builderFor } from "./rules";
import { CustomDealFields } from "./StepCustom";
import { Banner, Field, Icon, Section } from "./ui";
import Dropdown from "./dropdown";
import FacilityCard from "./FacilityCard";

/* Step 1 — Client & facility: the parties, what they already have, and how
   this request starts: an action on an existing facility, or a new deal.
   Building an SBL deal goes straight on to Loan details. */

export default function StepClient({ deal, update, addParty, onBuildSbl, onAnnualReview, tried, verdict }) {
  const uid = useId();
  const ccy = deal.currency;
  const [clientId, setClientId] = useState("");
  const [role, setRole] = useState("");

  /* A client can be found and still be blocked — outside the jurisdiction, or
     an employee on a platform that can't submit. The block is explained
     inline and keeps Add party disabled. */
  const client = CLIENTS.find((c) => c.id === clientId);
  const canAdd =
    clientId &&
    role &&
    !client?.error &&
    !deal.loading &&
    !deal.parties.some((p) => p.id === clientId && p.role === role);

  return (
    <div className="lra-step">
      {/* Party search */}
      <Section title="Add parties">
        <p className="lra-section-intro">Add a party to see the client's facilities and build a new deal.</p>
        <div className="lra-party-row">
          <Field label="Search clients" id={`${uid}-client`}>
            <Dropdown
              id={`${uid}-client`}
              value={clientId}
              onChange={setClientId}
              placeholder={CLIENT_SEARCH_PLACEHOLDER}
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

        {client?.error && <Banner tone="warning">{client.error}</Banner>}

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
                  <th scope="col">Client name</th>
                  <th scope="col">ECI</th>
                  <th scope="col">Employee indicator</th>
                  <th scope="col">UCN</th>
                  <th scope="col">Account #</th>
                  <th scope="col">Platform</th>
                  <th scope="col">KYC status</th>
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
                    <td>{p.account}</td>
                    <td>{p.platform}</td>
                    <td>
                      <span className="lra-pill is-good">{p.kyc}</span>
                    </td>
                    <td>
                      {/* Role stays editable in the row — the common fix is a
                          party added under the wrong one */}
                      <Dropdown
                        compact
                        value={p.role}
                        onChange={(v) =>
                          update((d) => ({
                            parties: d.parties.map((q, j) => (j === i ? { ...q, role: v } : q)),
                          }))
                        }
                        options={ROLES}
                      />
                    </td>
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
          {/* Existing facilities — choosing an action fills Loan details
              with the facility's current terms */}
          <Section
            title="Existing facilities"
            aside={
              <span className="lra-info">
                <button
                  type="button"
                  className="lra-info-btn"
                  aria-label="About existing facilities"
                  aria-describedby={`${uid}-fac-tip`}
                >
                  <Icon name="info" size={18} />
                </button>
                <span className="lra-tip" role="tooltip" id={`${uid}-fac-tip`}>
                  {FACILITIES_TOOLTIP}
                </span>
              </span>
            }
          >
            <div className="lra-facilities lra-fac-grid">
              {FACILITIES.map((fac) => (
                <FacilityCard
                  key={fac.id}
                  fac={fac}
                  currency={ccy}
                  selected={deal.facilityId === fac.id}
                  action={deal.facilityAction}
                  onAction={(a, on) => {
                    // An annual review runs in its own dialog rather than as a step
                    if (a === "Annual review") return onAnnualReview(fac);
                    /* Amend and Replace are parked for now: the buttons are there and clickable, but
                       nothing happens. The Amend flow is built (StepAmend.jsx, flowOf in rules.js) and
                       switches back on by removing this line. */
                    if (a === "Amend" || a === "Replace") return undefined;
                    update((d) =>
                      on
                        ? { facilityId: null, facilityAction: null, amend: null }
                        : {
                            facilityId: fac.id,
                            facilityAction: a,
                            build: null,
                            amend: a === "Amend" ? amendFor() : null,
                            ...(fac.kind === "sbl" && d.facilityId !== fac.id ? builderFor(fac, ccy) : {}),
                          }
                    );
                  }}
                />
              ))}
            </div>
          </Section>

          {/* The two ways to build a new deal: just the buttons, with no section heading of their own */}
          <div className="lra-build">
            <div className="lra-build-actions">
              <button type="button" className="lra-btn is-primary" onClick={onBuildSbl}>
                Build your own (SBL) deal
                <Icon name="arrowForward" size={18} />
              </button>
              <button
                type="button"
                className={"lra-btn is-toggle" + (deal.build === "custom" ? " is-on" : "")}
                aria-pressed={deal.build === "custom"}
                onClick={() =>
                  update((d) => ({
                    build: d.build === "custom" ? null : "custom",
                    facilityId: null,
                    facilityAction: null,
                  }))
                }
              >
                {deal.build === "custom" && <Icon name="check" size={18} />}
                Build a tailored (Custom) deal
              </button>
            </div>
            {deal.build === "custom" && (
              <CustomDealFields deal={deal} update={update} tried={tried} missing={verdict.customMissing} />
            )}
          </div>
        </>
      )}
    </div>
  );
}
