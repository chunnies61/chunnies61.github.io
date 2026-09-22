import { Icon } from "../lra/ui";
import { BOOK_COB } from "./data";

/* Book Simulation › Home — the stress-test entry point: upload a list of
   securities from the template, or run the standing MV-drop scenario. */

export default function BookSim({ onPlaceholder }) {
  return (
    <div className="ws-section">
      <div className="ws-book-head">
        <dl className="ws-book-cob">
          <dt>Data refreshed as of COB</dt>
          {BOOK_COB.map(([region, date]) => (
            <dd key={region}>
              <span className="ws-book-region">{region}</span> {date}
            </dd>
          ))}
        </dl>
        <button
          type="button"
          className="lra-btn is-ghost"
          onClick={() => onPlaceholder("Regression Scenario opens the scenario library, which isn't part of this prototype.")}
        >
          Regression Scenario
        </button>
      </div>

      <div className="ws-state">
        <span className="ws-state-icon" aria-hidden="true">
          <Icon name="upload" />
        </span>
        <p className="ws-state-title">Upload a list of securities to stress-test</p>
        <p className="lra-muted">
          Start from the template, or look up security details first. The simulation runs against the
          book as of the latest COB.
        </p>
        <div className="ws-book-actions">
          <button
            type="button"
            className="lra-btn is-primary"
            onClick={() => onPlaceholder("Uploading a securities list isn't part of this prototype.")}
          >
            Upload
          </button>
          <button
            type="button"
            className="lra-btn is-secondary"
            onClick={() => onPlaceholder("MV Drop Equities runs the standing equity-shock scenario, which isn't part of this prototype.")}
          >
            MV Drop Equities
          </button>
        </div>
        <p className="ws-book-links">
          <button type="button" className="ws-link" onClick={() => onPlaceholder("The template download isn't part of this prototype.")}>
            Download the template
          </button>
          <span aria-hidden="true">·</span>
          <button type="button" className="ws-link" onClick={() => onPlaceholder("Security lookup isn't part of this prototype.")}>
            Search for security details
          </button>
        </p>
      </div>
    </div>
  );
}
