import { useEffect, useId, useRef, useState } from "react";
import { NRD_DEFAULT_MONTHS } from "./data";
import { addMonths, fmtDate, money, parseDate } from "./rules";
import { Banner, Field, Icon } from "./ui";

/* Annual review — a dialog over the request, opened by the Annual review button on a facility card.
   It moves the facility's next review date (NRD) on:

   - the default New NRD is the Current NRD plus 12 months;
   - it has to fall after the Current NRD, and says so in a banner and a red field if not;
   - past the loan's maturity it warns, and the visitor may keep the date;
   - none of it blocks Submit — the checks explain, they don't gate.

   Only secured facilities can have an annual review; the caller decides whether to open this. */

export default function AnnualReview({ fac, currency, onCancel, onSubmit }) {
  const uid = useId();
  const dialog = useRef(null);
  const defaultNrd = addMonths(fac.nrd, NRD_DEFAULT_MONTHS);
  const [text, setText] = useState(fmtDate(defaultNrd));
  const [comment, setComment] = useState("");
  const [touched, setTouched] = useState(false);

  const iso = parseDate(text);
  const blank = !text.trim();
  const state = blank
    ? "missing"
    : !iso
      ? "invalid"
      : iso <= fac.nrd
        ? "early"
        : iso > fac.maturityDate
          ? "late"
          : "ok";

  const error =
    state === "missing"
      ? "Enter a new NRD."
      : state === "invalid"
        ? "Enter the date as DD-Mon-YYYY, for example 28-Oct-2027."
        : state === "early"
          ? "The new NRD must be after the current NRD."
          : undefined;

  // Escape closes; focus starts in the dialog
  useEffect(() => {
    dialog.current?.focus();
    const onKey = (e) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div className="lra-modal-scrim" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <div
        className="lra-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${uid}-title`}
        tabIndex={-1}
        ref={dialog}
      >
        <header className="lra-modal-head">
          <h4 id={`${uid}-title`}>Annual review</h4>
          <button type="button" className="lra-icon-btn" aria-label="Close" onClick={onCancel}>
            <Icon name="close" />
          </button>
        </header>

        <div className="lra-modal-body">
          <dl className="lra-kv is-review">
            <div>
              <dt>Facility</dt>
              <dd>
                {fac.type} · {fac.facilityId}
              </dd>
            </div>
            <div>
              <dt>Line size</dt>
              <dd>{money(fac.lineValue, currency)}</dd>
            </div>
            <div>
              <dt>Loan maturity</dt>
              <dd>{fmtDate(fac.maturityDate)}</dd>
            </div>
          </dl>

          {touched && state === "early" && (
            <Banner tone="warning">
              <strong>New NRD is on or before the current NRD.</strong> A review has to move the date forward.
            </Banner>
          )}
          {state === "late" && (
            <Banner tone="warning">
              <strong>New NRD is after the loan matures</strong> on {fmtDate(fac.maturityDate)}. You can keep
              it, or choose an earlier date.
            </Banner>
          )}

          <div className="lra-grid">
            <Field label="Current NRD" id={`${uid}-cur`}>
              <input id={`${uid}-cur`} value={fmtDate(fac.nrd)} readOnly />
            </Field>
            <Field label="New NRD" id={`${uid}-new`} required error={error} hint={`Default: current NRD + ${NRD_DEFAULT_MONTHS} months`}>
              <input
                id={`${uid}-new`}
                value={text}
                placeholder="DD-Mon-YYYY"
                aria-required="true"
                aria-invalid={Boolean(error)}
                onChange={(e) => {
                  setText(e.target.value);
                  setTouched(true);
                }}
              />
            </Field>
          </div>
          {text !== fmtDate(defaultNrd) && (
            <button
              type="button"
              className="lra-btn is-ghost lra-modal-reset"
              onClick={() => {
                setText(fmtDate(defaultNrd));
                setTouched(false);
              }}
            >
              Reset to {fmtDate(defaultNrd)}
            </button>
          )}

          <Field label="Comment" id={`${uid}-comment`} hint="Optional — anything Credit should know about this review.">
            <textarea id={`${uid}-comment`} rows={3} value={comment} onChange={(e) => setComment(e.target.value)} />
          </Field>
        </div>

        <footer className="lra-modal-foot">
          <button type="button" className="lra-btn is-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="lra-btn is-primary"
            onClick={() => onSubmit({ newNrd: iso ?? "", comment, state })}
          >
            Submit annual review
          </button>
        </footer>
      </div>
    </div>
  );
}
