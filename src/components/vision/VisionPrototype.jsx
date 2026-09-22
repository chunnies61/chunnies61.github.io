import { useEffect, useRef, useState } from "react";
import { Icon, Toggle } from "../lra/ui";
import { ScaledFrame } from "../lra/frame";
import { REGIONS } from "../lra/data";
import { LraFlow } from "../lra/LraPrototype";
import { ALL_PARTIES, COLLATERALS, TICKET, VARIANTS } from "./data";
import { emptyBespoke } from "./builder";
import { LoanDetails, Review, Submission } from "./steps";
import P1Step, * as p1 from "./p1";
import P2Step, * as p2 from "./p2";
import P3Step, * as p3 from "./p3";
import "../lra/Lra.css";
import "./Vision.css";

/* Future-vision prototype — today's Loan Request workflow and the three
   proposals from the portfolio workshop, side by side on one design system
   (the Loan Request App prototype's). The Current state is the Loan Request
   App's EMEA flow itself (LraFlow); the proposals have their own steps
   below. All data is sample. */

const FLOWS = { p1, p2, p3 };
const STEP_ONE = { p1: P1Step, p2: P2Step, p3: P3Step };
const EMEA = REGIONS[0];

function initialDeal(variant) {
  const b = emptyBespoke();
  const deal = {
    parties: [],
    loading: false,
    choice: null,
    b,
    details: {},
    approvals: {},
    signersDone: false,
    chat: p2.emptyChat(),
    pool: p3.emptyPool(),
  };
  // Proposal 1 opens with the opportunity's fields already carried over
  if (variant === "p1") {
    deal.parties = ALL_PARTIES;
    deal.b = { ...b, collaterals: COLLATERALS.slice(0, 2).map((c) => c.acct) };
  }
  return deal;
}

export default function VisionPrototype({ title = "Future-vision prototype" }) {
  const [variant, setVariant] = useState("current");
  const [step, setStep] = useState(0); // 0…n-1, or "done"
  const [deal, setDeal] = useState(() => initialDeal("current"));
  const [toast, setToast] = useState("");
  const timer = useRef(null);
  const toastTimer = useRef(null);
  const bodyRef = useRef(null);

  const v = VARIANTS.find((x) => x.id === variant);
  const flow = FLOWS[variant]; // undefined for the Current state
  const offer = flow ? flow.offerOf(deal) : null;
  const reason = flow ? flow.blocker(deal) : null;
  const last = v.steps.length - 1;
  const StepOne = STEP_ONE[variant];

  const update = (patch) =>
    setDeal((d) => ({ ...d, ...(typeof patch === "function" ? patch(d) : patch) }));
  // Bespoke builder edits; `choice` undefined leaves the current pick alone
  const setB = (patch, choice) =>
    setDeal((d) => ({ ...d, b: { ...d.b, ...patch }, ...(choice !== undefined && { choice }) }));
  const choose = (choice) => update({ choice });

  function reset(next = variant) {
    clearTimeout(timer.current);
    setDeal(initialDeal(next));
    setStep(0);
  }

  function say(message) {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 4000);
  }

  // Adding a party looks the client up first — a short, cancellable load
  function addParty(party) {
    update({ loading: true });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      update((d) => ({ parties: [...d.parties, party], loading: false }));
    }, 900);
  }

  useEffect(
    () => () => {
      clearTimeout(timer.current);
      clearTimeout(toastTimer.current);
    },
    []
  );

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [step, variant]);

  // Footer buttons for the current step
  let buttons;
  if (step === "done") {
    buttons = [
      ["Export ticket", "ghost", () => say(`Ticket ${TICKET.number} exported (prototype — nothing downloaded).`)],
      ["View dashboard", "secondary", () => say("The dashboard isn't part of this prototype.")],
      ["Close", "primary", () => reset()],
    ];
  } else if (step === 0) {
    buttons = [
      variant === "p2"
        ? ["Save as draft", "ghost", () => say("Saved as a draft.")]
        : ["Close", "ghost", () => reset()],
      ["Save & continue", "primary", () => setStep(1), Boolean(reason)],
    ];
  } else {
    buttons = [
      ["Back", "secondary", () => setStep(step - 1)],
      ["Abandon", "ghost", () => reset()],
      ...(step === last
        ? [
            ["Close", "ghost", () => reset()],
            ["Continue", "primary", () => setStep("done")],
          ]
        : [["Save & continue", "primary", () => setStep(step + 1)]]),
    ];
  }

  // The Current state is scoped as the Loan Request App itself (.lra-app), so
  // none of the proposals' .vp overrides touch it and it renders pixel for
  // pixel like the EMEA preview
  return (
    <div className={"lra " + (variant === "current" ? "lra-app" : "vp")} aria-label={title} role="region">
      {/* Variant switch — the black toggle; each option has a rich tooltip */}
      <div className="vp-variants">
        <Toggle
          label="Variant"
          value={variant}
          onChange={(id) => {
            setVariant(id);
            reset(id);
          }}
          options={VARIANTS.map((x) => ({
            id: x.id,
            label: x.chip,
            tipId: `vp-tip-${x.id}`,
            tip: (
              <span className="vp-tip" role="tooltip" id={`vp-tip-${x.id}`}>
                <strong>{x.name}</strong>
                {x.desc}
              </span>
            ),
          }))}
        />
      </div>

      {variant === "current" ? (
        <LraFlow
          key="current"
          region={EMEA}
          suffix="Loan Request – Current state"
          path="/lending/loan-request/prototype?variant=current"
        />
      ) : (
      <ScaledFrame title="Loan Request – Future vision" path={`/lending/loan-request/prototype?variant=${variant}`}>
        <div className="lra-window">
          <div className="lra-head">
            {step !== "done" && (
              <ol className="lra-stepper vp-stepper">
                {v.steps.map((label, i) => (
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
            )}
          </div>

          <div className="lra-body" ref={bodyRef}>
            {step === 0 && (
              <StepOne
                key={variant}
                deal={deal}
                update={update}
                setB={setB}
                choose={choose}
                addParty={addParty}
                onReview={() => setStep(1)}
              />
            )}
            {step !== 0 && step !== "done" && step < last && (
              <LoanDetails deal={deal} update={update} offer={offer} />
            )}
            {step !== 0 && step === last && <Review deal={deal} update={update} offer={offer} />}
            {step === "done" && <Submission deal={deal} offer={offer} />}
          </div>

          <div className="lra-footer">
            <p className="lra-footer-status" aria-live="polite">
              {step === 0 && reason ? `To continue: ${reason}` : ""}
            </p>
            <div className="lra-footer-btns">
              {buttons.map(([label, kind, onClick, disabled]) => (
                <button
                  key={label}
                  type="button"
                  className={`lra-btn is-${kind}`}
                  disabled={disabled}
                  onClick={onClick}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {toast && (
            <div className="lra-snackbar" role="status">
              <p>{toast}</p>
              <button type="button" className="lra-icon-btn" aria-label="Dismiss" onClick={() => setToast("")}>
                <Icon name="close" />
              </button>
            </div>
          )}
        </div>
      </ScaledFrame>
      )}
    </div>
  );
}
