import { useId } from "react";
import { Icon } from "../lra/ui";
import { FACILITIES, OPPORTUNITIES, OPPORTUNITY_COLLATERAL } from "./data";
import { BespokeBuilder, resolveOffer } from "./builder";
import { AddParty, Field, PartiesTable, Section, Select, clientOf, money } from "./parts";

/* Current state — today's Loan Request workflow, step 1: Client & Facility */

export const offerOf = resolveOffer;

export function blocker(deal) {
  if (!deal.parties.length) return "add at least one party";
  if (resolveOffer(deal)) return null;
  if (deal.b.open && deal.b.tab === "collateral") return "evaluate an offer, or pick one above";
  if (deal.b.open && deal.b.tab === "dm") return "select an underwriting team";
  return "select an opportunity, request an amendment, or build your own deal";
}

export function PartiesBlock({ deal, update, addParty }) {
  return (
    <>
      <AddParty parties={deal.parties} onAdd={addParty} loading={deal.loading} />
      {deal.loading && (
        <p className="lra-loading" role="status">
          <span className="lra-spinner" aria-hidden="true" />
          Loading client details…
        </p>
      )}
      {deal.parties.length > 0 && (
        <PartiesTable parties={deal.parties} onChange={(parties) => update({ parties })} />
      )}
    </>
  );
}

export default function CurrentStep({ deal, update, setB, choose, addParty }) {
  const uid = useId();
  const names = deal.parties.map((p) => clientOf(p.id).name).join(", ");

  return (
    <div className="lra-step">
      <Section title="Client & Facility" sub="Add all parties to the request.">
        <PartiesBlock deal={deal} update={update} addParty={addParty} />
      </Section>

      {deal.parties.length === 0 ? (
        <p className="lra-empty">Add a party to see lending opportunities and existing facilities.</p>
      ) : (
        <>
          <Section title="Lending opportunities" sub="Recommended for these parties, based on their portfolio.">
            <div className="vp-grid-cards">
              {OPPORTUNITIES.map((o) => {
                const on = deal.choice === `opp:${o.id}`;
                return (
                  <article key={o.id} className={"lra-facility" + (on ? " is-selected" : "")}>
                    <div className="lra-facility-top">
                      <span className="lra-pill is-blue">{o.badge}</span>
                    </div>
                    <p className="vp-card-title">{o.product}</p>
                    <dl className="lra-kv vp-kv-1">
                      <div>
                        <dt>Line size</dt>
                        <dd>
                          {money(o.lineSize)}
                          <span className="vp-note">Secured by 10,000,000.00 client investment portfolio</span>
                        </dd>
                      </div>
                      <div>
                        <dt>Rate</dt>
                        <dd>{o.rate}</dd>
                      </div>
                      <div>
                        <dt>Collateral</dt>
                        <dd>{OPPORTUNITY_COLLATERAL.join("; ")}</dd>
                      </div>
                      <div>
                        <dt>Borrowers</dt>
                        <dd>{names}</dd>
                      </div>
                    </dl>
                    <div className="lra-facility-actions">
                      <button
                        type="button"
                        className={"lra-btn is-toggle" + (on ? " is-on" : "")}
                        aria-pressed={on}
                        onClick={() => choose(on ? null : `opp:${o.id}`)}
                      >
                        {on && <Icon name="check" size={18} />}
                        {on ? "Selected" : "Select"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </Section>

          <Section title="Existing client facilities">
            <div className="lra-facilities">
              {FACILITIES.map((f) => {
                const on = deal.choice === `amend:${f.id}`;
                return (
                  <article key={f.id} className={"lra-facility" + (on ? " is-selected" : "")}>
                    <div className="lra-facility-top">
                      <span className="lra-pill is-violet">PLP</span>
                      <span className="lra-muted">Facility ID: {f.id}</span>
                    </div>
                    <dl className="lra-kv">
                      {[
                        ["Borrower", f.borrowers],
                        ["Facility", f.facility],
                        ["Rate", f.rate],
                        ["Line size", money(f.lineSize)],
                        ["Review date", f.review],
                        ["Maturity date", f.maturity],
                      ].map(([k, v]) => (
                        <div key={k}>
                          <dt>{k}</dt>
                          <dd>{v}</dd>
                        </div>
                      ))}
                    </dl>
                    <div className="lra-facility-actions">
                      <button
                        type="button"
                        className={"lra-btn " + (on ? "is-toggle is-on" : "is-secondary")}
                        aria-pressed={on}
                        onClick={() => choose(on ? null : `amend:${f.id}`)}
                      >
                        {on && <Icon name="check" size={18} />}
                        Request amendment to facility
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </Section>

          <Section
            title="Build your own deal"
            sub="If the offers above aren't suitable, select a reason why and continue to build your own deal based on specific collateral."
          >
            <div className="lra-party-row vp-build-row">
              <Field label="Reason" id={`${uid}-reason`}>
                <Select
                  id={`${uid}-reason`}
                  value={deal.b.reason}
                  onChange={(reason) => setB({ reason })}
                  options={["Collateral is unsuitable"]}
                  placeholder="Select a reason…"
                />
              </Field>
              <button
                type="button"
                className={"lra-btn " + (deal.b.open ? "is-toggle is-on" : "is-primary")}
                disabled={!deal.b.reason}
                aria-pressed={deal.b.open}
                onClick={() => setB({ open: !deal.b.open })}
              >
                {deal.b.open && <Icon name="check" size={18} />}
                Start a new loan request
              </button>
            </div>
          </Section>

          {deal.b.open && <BespokeBuilder deal={deal} setB={setB} choose={choose} />}
        </>
      )}
    </div>
  );
}
