import { useId, useState } from "react";
import { CLIENTS, FACILITIES, ROLES } from "./data";
import { builderFor } from "./rules";
import { Banner, Field, Icon, Section } from "./ui";
import Dropdown from "./dropdown";
import FacilityCard from "./FacilityCard";

/* Step 1 — Client & facility: the parties, what they already have, and how
   this request starts: an action on an existing facility, or a new deal.
   Building an SBL deal goes straight on to Loan details. */

export default function StepClient({ deal, update, addParty, onBuildSbl }) {
  const uid = useId();
  const [clientId, setClientId] = useState("");
  const [role, setRole] = useState("");

  const canAdd =
    clientId &&
    role &&
    !deal.loading &&
    !deal.parties.some((p) => p.id === clientId && p.role === role);

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
          {/* Existing facilities — choosing an action fills Loan details
              with the facility's current terms */}
          <Section title="Existing facilities">
            <div className="lra-facilities lra-fac-grid">
              {FACILITIES.map((fac) => (
                <FacilityCard
                  key={fac.id}
                  fac={fac}
                  selected={deal.facilityId === fac.id}
                  action={deal.facilityAction}
                  onAction={(a, on) =>
                    update((d) =>
                      on
                        ? { facilityId: null, facilityAction: null }
                        : {
                            facilityId: fac.id,
                            facilityAction: a,
                            build: null,
                            ...(fac.kind === "sbl" && d.facilityId !== fac.id ? builderFor(fac) : {}),
                          }
                    )
                  }
                />
              ))}
            </div>
          </Section>

          {/* Build a new deal */}
          <Section title="Build a new deal">
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
              <Banner>
                Tailored (Custom) deals are captured in the Custom intake — outside this prototype.
              </Banner>
            )}
          </Section>
        </>
      )}
    </div>
  );
}
