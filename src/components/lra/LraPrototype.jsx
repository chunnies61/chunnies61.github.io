import { useEffect, useRef, useState } from "react";
import { EMEA } from "./data";
import { assess, emptyDeal, flowOf, freshBuilder, stepsFor } from "./rules";
import StepClient from "./StepClient";
import StepDetails from "./StepDetails";
import StepReview from "./StepReview";
import StepCq from "./StepCq";
import { CustomDetails, CustomReview } from "./StepCustom";
import { AmendDetails, AmendReview } from "./StepAmend";
import AnnualReview from "./AnnualReview";
import SectionIndex from "./SectionIndex";
import Submission from "./Submission";
import { Icon } from "./ui";
import { ScaledFrame } from "./frame";
import "./Lra.css";

/* Loan Request App prototype — the EMEA origination wizard.

   LraFlow is the wizard in its browser window: Client & facility, Loan details,
   Loan review, Credit questionnaire, then the submission. EMEA (in EUR) is the only flow the
   prototype covers. The future-vision prototype reuses LraFlow as its Current
   state. All data is mocked (see ./data.js). */

/* The sections each step grows into, so the index is there before they all are */
const INDEX_EXPECTED = {
  0: {
    sections: ["Add parties", "Existing facilities"],
  },
  1: {
    sections: ["Secured collaterals", "Host accounts", "Facility details", "Supporting documents", "Comments", "Select an offer"],
    hints: { Comments: "Offers appear once you create them." },
  },
};

export function LraFlow({ region, suffix, path }) {
  const [step, setStep] = useState(0); // 0, 1, 2, 3, or "done"
  const ccy = region.currency ?? "USD";
  const [deal, setDeal] = useState(() => emptyDeal(ccy));
  const [tried, setTried] = useState(false); // continue was pressed while blocked
  const timer = useRef(null);
  const bodyRef = useRef(null);
  const contentRef = useRef(null);

  const verdict = assess(deal, region);
  const steps = stepsFor(deal); // an amendment has no credit questionnaire
  const flow = verdict.flow;
  const [annualFor, setAnnualFor] = useState(null); // the facility whose annual review dialog is open
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
    setDeal(emptyDeal(ccy));
    go(0);
  }

  // "Build your own (SBL) deal" opens Loan details, fresh unless already begun
  function buildSbl() {
    update((d) =>
      d.build === "sbl"
        ? { facilityId: null, facilityAction: null }
        : { build: "sbl", facilityId: null, facilityAction: null, ...freshBuilder(ccy) }
    );
    go(1);
  }

  // Always active: when something required is missing, say so instead
  function saveAndContinue() {
    if (blocked) {
      setTried(true);
      return;
    }
    go(step === steps.length - 1 ? "done" : step + 1);
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

  const inWizard = step !== "done";
  // The page title matches the current step's label in the stepper
  const pageTitle = step === "done" ? "Request submitted" : steps[step];
  const primaryLabel = step === steps.length - 1 ? "Submit request" : "Save and continue";
  const showError = tried && blocked;

  return (
    <ScaledFrame title={`${pageTitle} · ${suffix}`} path={path}>
      <div className="lra-window">
        {/* App header: the product's name, on every screen of the request */}
        <div className="lra-appbar">
          <span className="lra-appbar-mark" aria-hidden="true">
            <Icon name="sparkle" size={28} />
          </span>
          <span className="lra-appbar-name">Loan Request App</span>
        </div>

        {/* Header: the stepper — each step is a link */}
        {step !== "done" && (
          <div className="lra-head">
            <ol className="lra-stepper">
              {steps.map((label, i) => (
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
          {/* The page title runs across the top, left-aligned with the Steps index beneath it */}
          {step !== "done" && <h3 className="lra-page-title">{pageTitle}</h3>}
          <div className="lra-body-grid">
            {step !== "done" && (
              <SectionIndex
                bodyRef={bodyRef}
                contentRef={contentRef}
                expected={step === 0 || (step === 1 && flow === "sbl") ? INDEX_EXPECTED[step]?.sections : undefined}
                hints={step === 0 || (step === 1 && flow === "sbl") ? INDEX_EXPECTED[step]?.hints : undefined}
              />
            )}
            <div className="lra-body-main" ref={contentRef}>
              {step === 0 && (
                <StepClient
                  deal={deal}
                  update={update}
                  addParty={addParty}
                  onBuildSbl={buildSbl}
                  onAnnualReview={setAnnualFor}
                  tried={tried}
                  verdict={verdict}
                />
              )}
              {step === 1 && flow === "custom" && (
                <CustomDetails deal={deal} update={update} verdict={verdict} tried={tried} onEdit={go} />
              )}
              {step === 1 && flow === "amendment" && <AmendDetails deal={deal} update={update} />}
              {step === 1 && (flow === "sbl" || flow === "annual") && (
                <StepDetails
                  deal={deal}
                  update={update}
                  setField={setField}
                  verdict={verdict}
                  tried={tried}
                  onTried={() => setTried(true)}
                />
              )}
              {step === 2 && flow === "custom" && <CustomReview deal={deal} onEdit={go} />}
              {step === 2 && flow === "amendment" && <AmendReview deal={deal} onEdit={go} />}
              {step === 2 && (flow === "sbl" || flow === "annual") && (
                <StepReview deal={deal} verdict={verdict} onEdit={go} />
              )}
              {step === 3 && <StepCq deal={deal} update={update} />}
              {step === "done" && <Submission deal={deal} onRestart={reset} />}
            </div>
          </div>
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
              {step === 0 && (
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

        {annualFor && (
          <AnnualReview
            fac={annualFor}
            currency={ccy}
            onCancel={() => setAnnualFor(null)}
            onSubmit={(annual) => {
              update({ annual, facilityId: annualFor.id });
              setAnnualFor(null);
              go("done");
            }}
          />
        )}
      </div>
    </ScaledFrame>
  );
}

export default function LraPrototype({ title = "Loan request prototype" }) {
  return (
    <div className="lra lra-app" aria-label={title} role="region">
      <LraFlow region={EMEA} suffix="Loan Request App" path={`/lending/loan-request/new?region=${EMEA.id}`} />
    </div>
  );
}
