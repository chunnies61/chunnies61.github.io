import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "../lra/ui";
import { ScaledFrame } from "../lra/frame";
import { APPS, EXTERNAL, SECTIONS, USER_ID, WORKSPACES } from "./data";
import Overview from "./Overview";
import { DealJourney, Opportunities } from "./tables";
import PortfolioHealth from "./Health";
import "../lra/Lra.css";
import "./Workspace.css";

/* Lending Workspace prototype — the "single pane of glass" where bankers
   and lending specialists service and grow their book. A persistent shell
   (global bar, workspace tabs, app tabs, blue section nav) over four built
   sections. Material 3, on the Loan Request App prototype's system; all
   data is sample. */

const UTILITIES = [
  ["bell", "Notifications"],
  ["sparkle", "Spark AI"],
  ["coach", "Coach"],
  ["checklist", "Checklist"],
  ["note", "Notes"],
  ["help", "Help"],
];

export default function WorkspacePrototype({ title = "Lending Workspace prototype" }) {
  const uid = useId();
  const [section, setSection] = useState("overview");
  const [oppTab, setOppTab] = useState("offers");
  const [pill, setPill] = useState("portfolio");
  const [search, setSearch] = useState("");
  const [client, setClient] = useState("");
  const [toast, setToast] = useState("");
  const toastTimer = useRef(null);
  const bodyRef = useRef(null);

  function say(message) {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 4000);
  }
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  // Jump to a section (and optionally one of its tabs)
  function go(id, sub) {
    setSection(id);
    if (id === "opps" && sub) setOppTab(sub);
    if (id === "health") setPill(sub ?? "portfolio");
  }

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [section, pill, oppTab]);

  const placeholder = (what) => () => say(`${what} isn't part of this prototype.`);

  return (
    <div className="lra ws" aria-label={title} role="region">
      <ScaledFrame title="Lending Workspace" path={`/lending/workspace/${section}`}>
        <div className="lra-window ws-window">
          {/* Row 1 — global bar */}
          <div className="ws-global">
            <button type="button" className="lra-icon-btn" aria-label="Apps" onClick={placeholder("The app launcher")}>
              <Icon name="apps" />
            </button>
            <form
              className="ws-search"
              role="search"
              onSubmit={(e) => {
                e.preventDefault();
                say(search.trim() ? `Search for “${search.trim()}” isn't wired up in this prototype.` : "Type something to search.");
              }}
            >
              <Icon name="search" />
              <label htmlFor={`${uid}-search`} className="lra-sr">
                Search
              </label>
              <input
                id={`${uid}-search`}
                placeholder="Search for profiles, accounts or applications…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </form>
            <div className="ws-utilities">
              {UTILITIES.map(([icon, label]) => (
                <button key={icon} type="button" className="lra-icon-btn" aria-label={label} onClick={placeholder(label)}>
                  <Icon name={icon} />
                </button>
              ))}
            </div>
            <span className="ws-user" aria-label={`Signed in as ${USER_ID}`}>
              <span className="ws-user-avatar" aria-hidden="true">
                W
              </span>
              {USER_ID}
            </span>
            <span className="ws-window-btns" aria-hidden="true">
              <Icon name="minimize" size={18} />
              <Icon name="maximize" size={18} />
              <Icon name="close" size={18} />
            </span>
          </div>

          {/* Row 2 — workspace tabs + breadcrumb */}
          <div className="ws-row ws-workspaces">
            <nav className="ws-tabs-row" aria-label="Workspaces">
              <button type="button" className="lra-icon-btn is-small" aria-label="Home" onClick={placeholder("Home")}>
                <Icon name="home" size={20} />
              </button>
              {WORKSPACES.map((w) => (
                <button
                  key={w}
                  type="button"
                  className={"ws-ws-tab" + (w === "Lending" ? " is-on" : "")}
                  aria-current={w === "Lending" ? "page" : undefined}
                  onClick={w === "Lending" ? undefined : placeholder(`The ${w} workspace`)}
                >
                  {w}
                </button>
              ))}
              <button type="button" className="lra-icon-btn is-small" aria-label="Add workspace" onClick={placeholder("Adding a workspace")}>
                <Icon name="add" size={20} />
              </button>
            </nav>
            <ol className="ws-crumbs" aria-label="Breadcrumb">
              <li>Recommended</li>
              <li aria-current="page">Lending</li>
            </ol>
          </div>

          {/* Row 3 — L1 app tabs */}
          <nav className="ws-row ws-apps" aria-label="Lending apps">
            {APPS.map((a, i) => (
              <button
                key={a}
                type="button"
                className={"lra-tab" + (i === 0 ? " is-active" : "")}
                aria-current={i === 0 ? "page" : undefined}
                onClick={i === 0 ? undefined : placeholder(a)}
              >
                <span>{a}</span>
              </button>
            ))}
            <button type="button" className="lra-icon-btn is-small" aria-label="Open a new app" onClick={placeholder("Opening a new app")}>
              <Icon name="add" size={20} />
            </button>
          </nav>

          {/* Row 4 — L2 section nav + client selector */}
          <div className="ws-l2">
            <nav className="ws-l2-scroll" aria-label="Lending Workspace sections">
              {SECTIONS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={"ws-l2-tab" + (section === s.id ? " is-on" : "") + (s.built ? "" : " is-off")}
                  aria-current={section === s.id ? "page" : undefined}
                  aria-disabled={!s.built}
                  onClick={() => (s.built ? setSection(s.id) : say(`${s.label} isn't built in this prototype.`))}
                >
                  {s.label}
                  {s.menu && <Icon name="expand" size={18} />}
                </button>
              ))}
              <span className="ws-l2-divider" aria-hidden="true" />
              {EXTERNAL.map((x) => (
                <button
                  key={x}
                  type="button"
                  className="ws-l2-tab is-link"
                  onClick={() => say(`${x} opens another prototype in a new tab — not included here.`)}
                >
                  {x}
                  <Icon name="openInNew" size={16} />
                </button>
              ))}
            </nav>
            <div className="ws-client">
              <label htmlFor={`${uid}-client`} className="lra-sr">
                Client
              </label>
              <input
                  id={`${uid}-client`}
                  placeholder="First Name Last name"
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                />
              <Icon name="expand" size={20} />
            </div>
          </div>

          <div className="lra-body ws-body" ref={bodyRef}>
            <h4 className="lra-sr">{SECTIONS.find((s) => s.id === section).label}</h4>
            {section === "overview" && <Overview go={go} onPlaceholder={say} />}
            {section === "deals" && <DealJourney onPlaceholder={say} />}
            {section === "opps" && <Opportunities tab={oppTab} setTab={setOppTab} onPlaceholder={say} />}
            {section === "health" && <PortfolioHealth pill={pill} setPill={setPill} onPlaceholder={say} />}
          </div>

          {toast && (
            <div className="lra-snackbar ws-snackbar" role="status">
              <p>{toast}</p>
              <button type="button" className="lra-icon-btn" aria-label="Dismiss" onClick={() => setToast("")}>
                <Icon name="close" />
              </button>
            </div>
          )}
        </div>
      </ScaledFrame>
    </div>
  );
}
