import { Icon } from "./ui";
import Menu from "./menu";
import { AS_OF, FACILITY_ACTIONS, FACILITY_MORE_ACTIONS } from "./data";

/* An existing facility, as a card: a title row carrying the facility's type
   and badges, the three figures on one line, a utilisation bar reading the
   whole width beneath them, then maturity, borrowers and collateral, and the
   actions along the bottom. Two cards sit side by side. */

const day = (iso) => new Date(`${iso}T00:00:00Z`).getTime();
const months = (ms) => Math.round(ms / (1000 * 60 * 60 * 24 * 30.44));
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const date = (iso) => {
  const [y, m, d] = iso.split("-");
  return `${d}-${MONTHS[+m - 1]}-${y}`;
};

const amount = (n) => n.toLocaleString("en-US");

const initials = (name) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("");

// Amend is the common path (outlined); Restructure is the quieter one (text)
const ACTION_STYLE = ["is-secondary", "is-ghost"];

export default function FacilityCard({ fac, currency, selected, action, onAction }) {
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
      {/* Identity */}
      <header className="lra-fac-head">
        <div className="lra-fac-name">
          <h5>{fac.type}</h5>
          <span className={"lra-pill " + (custom ? "is-violet" : "is-blue")}>{fac.badge}</span>
          {near && <span className="lra-pill is-warn">Near limit</span>}
        </div>
        <p>
          Facility {fac.facilityId} · Opened {date(fac.opened)}
        </p>
      </header>

      <div className="lra-fac-body">
        {/* The numbers on one line, then utilisation across the full width */}
        <div className="lra-fac-figures">
          <div className="lra-fac-figure is-lead">
            <span className="lra-fac-label">Line size</span>
            <strong>{amount(fac.lineValue)}</strong>
            <span className="lra-fac-sub">{currency}</span>
          </div>
          <div className="lra-fac-figure">
            <span className="lra-fac-label">Drawn</span>
            <strong>{amount(fac.drawn)}</strong>
            <span className="lra-fac-sub">{pct}% of line</span>
          </div>
          <div className="lra-fac-figure">
            <span className="lra-fac-label">Available</span>
            <strong>{amount(fac.lineValue - fac.drawn)}</strong>
            <span className="lra-fac-sub">{100 - pct}% headroom</span>
          </div>
        </div>

        <div className={"lra-fac-util" + (near ? " is-near" : "")}>
          <div
            className="lra-fac-util-track"
            role="img"
            aria-label={`Utilisation ${pct}%: ${amount(fac.drawn)} drawn of ${amount(fac.lineValue)}`}
          >
            <span style={{ width: `${pct}%` }} />
          </div>
          <p className="lra-fac-util-note">
            {near && <Icon name="warning" size={16} />}
            {near ? `Near limit — ${pct}% drawn` : `${pct}% drawn`}
          </p>
        </div>

        {/* Term, people, security */}
        <dl className="lra-fac-rows">
          <div>
            <dt>Matures</dt>
            <dd>
              {fac.maturity}
              <span> · {left} months left</span>
            </dd>
          </div>
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
            <dd className="lra-fac-people">
              {accounts.map((a) => (
                <span key={a} className="lra-fac-account">
                  {a}
                </span>
              ))}
            </dd>
          </div>
        </dl>
      </div>

      {/* Actions */}
      <footer className="lra-fac-actions" role="group" aria-label={`Actions for facility ${fac.facilityId}`}>
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
      </footer>

      {selected && custom && (
        <p className="lra-fac-note" role="status">
          Tailored facilities are handled in the Custom intake — this request will be routed there.
        </p>
      )}
    </article>
  );
}
