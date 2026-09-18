import { useId } from "react";
import { Banner, Icon } from "../lra/ui";
import {
  AdditionalAssets,
  CollateralTable,
  DmAccount,
  FacilityFields,
  HostAccounts,
  LifeInsurance,
  evaluateOffer,
  lendingValue,
  resolveOffer,
} from "./builder";
import { PartiesBlock } from "./current";
import { Section, clientOf, num, usd } from "./parts";

/* Proposal 1 — One Request, Any Deal. No SBL-vs-Custom fork up front: one
   request that reveals only what this deal needs, with a live path helper
   saying which route it's taking. */

// Where the deal is heading, from what's been entered so far
export function routeOf(deal) {
  const b = deal.b;
  const line = num(b.lineSize);
  const lv = lendingValue(b);
  if (b.unsecured === "Yes") return { id: "dm", label: "Credit-underwritten (DM account)", tone: "violet" };
  if (!b.collaterals.length) return { id: "pending", label: "Pick collateral to see the route", tone: "neutral" };
  if (lv >= line) return { id: "sbl", label: "Streamlined (SBL)", tone: "blue", lv, line };
  return { id: "short", label: "Tailored — needs more security", tone: "warn", lv, line, short: line - lv };
}

export function blocker(deal) {
  if (!deal.parties.length) return "add at least one party";
  const b = deal.b;
  const route = routeOf(deal);
  if (route.id === "dm") return b.dm.team ? null : "select an underwriting team";
  if (!num(b.lineSize)) return "enter a line size";
  if (route.id === "pending") return "select collateral for the deal";
  if (route.id === "short") return `add ${usd(route.short)} more security or lower the line size`;
  if (b.hostMode === "existing" && !b.host) return "select a host account";
  return null;
}

export function offerOf(deal) {
  if (blocker(deal)) return null;
  const names = deal.parties.map((p) => clientOf(p.id).name).join(", ");
  if (routeOf(deal).id === "dm") return resolveOffer({ ...deal, choice: "dm" });
  return { ...evaluateOffer(deal.b, names), tags: ["Streamlined (SBL)"] };
}

function PathHelper({ deal }) {
  const b = deal.b;
  const route = routeOf(deal);
  const dm = route.id === "dm";
  const checks = dm
    ? [
        ["Parties added", deal.parties.length > 0],
        ["Line size entered", num(b.dm.lineSize) > 0],
        [`FBI graded`, true],
        ["Underwriting team", Boolean(b.dm.team)],
      ]
    : [
        ["Parties added", deal.parties.length > 0],
        ["Collateral selected", b.collaterals.length > 0],
        ["Collateral covers the line", route.id === "sbl"],
        ["Host account", b.hostMode === "new" || Boolean(b.host)],
      ];

  return (
    <aside className="vp-path" aria-label="Path helper">
      <p className="vp-path-eyebrow">
        <Icon name="sparkle" size={18} />
        Path helper
      </p>
      <p className="vp-path-route" aria-live="polite">
        <span className={`lra-pill is-${route.tone}`}>{route.label}</span>
      </p>
      <p className="vp-path-why">
        {route.id === "sbl" && `Collateral lends ${usd(route.lv)} against a ${usd(route.line)} line — no credit review needed.`}
        {route.id === "short" &&
          `Collateral lends ${usd(route.lv)} against a ${usd(route.line)} line. Add ${usd(route.short)} of security below, or lower the line.`}
        {route.id === "pending" && "The route updates as you build — nothing to choose up front."}
        {dm && "Unsecured deals go to credit underwriting. The DM account fields are shown below."}
      </p>
      <ul className="vp-path-checks">
        {checks.map(([label, ok]) => (
          <li key={label} className={ok ? "is-done" : ""}>
            <span className="vp-check-dot" aria-hidden="true">
              {ok && <Icon name="check" size={14} />}
            </span>
            {label}
            <span className="lra-sr">{ok ? " — done" : " — to do"}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default function P1Step({ deal, update, setB, addParty }) {
  const uid = useId();
  const b = deal.b;
  const set = (patch) => setB(patch);
  const route = routeOf(deal);

  return (
    <div className="lra-step">
      <Banner>
        Continued from Collateral studio — Opportunity OPP-48213 · 12 fields carried over
        automatically
      </Banner>

      <Section title="Client & parties" sub="Carried over from the opportunity. Add anyone who's missing.">
        <PartiesBlock deal={deal} update={update} addParty={addParty} />
      </Section>

      <div className="vp-split">
        <div className="vp-split-main">
          <FacilityFields b={b} set={set} />

          <Section title="Security">
            <fieldset className="vp-yesno">
              <legend>How is this deal secured?</legend>
              <div className="lra-radios">
                {[
                  ["No", "Against collateral"],
                  ["Yes", "Unsecured"],
                ].map(([v, label]) => (
                  <label key={v} className="lra-radio">
                    <input
                      type="radio"
                      name={`${uid}-sec`}
                      checked={b.unsecured === v}
                      onChange={() => set({ unsecured: v })}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>
            {b.unsecured === "No" && <CollateralTable b={b} set={set} />}
          </Section>

          {/* Revealed when the collateral falls short — and kept while it's in use */}
          {(route.id === "short" ||
            (route.id !== "dm" && (b.life === "Yes" || b.additional === "Yes"))) && (
            <div className="lra-sbl vp-reveal">
              <p className="vp-reveal-title">
                <Icon name="add" size={18} />
                Add more security
              </p>
              <LifeInsurance b={b} set={set} />
              <AdditionalAssets b={b} set={set} />
            </div>
          )}

          {/* Revealed only for unsecured deals */}
          {route.id === "dm" && (
            <div className="lra-sbl vp-reveal">
              <p className="vp-reveal-title">
                <Icon name="description" size={18} />
                Credit underwriting
              </p>
              <DmAccount b={b} set={set} />
            </div>
          )}

          {route.id !== "dm" && <HostAccounts b={b} set={set} />}
        </div>
        <PathHelper deal={deal} />
      </div>
    </div>
  );
}
