import { useId, useState } from "react";
import { Icon } from "../lra/ui";
import { DOCQC_DISCLAIMER, DOCQC_FILE_TYPES } from "./data";

/* Doc QC › Outside Counsel QC Data Comparison Viewer — a gated intake form:
   the ticket loads its proposals, a proposal loads its facilities, and the
   documents come in as a drop zone. Sample data; nothing is uploaded. */

const PROPOSALS = ["PRP-44821", "PRP-44822", "PRP-44890"];
const FACILITIES = ["FAC-880142", "FAC-880517", "FAC-881003"];

export default function DocQC({ onPlaceholder }) {
  const uid = useId();
  const [ticket, setTicket] = useState("");
  const [proposal, setProposal] = useState("");
  const [facility, setFacility] = useState("");
  const [files, setFiles] = useState([]);
  const [over, setOver] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const hasTicket = ticket.trim().length > 0;
  const ready = hasTicket && proposal && facility && files.length > 0;

  function reset() {
    setTicket("");
    setProposal("");
    setFacility("");
    setFiles([]);
  }

  function addFiles(list) {
    const names = [...list].map((f) => f.name);
    if (names.length) setFiles((f) => [...new Set([...f, ...names])]);
  }

  return (
    <div className="ws-section ws-docqc">
      {!dismissed && (
        <div className="lra-banner is-warning ws-disclaimer" role="note">
          <Icon name="warning" />
          <div>
            <p className="ws-disclaimer-title">Disclaimer</p>
            <p>{DOCQC_DISCLAIMER}</p>
          </div>
          <button type="button" className="lra-icon-btn" aria-label="Dismiss disclaimer" onClick={() => setDismissed(true)}>
            <Icon name="close" size={20} />
          </button>
        </div>
      )}

      <section className="ws-card ws-docqc-form">
        <div className="ws-card-head">
          <h5>Outside Counsel QC Data Comparison Viewer</h5>
        </div>
        <p className="lra-muted">
          Enter the ticket number, proposal ID and facility ID, then upload every document required for
          QC — as a .zip or as individual files.
        </p>

        <div className="lra-field">
          <label htmlFor={`${uid}-ticket`}>
            Ticket Number<span className="lra-req"> *</span>
          </label>
          <input
            id={`${uid}-ticket`}
            placeholder="Enter ticket number"
            value={ticket}
            onChange={(e) => {
              setTicket(e.target.value);
              setProposal("");
              setFacility("");
            }}
          />
        </div>

        <div className="lra-field">
          <label htmlFor={`${uid}-proposal`}>
            Proposal ID<span className="lra-req"> *</span>
          </label>
          <select
            id={`${uid}-proposal`}
            value={proposal}
            disabled={!hasTicket}
            onChange={(e) => {
              setProposal(e.target.value);
              setFacility("");
            }}
          >
            <option value="">{hasTicket ? "Select proposal ID" : "Enter a ticket number first"}</option>
            {hasTicket && PROPOSALS.map((p) => <option key={p}>{p}</option>)}
          </select>
          <p className="lra-field-hint">Proposals load once the ticket number is entered.</p>
        </div>

        <div className="lra-field">
          <label htmlFor={`${uid}-facility`}>
            Facility ID<span className="lra-req"> *</span>
          </label>
          <select
            id={`${uid}-facility`}
            value={facility}
            disabled={!proposal}
            onChange={(e) => setFacility(e.target.value)}
          >
            <option value="">{proposal ? "Select facility ID" : "Select a proposal ID first"}</option>
            {proposal && FACILITIES.map((f) => <option key={f}>{f}</option>)}
          </select>
        </div>

        <label
          className={"ws-dropzone" + (over ? " is-over" : "")}
          onDragOver={(e) => {
            e.preventDefault();
            setOver(true);
          }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setOver(false);
            addFiles(e.dataTransfer.files);
          }}
        >
          <Icon name="upload" />
          <span className="ws-dropzone-label">Drag and drop files, or click to upload</span>
          <span className="lra-muted">File types accepted: {DOCQC_FILE_TYPES}</span>
          <input type="file" multiple className="lra-sr" onChange={(e) => addFiles(e.target.files)} />
        </label>

        {files.length > 0 && (
          <ul className="ws-files">
            {files.map((name) => (
              <li key={name}>
                <Icon name="description" size={18} />
                <span className="ws-files-name">{name}</span>
                <button
                  type="button"
                  className="lra-icon-btn is-small"
                  aria-label={`Remove ${name}`}
                  onClick={() => setFiles((f) => f.filter((n) => n !== name))}
                >
                  <Icon name="close" size={18} />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="ws-docqc-actions">
          <button type="button" className="lra-btn is-secondary" onClick={reset}>
            Reset
          </button>
          <button
            type="button"
            className="lra-btn is-primary"
            disabled={!ready}
            onClick={() => onPlaceholder("Fetch and compare runs the QC engine, which isn't part of this prototype.")}
          >
            Fetch and compare data
          </button>
        </div>
      </section>
    </div>
  );
}
