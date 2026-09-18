import { useEffect, useRef, useState } from "react";
import { REGIONS, STEPS, TICKET } from "./data";
import { assess, emptyDeal } from "./rules";
import StepClient from "./StepClient";
import StepReview from "./StepReview";
import Submission from "./Submission";
import { Icon, Toggle } from "./ui";
import { ScaledFrame } from "./frame";
import "./Lra.css";

/* Loan Request App prototype — the origination wizard, by region, built
   with Material 3 components.

   A row of preview chips switches between the regional variants. EMEA and EMEA – GVA share the EMEA flow; APAC – Pilot and
   APAC – GA share the APAC flow, with GA adding its compliance gates; USPB
   is still a work in progress. All data is mocked (see ./data.js). */

export default function LraPrototype({ title = "Loan request prototype" }) {
  const [regionId, setRegionId] = useState(REGIONS[0].id);
  const [step, setStep] = useState(0); // 0, 1, 2, or "done"
  const [deal, setDeal] = useState(emptyDeal);
  const timer = useRef(null);
  const bodyRef = useRef(null);

  const region = REGIONS.find((r) => r.id === regionId);
  const verdict = assess(deal, region);

  const update = (patch) =>
    setDeal((d) => ({ ...d, ...(typeof patch === "function" ? patch(d) : patch) }));
  const setField = (key, value) => update((d) => ({ fields: { ...d.fields, [key]: value } }));

  function reset() {
    clearTimeout(timer.current);
    setDeal(emptyDeal());
    setStep(0);
  }

  // Adding a party looks the client up first — a short, cancellable load
  function addParty(party) {
    update({ loading: true });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      update((d) => ({ parties: [...d.parties, party], loading: false }));
    }, 1000);
  }

  useEffect(() => () => clearTimeout(timer.current), []);

  // Each step starts at the top of the window
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [step, regionId]);

  const inWizard = region.flow !== "wip" && step !== "done";
  const firstParty = deal.parties[0];

  return (
    <div className="lra" aria-label={title} role="region">
      {/* Preview — the black toggle switches region variants */}
      <Toggle
        label="Preview"
        value={regionId}
        onChange={(id) => {
          setRegionId(id);
          reset();
        }}
        options={REGIONS.map((r) => ({ id: r.id, label: r.label }))}
      />

      <ScaledFrame title="Loan Request App" path={`/lending/loan-request/new?region=${regionId}`}>
        <div className="lra-window">
          {/* Top app bar */}
          <div className="lra-appbar">
            <span className="lra-icon-btn" aria-hidden="true">
              <Icon name="close" />
            </span>
            <span className="lra-appbar-title">New loan request</span>
            <span className="lra-icon-btn" aria-hidden="true">
              <Icon name="moreVert" />
            </span>
          </div>

          {region.flow === "wip" ? (
            <div className="lra-body lra-wip" ref={bodyRef}>
              <span className="lra-wip-icon">
                <Icon name="hourglass" size={32} />
              </span>
              <h4>USPB — Work in progress</h4>
              <p>This version hasn't been built yet.</p>
            </div>
          ) : (
            <>
              {/* Header: stepper, and the summary bar once past step 1 */}
              {step !== "done" && (
                <div className="lra-head">
                  <ol className="lra-stepper">
                    {STEPS.map((label, i) => (
                      <li
                        key={label}
                        className={i === step ? "is-current" : i < step ? "is-done" : ""}
                        aria-current={i === step ? "step" : undefined}
                      >
                        <span className="lra-step-num" aria-hidden="true">
                          {i < step ? <Icon name="check" size={16} /> : i + 1}
                        </span>
                        <span className="lra-step-label">{label}</span>
                      </li>
                    ))}
                  </ol>
                  {(step === 1 || step === 2) && firstParty && (
                    <dl className="lra-summary">
                      <div>
                        <dt>Client name</dt>
                        <dd className="is-caps">{firstParty.name}</dd>
                      </div>
                      <div>
                        <dt>ECI</dt>
                        <dd>{firstParty.eci}</dd>
                      </div>
                      <div>
                        <dt>Account number</dt>
                        <dd>{TICKET.account}</dd>
                      </div>
                      <div>
                        <dt>Account type</dt>
                        <dd>–</dd>
                      </div>
                      <div>
                        <dt>Loan request</dt>
                        <dd>{TICKET.number}</dd>
                      </div>
                      <div>
                        <dt>Owner</dt>
                        <dd className="is-caps">{TICKET.owner}</dd>
                      </div>
                      <div>
                        <dt>Status</dt>
                        <dd>
                          <span className="lra-pill is-neutral">{TICKET.status}</span>
                        </dd>
                      </div>
                      <div className="lra-summary-links">
                        <span>Comments (0)</span>
                        <span>Documents ({deal.crfUploaded ? 1 : 0})</span>
                      </div>
                    </dl>
                  )}
                </div>
              )}

              <div className="lra-body" ref={bodyRef}>
                {step === 0 && (
                  <StepClient
                    key={regionId}
                    deal={deal}
                    update={update}
                    setField={setField}
                    addParty={addParty}
                    verdict={verdict}
                    region={region}
                  />
                )}
                {(step === 1 || step === 2) && <StepReview deal={deal} final={step === 2} />}
                {step === "done" && <Submission deal={deal} onRestart={reset} />}
              </div>

              {inWizard && (
                <div className="lra-footer">
                  <p className="lra-footer-status" aria-live="polite">
                    {step === 0 && !verdict.canContinue
                      ? `To continue: ${verdict.reasons[0]}`
                      : ""}
                  </p>
                  <div className="lra-footer-btns">
                    {step === 0 && region.flow === "emea" && (
                      <button type="button" className="lra-btn is-ghost" onClick={reset}>
                        Abandon
                      </button>
                    )}
                    {step > 0 && (
                      <button type="button" className="lra-btn is-secondary" onClick={() => setStep(step - 1)}>
                        Back
                      </button>
                    )}
                    <button
                      type="button"
                      className="lra-btn is-primary"
                      disabled={step === 0 && !verdict.canContinue}
                      onClick={() => setStep(step === 2 ? "done" : step + 1)}
                    >
                      {step === 0
                        ? region.flow === "emea"
                          ? "Save and continue"
                          : "Save & continue"
                        : "Continue"}
                    </button>
                  </div>
                </div>
              )}

              {/* APAC – GA: CDS on FX/OTC needs an ISDA agreement — shown as a snackbar */}
              {step === 0 && verdict.showCds && (
                <div className="lra-snackbar" role="alert">
                  <p>
                    CDS transactions require an ISDA agreement. Consult a member of the SBL team before
                    proceeding.
                  </p>
                  <button
                    type="button"
                    className="lra-icon-btn"
                    aria-label="Dismiss"
                    onClick={() => update({ cdsDismissed: true })}
                  >
                    <Icon name="close" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </ScaledFrame>
    </div>
  );
}
