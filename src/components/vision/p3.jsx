import { useId } from "react";
import { Icon } from "../lra/ui";
import { POOL } from "./data";
import { PartiesBlock } from "./current";
import { Field, Section, Select, clientOf, money, num, usd } from "./parts";

/* Proposal 3 — Collateral-First Builder. Start from what the client owns:
   toggling assets recalculates capacity, advance rate, coverage and
   indicative pricing live. */

export const emptyPool = () => ({ selected: ["a1"], requested: 2000000, facility: "Line of credit", accepted: false });

export function calc(pool) {
  const assets = POOL.filter((a) => pool.selected.includes(a.id));
  const mv = assets.reduce((s, a) => s + a.mv, 0);
  const capacity = assets.reduce((s, a) => s + a.mv * a.advance, 0);
  const line = Math.min(pool.requested, capacity);
  const util = capacity ? line / capacity : 0;
  const concentrated = assets.some((a) => a.concentrated);
  const spread =
    1.1 + (util > 0.8 ? 0.25 : util > 0.6 ? 0.1 : 0) + (concentrated ? 0.15 : 0) - (line >= 5e6 ? 0.1 : 0);
  return {
    assets,
    mv,
    capacity,
    line,
    util,
    advance: mv ? capacity / mv : 0,
    coverage: line ? capacity / line : 0,
    spread,
    headroom: capacity - line,
  };
}

export function blocker(deal) {
  if (!deal.parties.length) return "add a party to unlock the deal workspace";
  const c = calc(deal.pool);
  if (!c.assets.length) return "select collateral from the pool";
  if (!c.line) return "set a line size";
  if (!deal.pool.accepted) return "use the offer";
  return null;
}

export function offerOf(deal) {
  if (blocker(deal)) return null;
  const c = calc(deal.pool);
  return {
    kind: "custom",
    product: deal.pool.facility,
    facility: deal.pool.facility.toUpperCase(),
    lineSize: c.line,
    currency: "USD",
    rate: `SOFR +${c.spread.toFixed(2)}%`,
    collateral: c.assets.map((a) => a.acct),
    borrowers: deal.parties.map((p) => clientOf(p.id).name).join(", "),
  };
}

const pct = (x) => `${Math.round(x * 100)}%`;

export default function P3Step({ deal, update, addParty }) {
  const uid = useId();
  const pool = deal.pool;
  const c = calc(pool);
  // Any change to the build un-accepts the offer
  const setPool = (patch) => update((d) => ({ pool: { ...d.pool, ...patch, accepted: false } }));
  const toggle = (id) =>
    setPool({
      selected: pool.selected.includes(id) ? pool.selected.filter((x) => x !== id) : [...pool.selected, id],
    });
  const unlocked = deal.parties.length > 0;

  return (
    <div className="lra-step">
      <Section title="Client & parties" sub="Add a party to unlock the deal workspace.">
        <PartiesBlock deal={deal} update={update} addParty={addParty} />
      </Section>

      {!unlocked ? (
        <div className="lra-empty vp-locked">
          <Icon name="lock" />
          <p>The deal workspace unlocks once a party is added.</p>
        </div>
      ) : (
        <Section title="Start from the collateral" sub="Toggle assets in and out — the deal recalculates as you go.">
          <div className="vp-builder">
            {/* Collateral pool */}
            <fieldset className="vp-pool">
              <legend className="vp-subhead">Collateral pool</legend>
              {POOL.map((a) => {
                const on = pool.selected.includes(a.id);
                const eligible = a.advance > 0;
                return (
                  <label key={a.id} className={"vp-asset" + (on ? " is-on" : "") + (eligible ? "" : " is-off")}>
                    <input type="checkbox" checked={on} disabled={!eligible} onChange={() => toggle(a.id)} />
                    <span className="vp-asset-body">
                      <span className="vp-asset-name">{a.name}</span>
                      <span className="lra-muted">
                        {a.acct} · {usd(a.mv)}
                      </span>
                    </span>
                    <span className="vp-asset-lv">
                      {eligible ? (
                        <>
                          <span>{usd(a.mv * a.advance)}</span>
                          <span className="lra-muted">{pct(a.advance)} advance</span>
                        </>
                      ) : (
                        <span className="lra-pill is-neutral">{a.reason}</span>
                      )}
                    </span>
                  </label>
                );
              })}
            </fieldset>

            {/* Live deal */}
            <div className="vp-live-deal">
              <p className="vp-subhead">Borrowing capacity</p>
              <p className="vp-capacity">{usd(c.capacity)}</p>
              <p className="lra-muted">
                from {c.assets.length} {c.assets.length === 1 ? "asset" : "assets"} worth {usd(c.mv)}
              </p>

              <div
                className="vp-progress vp-capacity-bar"
                role="img"
                aria-label={`Line uses ${pct(c.util)} of capacity`}
              >
                <span style={{ width: pct(c.util) }} />
              </div>

              <div className="vp-slider">
                <label htmlFor={`${uid}-range`} className="vp-subhead">
                  Requested line size
                </label>
                <input
                  id={`${uid}-range`}
                  type="range"
                  min={0}
                  max={Math.max(c.capacity, 50000)}
                  step={50000}
                  value={c.line}
                  disabled={!c.capacity}
                  onChange={(e) => setPool({ requested: Number(e.target.value) })}
                  style={{ "--fill": pct(c.util) }}
                />
              </div>
              <div className="lra-grid vp-live-fields">
                <Field label="Line size (USD)" id={`${uid}-line`} hint={`Up to ${usd(c.capacity)}`}>
                  <input
                    id={`${uid}-line`}
                    inputMode="decimal"
                    placeholder="0"
                    value={c.line.toLocaleString("en-US")}
                    onChange={(e) => setPool({ requested: num(e.target.value) })}
                  />
                </Field>
                <Field label="Facility" id={`${uid}-fac`}>
                  <Select
                    id={`${uid}-fac`}
                    value={pool.facility}
                    onChange={(facility) => setPool({ facility })}
                    options={["Line of credit", "Fixed term loan"]}
                  />
                </Field>
              </div>

              <dl className="vp-stats" aria-live="polite">
                <div>
                  <dt>Advance rate</dt>
                  <dd>{pct(c.advance)}</dd>
                </div>
                <div>
                  <dt>Coverage</dt>
                  <dd>{c.line ? `${c.coverage.toFixed(2)}×` : "–"}</dd>
                </div>
                <div>
                  <dt>Indicative pricing</dt>
                  <dd>SOFR +{c.spread.toFixed(2)}%</dd>
                </div>
                <div>
                  <dt>Headroom</dt>
                  <dd className="is-good">{usd(c.headroom)}</dd>
                </div>
              </dl>
            </div>
          </div>

          <article className={"lra-offer vp-offer-details" + (pool.accepted ? " is-selected" : "")}>
            <h5>Offer details</h5>
            <dl className="lra-kv is-review">
              {[
                ["Facility", pool.facility],
                ["Line size", money(c.line)],
                ["Collateral accounts", c.assets.map((a) => a.acct).join("; ") || "–"],
                ["Advance rate", pct(c.advance)],
                ["Coverage", c.line ? `${c.coverage.toFixed(2)}×` : "–"],
                ["Indicative pricing", `SOFR +${c.spread.toFixed(2)}%`],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            <button
              type="button"
              className={"lra-btn is-toggle" + (pool.accepted ? " is-on" : "")}
              aria-pressed={pool.accepted}
              disabled={!c.line}
              onClick={() => update((d) => ({ pool: { ...d.pool, accepted: !d.pool.accepted } }))}
            >
              {pool.accepted && <Icon name="check" size={18} />}
              {pool.accepted ? "Offer in use" : "Use this offer"}
            </button>
          </article>
        </Section>
      )}
    </div>
  );
}
