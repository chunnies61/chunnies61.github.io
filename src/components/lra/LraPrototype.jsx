import { useEffect, useRef, useState } from "react";
import { REGIONS, STEPS } from "./data";
import { assess, emptyDeal, freshBuilder } from "./rules";
import StepClient from "./StepClient";
import StepDetails from "./StepDetails";
import StepReview from "./StepReview";
import Submission from "./Submission";
import { Icon, Toggle } from "./ui";
import { ScaledFrame } from "./frame";
import "./Lra.css";

/* Loan Request App prototype — the origination wizard, by region.

   LraFlow is one region's wizard in its browser window: Client & facility,
   Loan details, Loan review, then the submission. LraPrototype adds the
   Preview toggle that switches regions: EMEA; APAC, with its compliance
   gates; USPB is still a work in progress. The future-vision
   prototype reuses LraFlow (EMEA) as its Current state. All data is mocked
   (see ./data.js). */

export function LraFlow({ region, suffix, path }) {
  const [step, setStep] = useState(0); // 0, 1, 2, or "done"
  const [deal, setDeal] = useState(emptyDeal);
  const [tried, setTried] = useState(false); // continue was pressed while blocked
  const timer = useRef(null);
  const bodyRef = useRef(null);

  const verdict = assess(deal, region);
  const blockers = step === "done" ? [] : verdict.blockers[step];
  const blocked = blockers.length > 0;
  const hint = step === "done" ? "" : verdict.hints[step];

  const update = (patch) =>
    setDeal((d) => ({ ...d, ...(typeof patch === "function" ? patch(d) : patch) }));
  const setField = (key, value) => update((d) => ({ fields: { ...d.fields, [key]: value } }));

  function go(next) {
    setTried(false);
    setStep(next);
  }

  function reset() {
    clearTimeout(timer.current);
    setDeal(emptyDeal());
    go(0);
  }

  // "Build your own (SBL) deal" opens Loan details, fresh unless already begun
  function buildSbl() {
    update((d) =>
      d.build === "sbl"
        ? { facilityId: null, facilityAction: null }
        : { build: "sbl", facilityId: null, facilityAction: null, ...freshBuilder() }
    );
    go(1);
  }

  // Always active: when something required is missing, say so instead
  function saveAndContinue() {
    if (blocked) {
      setTried(true);
      return;
    }
    go(step === 2 ? "done" : step + 1);
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
  }, [step]);

  const inWizard = region.flow !== "wip" && step !== "done";
  // The page title matches the current step's label in the stepper
  const pageTitle =
    region.flow === "wip" ? "Work in progress" : step === "done" ? "Request submitted" : STEPS[step];
  const primaryLabel =
    step === 2 ? "Submit request" : region.flow === "emea" ? "Save and continue" : "Save & continue";
  const showError = tried && blocked;

  return (
    <ScaledFrame title={`${pageTitle} · ${suffix}`} path={path}>
      <div className="lra-window">
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
            {/* Header: the stepper — each step is a link */}
            {step !== "done" && (
              <div className="lra-head">
                <ol className="lra-stepper">
                  {STEPS.map((label, i) => (
                    <li key={label} className={i === step ? "is-current" : i < step ? "is-done" : ""}>
                      <button type="button" aria-current={i === step ? "step" : undefined} onClick={() => go(i)}>
                        <span className="lra-step-num" aria-hidden="true">
                          {i < step ? <Icon name="check" size={16} /> : i + 1}
                        </span>
                        <span className="lra-step-label">{label}</span>
                      </button>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <div className="lra-body" ref={bodyRef}>
              {step !== "done" && <h3 className="lra-page-title">{pageTitle}</h3>}
              {step === 0 && (
                <StepClient deal={deal} update={update} addParty={addParty} onBuildSbl={buildSbl} />
              )}
              {step === 1 && (
                <StepDetails
                  deal={deal}
                  update={update}
                  setField={setField}
                  verdict={verdict}
                  region={region}
                  tried={tried}
                  onTried={() => setTried(true)}
                />
              )}
              {step === 2 && <StepReview deal={deal} verdict={verdict} onEdit={go} />}
              {step === "done" && <Submission deal={deal} onRestart={reset} />}
            </div>

            {inWizard && (
              <div className="lra-footer">
                <p
                  className={"lra-footer-status" + (showError ? " is-error" : "")}
                  role={showError ? "alert" : undefined}
                  aria-live="polite"
                >
                  {showError ? (
                    <>
                      <Icon name="error" size={18} />
                      To continue: {blockers.join(" and ")}.
                    </>
                  ) : (
                    hint
                  )}
                </p>
                <div className="lra-footer-btns">
                  {step === 0 && region.flow === "emea" && (
                    <button type="button" className="lra-btn is-ghost is-destructive" onClick={reset}>
                      Abandon
                    </button>
                  )}
                  {step > 0 && (
                    <button type="button" className="lra-btn is-secondary" onClick={() => go(step - 1)}>
                      Back
                    </button>
                  )}
                  <button type="button" className="lra-btn is-primary" onClick={saveAndContinue}>
                    {primaryLabel}
                  </button>
                </div>
              </div>
            )}

            {/* APAC: CDS on FX/OTC needs an ISDA agreement — shown as a snackbar */}
            {step === 1 && verdict.showCds && (
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
  );
}

export default function LraPrototype({ title = "Loan request prototype" }) {
  const [regionId, setRegionId] = useState(REGIONS[0].id);
  const region = REGIONS.find((r) => r.id === regionId);

  return (
    <div className="lra lra-app" aria-label={title} role="region">
      {/* Preview — the black toggle switches region variants; each starts afresh */}
      <Toggle
        label="Preview"
        value={regionId}
        onChange={setRegionId}
        options={REGIONS.map((r) => ({ id: r.id, label: r.label }))}
      />
      <LraFlow
        key={regionId}
        region={region}
        suffix="Loan Request App"
        path={`/lending/loan-request/new?region=${regionId}`}
      />
    </div>
  );
}
