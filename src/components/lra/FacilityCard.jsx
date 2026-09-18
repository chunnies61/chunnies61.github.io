import { Icon } from "./ui";
import { AS_OF } from "./data";

/* An existing facility, built for scanning: what it is, how much of the line
   is drawn, how far through its term it is, who's on it and what secures
   it — then the actions a banker can take on it. */

const ACTIONS = ["Amendment", "Replace", "More actions"];

const day = (iso) => new Date(`${iso}T00:00:00Z`).getTime();
const months = (ms) => Math.round(ms / (1000 * 60 * 60 * 24 * 30.44));

const compact = (n) =>
  n >= 1e6 ? `${(n / 1e6).toFixed(2).replace(/\.?0+$/, "")}M` : `${Math.round(n / 1e3)}K`;

const initials = (name) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("");

export default function FacilityCard({ fac, selected, action, onAction }) {
  const used = fac.drawn / fac.lineValue;
  const near = used >= 0.8;
  const term = day(fac.maturityDate) - day(fac.opened);
  const elapsed = Math.min(Math.max((day(AS_OF) - day(fac.opened)) / term, 0), 1);
  const left = months(day(fac.maturityDate) - day(AS_OF));
  const borrowers = fac.borrowers.split(", ");
  const accounts = fac.collateral.split(", ");

  return (
    <article className={"lra-fac" + (selected ? " is-selected" : "")} aria-label={`${fac.type}, facility ${fac.facilityId}`}>
      <header className="lra-fac-head">
        <span className={"lra-fac-icon" + (fac.kind === "custom" ? " is-custom" : "")} aria-hidden="true">
          <Icon name="bank" />
        </span>
        <div className="lra-fac-title">
          <h5>{fac.type}</h5>
          <p>Facility {fac.facilityId}</p>
        </div>
        <span className={"lra-pill " + (fac.kind === "sbl" ? "is-blue" : "is-violet")}>{fac.badge}</span>
      </header>

      {/* Line size and utilisation */}
      <div className="lra-fac-line">
        <div>
          <p className="lra-fac-label">Line size</p>
          <p className="lra-fac-amount">
            ${compact(fac.lineValue)}
            <span>USD</span>
          </p>
        </div>
        <div className="lra-fac-usage">
          <div className="lra-fac-usage-head">
            <span className="lra-fac-label">Utilisation</span>
            {near && <span className="lra-pill is-warn">Near limit</span>}
            <strong>{Math.round(used * 100)}%</strong>
          </div>
          <div
            className={"lra-fac-bar" + (near ? " is-near" : "")}
            role="img"
            aria-label={`${Math.round(used * 100)}% drawn: $${compact(fac.drawn)} of $${compact(fac.lineValue)}`}
          >
            <span style={{ width: `${used * 100}%` }} />
          </div>
          <div className="lra-fac-usage-foot">
            <span>
              <i className="lra-fac-key is-drawn" aria-hidden="true" />
              Drawn ${compact(fac.drawn)}
            </span>
            <span>
              <i className="lra-fac-key" aria-hidden="true" />
              Available ${compact(fac.lineValue - fac.drawn)}
            </span>
          </div>
        </div>
      </div>

      {/* Term */}
      <div className="lra-fac-term">
        <Icon name="calendar" size={18} />
        <div className="lra-fac-term-body">
          <div className="lra-fac-term-head">
            <span>
              Matures <strong>{fac.maturity}</strong>
            </span>
            <span>{left} months left</span>
          </div>
          <div className="lra-fac-timeline" role="img" aria-label={`${Math.round(elapsed * 100)}% of the term elapsed`}>
            <span style={{ width: `${elapsed * 100}%` }} />
          </div>
        </div>
      </div>

      {/* People and collateral */}
      <dl className="lra-fac-meta">
        <div>
          <dt>Borrower{borrowers.length > 1 ? "s" : ""}</dt>
          <dd className="lra-fac-people">
            {borrowers.map((b) => (
              <span key={b} className="lra-fac-person">
                <span className="lra-fac-avatar" aria-hidden="true">
                  {initials(b)}
                </span>
                {b}
              </span>
            ))}
          </dd>
        </div>
        <div>
          <dt>Collateral</dt>
          <dd className="lra-fac-accounts">
            {accounts.map((a) => (
              <span key={a} className="lra-fac-account">
                {a}
              </span>
            ))}
          </dd>
        </div>
      </dl>

      {/* Actions */}
      <div className="lra-fac-actions" role="group" aria-label={`Actions for facility ${fac.facilityId}`}>
        {ACTIONS.map((a) => {
          const on = selected && action === a;
          return (
            <button key={a} type="button" className={on ? "is-on" : ""} aria-pressed={on} onClick={() => onAction(a, on)}>
              {on && <Icon name="check" size={18} />}
              {a}
            </button>
          );
        })}
      </div>

      {selected && fac.kind === "custom" && (
        <p className="lra-inline-error" role="alert">
          Tailored facilities can't continue here — they go through the Custom intake.
        </p>
      )}
    </article>
  );
}
