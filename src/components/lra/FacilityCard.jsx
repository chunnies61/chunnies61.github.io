import { Icon } from "./ui";
import Menu from "./menu";
import { AS_OF, FACILITY_ACTIONS, FACILITY_MORE_ACTIONS } from "./data";

/* An existing facility. The hierarchy runs top-down: what it is and what
   you can do with it; the line size as the one big number, its
   utilisation right beneath and the supporting figures beside it; then
   who is on it and what secures it, quietly, in the footer. */

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

// Amend is the common path (outlined); Restructure is the quieter one (text)
const ACTION_STYLE = ["is-secondary", "is-ghost"];

export default function FacilityCard({ fac, selected, action, onAction }) {
  const used = fac.drawn / fac.lineValue;
  const pct = Math.round(used * 100);
  const near = used >= 0.8;
  const left = months(day(fac.maturityDate) - day(AS_OF));
  const borrowers = fac.borrowers.split(", ");
  const accounts = fac.collateral.split(", ");
  const custom = fac.kind === "custom";
  const moreOn = selected && FACILITY_MORE_ACTIONS.includes(action) ? action : null;

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
          {FACILITY_ACTIONS.map((a, i) => {
            const on = selected && action === a;
            return (
              <button
                key={a}
                type="button"
                className={`lra-btn ${ACTION_STYLE[i]}` + (on ? " is-on" : "")}
                aria-pressed={on}
                onClick={() => onAction(a, on)}
              >
                {on && <Icon name="check" size={18} />}
                {a}
              </button>
            );
          })}
          <Menu label="More actions" items={FACILITY_MORE_ACTIONS} value={moreOn} onSelect={onAction} />
        </div>
      </header>

      {/* The numbers: line size leads, the rest support */}
      <div className="lra-fac-body">
        <div className="lra-fac-hero">
          <span className="lra-fac-label">Line size</span>
          <strong className="lra-fac-amount">
            {fac.lineValue.toLocaleString("en-US")} <span>USD</span>
          </strong>
          <div
            className={"lra-fac-util" + (near ? " is-near" : "")}
            role="img"
            aria-label={`Utilisation ${pct}%: ${usd(fac.drawn)} drawn of ${usd(fac.lineValue)}`}
          >
            <span style={{ width: `${pct}%` }} />
          </div>
          <p className="lra-fac-caption">
            <strong>{pct}%</strong> drawn
          </p>
        </div>
        <dl className="lra-fac-stats">
          <div>
            <dt>Drawn</dt>
            <dd>{usd(fac.drawn)}</dd>
          </div>
          <div>
            <dt>Available</dt>
            <dd>{usd(fac.lineValue - fac.drawn)}</dd>
          </div>
          <div>
            <dt>Matures</dt>
            <dd>
              {fac.maturity}
              <span>{left} months left</span>
            </dd>
          </div>
        </dl>
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
        <p className="lra-fac-note" role="status">
          Tailored facilities are handled in the Custom intake — this request will be routed there.
        </p>
      )}
    </article>
  );
}
