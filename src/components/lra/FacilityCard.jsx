import { Icon } from "./ui";
import { AS_OF } from "./data";

/* An existing facility, laid out in horizontal zones so it scans in one
   pass: identity and actions; a strip of the four numbers that matter;
   the utilisation bar; then who's on it and what secures it. */

const ACTIONS = ["Amendment", "Replace", "More actions"];

const day = (iso) => new Date(`${iso}T00:00:00Z`).getTime();
const months = (ms) => Math.round(ms / (1000 * 60 * 60 * 24 * 30.44));
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const date = (iso) => {
  const [y, m, d] = iso.split("-");
  return `${d}-${MONTHS[+m - 1]}-${y}`;
};

const usd = (n) =>
  n >= 1e6 ? `$${(n / 1e6).toFixed(2).replace(/\.?0+$/, "")}M` : `$${Math.round(n / 1e3)}K`;

const initials = (name) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("");

export default function FacilityCard({ fac, selected, action, onAction }) {
  const used = fac.drawn / fac.lineValue;
  const pct = Math.round(used * 100);
  const near = used >= 0.8;
  const left = months(day(fac.maturityDate) - day(AS_OF));
  const borrowers = fac.borrowers.split(", ");
  const accounts = fac.collateral.split(", ");
  const custom = fac.kind === "custom";

  return (
    <article
      className={"lra-fac" + (selected ? " is-selected" : "") + (custom ? " is-custom" : "")}
      aria-label={`${fac.type}, facility ${fac.facilityId}`}
    >
      {/* Identity + actions */}
      <header className="lra-fac-head">
        <span className="lra-fac-icon" aria-hidden="true">
          <Icon name="bank" />
        </span>
        <div className="lra-fac-title">
          <div className="lra-fac-name">
            <h5>{fac.type}</h5>
            <span className={"lra-pill " + (custom ? "is-violet" : "is-blue")}>{fac.badge}</span>
            {near && <span className="lra-pill is-warn">Near limit</span>}
          </div>
          <p>
            Facility {fac.facilityId} · Opened {date(fac.opened)}
          </p>
        </div>
        <div className="lra-fac-actions" role="group" aria-label={`Actions for facility ${fac.facilityId}`}>
          {ACTIONS.map((a) => {
            const on = selected && action === a;
            return (
              <button key={a} type="button" className={on ? "is-on" : ""} aria-pressed={on} onClick={() => onAction(a, on)}>
                {on && <Icon name="check" size={16} />}
                {a}
              </button>
            );
          })}
        </div>
      </header>

      {/* The four numbers */}
      <dl className="lra-fac-stats">
        <div>
          <dt>Line size</dt>
          <dd className="is-lead">
            {usd(fac.lineValue)} <span>USD</span>
          </dd>
        </div>
        <div>
          <dt>Drawn</dt>
          <dd>
            {usd(fac.drawn)} <span>{pct}%</span>
          </dd>
        </div>
        <div>
          <dt>Available</dt>
          <dd>{usd(fac.lineValue - fac.drawn)}</dd>
        </div>
        <div>
          <dt>Matures</dt>
          <dd>
            {fac.maturity} <span>{left} mo left</span>
          </dd>
        </div>
      </dl>

      {/* Utilisation */}
      <div
        className={"lra-fac-util" + (near ? " is-near" : "")}
        role="img"
        aria-label={`Utilisation ${pct}%: ${usd(fac.drawn)} drawn of ${usd(fac.lineValue)}`}
      >
        <span style={{ width: `${pct}%` }} />
      </div>

      {/* People and collateral */}
      <footer className="lra-fac-foot">
        <div>
          <span className="lra-fac-label">Borrower{borrowers.length > 1 ? "s" : ""}</span>
          <span className="lra-fac-people">
            {borrowers.map((b) => (
              <span key={b} className="lra-fac-person">
                <span className="lra-fac-avatar" aria-hidden="true">
                  {initials(b)}
                </span>
                {b}
              </span>
            ))}
          </span>
        </div>
        <div>
          <span className="lra-fac-label">Collateral</span>
          <span className="lra-fac-people">
            {accounts.map((a) => (
              <span key={a} className="lra-fac-account">
                {a}
              </span>
            ))}
          </span>
        </div>
      </footer>

      {selected && custom && (
        <p className="lra-inline-error lra-fac-error" role="alert">
          Tailored facilities can't continue here — they go through the Custom intake.
        </p>
      )}
    </article>
  );
}
