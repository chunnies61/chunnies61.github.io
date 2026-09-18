import { useId } from "react";
import { Banner, Icon } from "../lra/ui";
import { APPROVALS, COLLATERALS, HOST_ACCOUNTS, RISK_COMMENT, RULES, TICKET } from "./data";
import { Accordion, Field, InfoCard, PartiesTable, RiskComment, Section, Select, clientOf, money } from "./parts";

/* The steps every variant shares once a deal is picked: Loan details,
   Review and the submitted ticket. */

const PROCEEDS = "General Liquidity, to include the purchase of margin securities.";

export function detailsOf(deal, offer) {
  return {
    facility: offer.facility,
    lineSize: money(offer.lineSize, offer.currency),
    pricingType: "Standard",
    tenor: "48",
    rateType: "Variable",
    multiCcy: "No",
    owner: "Stephen Green (F123456)",
    sendTo: "Front Office",
    partners: ["Edward Sharp", "Kevin McDonald"],
    docsDate: "2026-10-15",
    proceeds: PROCEEDS,
    ...deal.details,
  };
}

const approvalOf = (deal, key) => deal.approvals?.[key] ?? { done: false, response: "" };

function DetailCards({ d, save, readOnly }) {
  const uid = useId();
  const edit = (fn) => (readOnly ? undefined : fn);
  return (
    <div className="vp-cards">
      <InfoCard
        title="Facility details"
        values={d}
        onSave={save}
        rows={[
          ["Facility", d.facility],
          ["Line size", d.lineSize],
        ]}
        renderEdit={edit((v, set) => (
          <>
            <Field label="Facility" id={`${uid}-fac`}>
              <input id={`${uid}-fac`} value={v.facility} onChange={(e) => set({ facility: e.target.value })} />
            </Field>
            <Field label="Line size" id={`${uid}-line`}>
              <input id={`${uid}-line`} value={v.lineSize} onChange={(e) => set({ lineSize: e.target.value })} />
            </Field>
          </>
        ))}
      />
      <InfoCard
        title="Pricing"
        values={d}
        onSave={save}
        rows={[
          ["Pricing type", d.pricingType],
          ["Tenor", `${d.tenor} months`],
          ["Interest rate type", d.rateType],
        ]}
        renderEdit={edit((v, set) => (
          <>
            <fieldset className="vp-yesno vp-span">
              <legend>Pricing type</legend>
              <div className="lra-radios">
                {["Standard", "Exception"].map((t) => (
                  <label key={t} className="lra-radio">
                    <input
                      type="radio"
                      name={`${uid}-pt`}
                      checked={v.pricingType === t}
                      onChange={() => set({ pricingType: t })}
                    />
                    {t}
                  </label>
                ))}
              </div>
            </fieldset>
            <Field label="Tenor (months)" id={`${uid}-tenor`}>
              <input
                id={`${uid}-tenor`}
                inputMode="numeric"
                value={v.tenor}
                onChange={(e) => set({ tenor: e.target.value })}
              />
            </Field>
            <Field label="Interest rate type" id={`${uid}-rt`}>
              <Select id={`${uid}-rt`} value={v.rateType} onChange={(x) => set({ rateType: x })} options={["Variable", "Fixed"]} />
            </Field>
          </>
        ))}
      />
      <InfoCard
        title="Loan details"
        values={d}
        onSave={save}
        rows={[["Ability to borrow multi-currency", d.multiCcy]]}
        renderEdit={edit((v, set) => (
          <fieldset className="vp-yesno vp-span">
            <legend>Ability to borrow multi-currency</legend>
            <div className="lra-radios">
              {["Yes", "No"].map((t) => (
                <label key={t} className="lra-radio">
                  <input
                    type="radio"
                    name={`${uid}-mc`}
                    checked={v.multiCcy === t}
                    onChange={() => set({ multiCcy: t })}
                  />
                  {t}
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      />
      <InfoCard
        title="Loan document & details"
        values={d}
        onSave={save}
        rows={[
          ["Opportunity owner", d.owner],
          ["Send documents to", d.sendTo],
          [
            "Front office partners",
            <span className="vp-chips" key="p">
              {d.partners.map((p) => (
                <span key={p} className="vp-input-chip">
                  {p}
                </span>
              ))}
            </span>,
          ],
          ["Documents required date", d.docsDate],
          ["Use of proceeds", d.proceeds],
        ]}
        renderEdit={edit((v, set) => (
          <>
            <Field label="Send documents to" id={`${uid}-send`}>
              <Select
                id={`${uid}-send`}
                value={v.sendTo}
                onChange={(x) => set({ sendTo: x })}
                options={["Front Office", "Client directly"]}
              />
            </Field>
            <Field label="Documents required date" id={`${uid}-date`}>
              <input id={`${uid}-date`} type="date" value={v.docsDate} onChange={(e) => set({ docsDate: e.target.value })} />
            </Field>
            <Field label="Use of proceeds" id={`${uid}-use`} className="vp-span">
              <textarea id={`${uid}-use`} rows={2} value={v.proceeds} onChange={(e) => set({ proceeds: e.target.value })} />
            </Field>
          </>
        ))}
      />
    </div>
  );
}

function Approvals({ deal, update, readOnly }) {
  const uid = useId();
  const setA = (key, patch) =>
    update((dl) => ({ approvals: { ...dl.approvals, [key]: { ...approvalOf(dl, key), ...patch } } }));
  return (
    <div className="vp-accordions">
      {APPROVALS.map((a) => {
        const st = approvalOf(deal, a.key);
        return (
          <Accordion key={a.key} title={a.title} status={st.done ? "Complete" : "Action required"}>
            <RiskComment author={RISK_COMMENT.author} when={RISK_COMMENT.when} text={a.comment} />
            {readOnly ? (
              st.response && <p className="vp-response">{st.response}</p>
            ) : (
              <>
                <Field label="Your response" id={`${uid}-${a.key}`} className="vp-field-top">
                  <textarea
                    id={`${uid}-${a.key}`}
                    rows={2}
                    value={st.response}
                    onChange={(e) => setA(a.key, { response: e.target.value })}
                  />
                </Field>
                <button
                  type="button"
                  className={"lra-btn " + (st.done ? "is-secondary" : "is-tonal")}
                  onClick={() => setA(a.key, { done: !st.done })}
                >
                  {!st.done && <Icon name="check" size={18} />}
                  {st.done ? "Reopen" : "Mark complete"}
                </button>
              </>
            )}
          </Accordion>
        );
      })}
    </div>
  );
}

export function LoanDetails({ deal, update, offer }) {
  const d = detailsOf(deal, offer);
  const save = (draft) => update((dl) => ({ details: { ...dl.details, ...draft } }));

  if (offer.kind === "dm") {
    return (
      <div className="lra-step">
        <Section title="Facility & terms">
          <DetailCards d={d} save={save} />
        </Section>
        <Section title="Risk analysis & indicative grading">
          <dl className="lra-kv is-review vp-card">
            <div>
              <dt>Calculated FBI</dt>
              <dd>{offer.fbi}/20</dd>
            </div>
            <div>
              <dt>Indicative grade</dt>
              <dd>{offer.fbi >= 16 ? "5 – Strong" : offer.fbi >= 12 ? "4 – Good" : "3 – Fair"}</dd>
            </div>
            <div>
              <dt>Underwriting team</dt>
              <dd>{offer.team}</dd>
            </div>
          </dl>
        </Section>
        <Section title="Approval to pitch" sub="Answer each risk-officer comment, then mark the section complete.">
          <Approvals deal={deal} update={update} />
        </Section>
      </div>
    );
  }

  return (
    <div className="lra-step">
      <DetailCards d={d} save={save} />
      <button
        type="button"
        className={"lra-btn vp-signers " + (deal.signersDone ? "is-toggle is-on" : "is-tonal")}
        aria-pressed={Boolean(deal.signersDone)}
        onClick={() => update((dl) => ({ signersDone: !dl.signersDone }))}
      >
        {deal.signersDone && <Icon name="check" size={18} />}
        {deal.signersDone ? "Delivery and signers complete" : "Complete delivery and signers"}
      </button>
    </div>
  );
}

export function Review({ deal, update, offer }) {
  const d = detailsOf(deal, offer);
  const collaterals = COLLATERALS.filter((c) => offer.collateral.includes(c.acct));
  const host = HOST_ACCOUNTS.find((h) => h.acct === offer.host);

  return (
    <div className="lra-step">
      <Banner>Check everything below — continuing submits the loan request.</Banner>
      <Section title="Parties">
        <PartiesTable parties={deal.parties} readOnly />
      </Section>

      {offer.kind === "offer" ? (
        <Section title={deal.b.open ? "Build your own deal" : "Collateral & host account"}>
          {collaterals.length > 0 && (
            <div className="lra-table-wrap">
              <table className="lra-table">
                <thead>
                  <tr>
                    <th scope="col">Collateral account #</th>
                    <th scope="col">Owner(s)</th>
                    <th scope="col" className="is-num">
                      Market value
                    </th>
                    <th scope="col">Standard LV</th>
                  </tr>
                </thead>
                <tbody>
                  {collaterals.map((c) => (
                    <tr key={c.acct}>
                      <th scope="row">{c.acct}</th>
                      <td>{c.owners}</td>
                      <td className="is-num">{money(c.mv, deal.b.ccy[c.acct] ?? c.ccy)}</td>
                      <td>{c.std}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="lra-table-wrap">
            <table className="lra-table">
              <thead>
                <tr>
                  <th scope="col">Host account #</th>
                  <th scope="col">Internal #</th>
                  <th scope="col">Owner(s)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">{host?.acct ?? "New host account"}</th>
                  <td>{host?.internal ?? "–"}</td>
                  <td>{host?.owner ?? clientOf(deal.parties[0]?.id)?.name ?? "–"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>
      ) : (
        <Section title="Selected deal">
          <dl className="lra-kv is-review vp-card">
            <div>
              <dt>Product</dt>
              <dd>{offer.product}</dd>
            </div>
            <div>
              <dt>Rate</dt>
              <dd>{offer.rate}</dd>
            </div>
            <div>
              <dt>Collateral</dt>
              <dd>{offer.collateral.length ? offer.collateral.join("; ") : "–"}</dd>
            </div>
            <div>
              <dt>Borrowers</dt>
              <dd>{offer.borrowers}</dd>
            </div>
          </dl>
        </Section>
      )}

      <Section title="Loan details">
        <DetailCards d={d} readOnly />
      </Section>

      {offer.kind === "dm" && (
        <Section title="Approval to pitch">
          <Approvals deal={deal} update={update} readOnly />
        </Section>
      )}
    </div>
  );
}

export function Submission({ deal, offer }) {
  const d = detailsOf(deal, offer);
  const borrower =
    clientOf(deal.parties.find((p) => p.role === "Primary borrower")?.id ?? deal.parties[0]?.id)?.name ?? "–";

  return (
    <div className="lra-step">
      <Banner tone="success">
        Loan origination request has been successfully submitted. You can view and share ticket
        information.
      </Banner>
      <Banner>
        Loan pricing entry was unable to be generated. The pricing request will be completed in
        Underwriting.
      </Banner>

      <article className="lra-ticket">
        <h4>Loan request # {TICKET.number}</h4>
        <dl className="lra-kv is-review">
          {[
            ["Primary borrower", borrower],
            ["Ticket number", TICKET.number],
            ["Facility", d.facility],
            ["Line size", d.lineSize],
            ["Collateral", offer.collateral.length ? offer.collateral.join("; ") : "–"],
            ["Base rate", "Enhanced Reference Rate: SOFR"],
            ["Pricing", d.pricingType],
          ].map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </article>

      <details className="lra-rules" open>
        <summary>
          Detailed results
          <Icon name="expand" />
        </summary>
        <div className="lra-table-wrap">
          <table className="lra-table">
            <thead>
              <tr>
                <th scope="col">Rule ID – Rule name</th>
                <th scope="col">Result</th>
                <th scope="col">Comments</th>
              </tr>
            </thead>
            <tbody>
              {RULES.map(([id, name, comment]) => (
                <tr key={id}>
                  <th scope="row">
                    {id} – {name}
                  </th>
                  <td>
                    <span className="lra-pill is-good">Pass</span>
                  </td>
                  <td>{comment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
