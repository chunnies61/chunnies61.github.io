import { useState } from "react";
import { Icon } from "../lra/ui";
import {
  ASSET_TYPES,
  INSIGHT_ASOF,
  INSIGHT_FILTERS,
  INSIGHT_KPIS,
  INSIGHT_SELECTS,
  POSITIONS,
  TOP_BY,
} from "./data";
import { DataTable } from "./table";

/* Insights › Collateral Insights — a filter rail beside an analytics sheet:
   a KPI strip, an asset-type summary whose figures carry in-cell bars, and a
   position summary ranked by whichever measure is chosen. Sample data. */

const usd = (n) => {
  if (n >= 1e9) return `$${+(n / 1e9).toFixed(n < 1e10 ? 1 : 0)}B`;
  if (n >= 1e6) return `$${Math.round(n / 1e6)}M`;
  if (n >= 1e3) return `$${Math.round(n / 1e3)}K`;
  return `$${n}`;
};
const count = (n) => (n >= 1000 ? `${Math.round(n / 1000)}K` : `${n}`);

/* A figure with a proportional bar behind it, so a column reads as a chart */
function Meter({ value, max, label }) {
  return (
    <span className="ws-meter">
      <span className="ws-meter-track" aria-hidden="true">
        <span className="ws-meter-fill" style={{ width: `${Math.max(1, (value / max) * 100)}%` }} />
      </span>
      <span className="ws-meter-value">{label}</span>
    </span>
  );
}

function Filters({ onPlaceholder }) {
  return (
    <aside className="ws-filters" aria-label="Filters">
      <p className="ws-filters-asof">Data as of {INSIGHT_ASOF}</p>
      <h5 className="ws-filters-title">Filters</h5>
      {INSIGHT_FILTERS.map((label) => (
        <label key={label} className="ws-filter-field">
          <span>{label}</span>
          <span className="ws-filter-input">
            <Icon name="search" size={18} />
            <input placeholder="Type to search…" onChange={() => {}} />
          </span>
        </label>
      ))}
      {INSIGHT_SELECTS.map((label) => (
        <label key={label} className="ws-filter-field">
          <span>{label}</span>
          <select defaultValue="All" onChange={() => onPlaceholder("Filtering isn't wired up in this prototype.")}>
            <option>All</option>
          </select>
        </label>
      ))}
    </aside>
  );
}

export default function Insights({ onPlaceholder }) {
  const [topBy, setTopBy] = useState("exposure");
  const [topN, setTopN] = useState(50);

  const max = [1, 2, 3, 4, 5].map((i) => Math.max(...ASSET_TYPES.map((r) => r[i])));
  // Which POSITIONS column each "Top by" measure ranks on
  const rank = { eci: 4, facilities: 5, mv: 6, elv: 7, exposure: 8 };
  const positions = [...POSITIONS]
    .sort((a, b) => b[rank[topBy]] - a[rank[topBy]])
    .slice(0, topN)
    .map(([client, instrument, asset, facility, eci, facilities, mv, elv, exposure]) => ({
      id: facility,
      client,
      instrument,
      asset,
      facility,
      eci,
      facilities,
      mv,
      elv,
      exposure,
    }));

  return (
    <div className="ws-insights">
      <Filters onPlaceholder={onPlaceholder} />

      <div className="ws-insights-main">
        <dl className="ws-summary">
          {INSIGHT_KPIS.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>

        <section className="ws-card">
          <div className="ws-card-head">
            <h5>Asset Type Summary</h5>
          </div>
          <div className="lra-table-wrap">
            <table className="lra-table">
              <caption className="lra-sr">Collateral by source asset type</caption>
              <thead>
                <tr>
                  <th scope="col">Source Asset Type</th>
                  <th scope="col">DM ECI Count</th>
                  <th scope="col">Facility Count</th>
                  <th scope="col">Collateral MV</th>
                  <th scope="col">Post Haircut ELV</th>
                  <th scope="col">Secured Exposure</th>
                </tr>
              </thead>
              <tbody>
                {ASSET_TYPES.map(([type, eci, fac, mv, elv, exposure]) => (
                  <tr key={type}>
                    <th scope="row">{type}</th>
                    <td>
                      <Meter value={eci} max={max[0]} label={count(eci)} />
                    </td>
                    <td>
                      <Meter value={fac} max={max[1]} label={count(fac)} />
                    </td>
                    <td>
                      <Meter value={mv} max={max[2]} label={usd(mv)} />
                    </td>
                    <td>
                      <Meter value={elv} max={max[3]} label={usd(elv)} />
                    </td>
                    <td>
                      <Meter value={exposure} max={max[4]} label={usd(exposure)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="ws-card">
          <div className="ws-card-head">
            <h5>Position Summary</h5>
          </div>
          <div className="ws-topby">
            <span className="ws-topby-label">Top by</span>
            {TOP_BY.map(([k, label]) => (
              <button
                key={k}
                type="button"
                aria-pressed={topBy === k}
                className={"lra-btn is-toggle" + (topBy === k ? " is-on" : "")}
                onClick={() => setTopBy(k)}
              >
                {label}
              </button>
            ))}
            <label className="ws-topn">
              <span>Top N</span>
              <input
                type="number"
                min="1"
                max="50"
                value={topN}
                onChange={(e) => setTopN(Math.min(50, Math.max(1, Number(e.target.value) || 1)))}
              />
            </label>
          </div>
          <DataTable
            caption="Top positions by the chosen measure"
            onPlaceholder={onPlaceholder}
            rows={positions}
            dense
            columns={[
              { key: "client", label: "Client Name" },
              { key: "instrument", label: "Instrument" },
              { key: "asset", label: "Source Asset Type" },
              { key: "facility", label: "Facility Number" },
              { key: "eci", label: "DM ECI Count", num: true },
              { key: "facilities", label: "Facility Count", num: true },
              { key: "mv", label: "Collateral MV", num: true, render: (r) => usd(r.mv) },
              { key: "elv", label: "Post Haircut ELV", num: true, render: (r) => usd(r.elv) },
              { key: "exposure", label: "Secured Exposure", num: true, render: (r) => usd(r.exposure) },
            ]}
          />
        </section>
      </div>
    </div>
  );
}
