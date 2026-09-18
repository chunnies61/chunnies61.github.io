import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "../lra/ui";
import { ALL_PARTIES, FACILITIES, SCRIPT } from "./data";
import { clientOf, money } from "./parts";

/* Proposal 2 — AI Application Agent. A scripted Connect Coach conversation
   beside an application that fills itself in as the chat goes. */

const LAST = SCRIPT.length - 1;

export const emptyChat = () => ({
  turn: 0,
  messages: SCRIPT[0].say.map((text) => ({ from: "agent", text })),
  typing: false,
  term: 48,
  spread: 1.35,
});

const filledOf = (turn) => new Set(SCRIPT.slice(0, turn + 1).flatMap((t) => t.fills));

export function blocker(deal) {
  return deal.chat.turn === LAST ? null : "keep chatting — Coach is still filling the application";
}

export function offerOf(deal) {
  if (deal.chat.turn !== LAST) return null;
  return {
    kind: "offer",
    product: "Security-based loan",
    facility: "SECURITY-BASED LOAN",
    lineSize: 8000000,
    currency: "USD",
    rate: `SOFR +${deal.chat.spread.toFixed(2)}%`,
    collateral: ["12345678", "12345689"],
    host: "9502050",
    borrowers: deal.parties.map((p) => clientOf(p.id).name).join(", "),
  };
}

function Skeleton() {
  return (
    <div className="vp-skeleton" aria-hidden="true">
      <span />
      <span />
    </div>
  );
}

function AppSection({ title, filled, children }) {
  return (
    <section className={"vp-app-section" + (filled ? " is-filled" : "")}>
      <div className="vp-app-head">
        <h5>{title}</h5>
        {filled ? (
          <span className="lra-pill is-blue vp-pill-icon">
            <Icon name="sparkle" size={14} />
            Filled by Coach
          </span>
        ) : (
          <span className="lra-muted">Waiting for Coach…</span>
        )}
      </div>
      {filled ? children : <Skeleton />}
    </section>
  );
}

function Kv({ rows }) {
  return (
    <dl className="lra-kv is-review">
      {rows.map(([k, v]) => (
        <div key={k}>
          <dt>{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function P2Step({ deal, update, onReview }) {
  const uid = useId();
  const chat = deal.chat;
  const [text, setText] = useState("");
  const [pane, setPane] = useState("chat"); // phone only: which panel shows
  const timer = useRef(null);
  const logRef = useRef(null);
  const filled = filledOf(chat.turn);
  const progress = SCRIPT[chat.turn].progress;

  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [chat.messages.length, chat.typing]);

  const setChat = (fn) => update((d) => ({ chat: { ...d.chat, ...fn(d.chat) } }));

  function reply(said) {
    if (!said.trim() || chat.typing) return;
    if (said === "Review & submit" && chat.turn === LAST) {
      onReview();
      return;
    }
    setChat((c) => ({ messages: [...c.messages, { from: "user", text: said }], typing: true }));
    setText("");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      update((d) => {
        const c = d.chat;
        const out = [];
        const patch = {};
        let turn = c.turn;
        let term = c.term;
        let spread = c.spread;
        if (/36 months/i.test(said)) {
          term = 36;
          spread = 1.4;
          out.push("Updated the term to 36 months — pricing moves to SOFR +1.40%.");
          patch.details = { ...d.details, tenor: "36" };
        } else if (/draft/i.test(said)) {
          out.push("Saved as a draft. You'll find it on your dashboard whenever you're ready.");
        }
        if (turn < LAST) {
          turn += 1;
          out.push(...SCRIPT[turn].say);
          if (SCRIPT[turn].fills.includes("parties")) patch.parties = ALL_PARTIES;
        } else if (!out.length) {
          out.push("The application is complete. Choose Review & submit when you're ready.");
        }
        return {
          ...patch,
          chat: {
            ...c,
            turn,
            term,
            spread,
            typing: false,
            messages: [...c.messages, ...out.map((t) => ({ from: "agent", text: t }))],
          },
        };
      });
    }, 800);
  }

  const chips = SCRIPT[chat.turn].chips;

  return (
    <div className={`vp-agent is-pane-${pane}`}>
      {/* Phone: a segmented button switches between the two panels */}
      <div className="vp-segmented" role="group" aria-label="Show">
        {[
          ["chat", "Chat"],
          ["app", `Application · ${progress}%`],
        ].map(([k, label]) => (
          <button
            key={k}
            type="button"
            aria-pressed={pane === k}
            className={pane === k ? "is-on" : ""}
            onClick={() => setPane(k)}
          >
            {pane === k && <Icon name="check" size={18} />}
            {label}
          </button>
        ))}
      </div>

      {/* Chat */}
      <section className="vp-chat" aria-label="Connect Coach">
        <header className="vp-chat-head">
          <span className="vp-avatar is-coach" aria-hidden="true">
            <Icon name="sparkle" size={18} />
          </span>
          <div>
            <p className="vp-chat-title">Connect Coach</p>
            <p className="lra-muted">Fills the application as you chat</p>
          </div>
          <span className="vp-live">
            <span aria-hidden="true" />
            Live
          </span>
        </header>

        <div className="vp-chat-log" ref={logRef} role="log" aria-live="polite">
          {chat.messages.map((m, i) => (
            <p key={i} className={`vp-msg is-${m.from}`}>
              <span className="lra-sr">{m.from === "agent" ? "Coach: " : "You: "}</span>
              {m.text}
            </p>
          ))}
          {chat.typing && (
            <p className="vp-msg is-agent vp-typing" aria-label="Coach is typing">
              <span />
              <span />
              <span />
            </p>
          )}
        </div>

        <div className="vp-suggestions" aria-label="Suggested replies">
          {chips.map((c) => (
            <button key={c} type="button" className="lra-chip" disabled={chat.typing} onClick={() => reply(c)}>
              {c}
            </button>
          ))}
        </div>

        <form
          className="vp-chat-input"
          onSubmit={(e) => {
            e.preventDefault();
            reply(text);
          }}
        >
          <label htmlFor={`${uid}-msg`} className="lra-sr">
            Message Connect Coach
          </label>
          <input
            id={`${uid}-msg`}
            placeholder="Message Connect Coach…"
            autoComplete="off"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button type="submit" className="lra-icon-btn is-send" aria-label="Send" disabled={!text.trim() || chat.typing}>
            <Icon name="send" />
          </button>
        </form>
      </section>

      {/* The application, building itself */}
      <section className="vp-app" aria-label="Application">
        <div className="vp-app-progress">
          <div className="vp-app-progress-label">
            <span>Application</span>
            <span aria-live="polite">{progress}% complete</span>
          </div>
          <div
            className="vp-progress"
            role="progressbar"
            aria-label="Application completion"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>

        <AppSection title="Client & parties" filled={filled.has("parties")}>
          <ul className="vp-list">
            {ALL_PARTIES.map((p) => (
              <li key={p.id}>
                <span>{clientOf(p.id).name}</span>
                <span className="lra-muted">{p.role}</span>
              </li>
            ))}
          </ul>
        </AppSection>
        <AppSection title="Existing facilities" filled={filled.has("facilities")}>
          <ul className="vp-list">
            {FACILITIES.map((f) => (
              <li key={f.id}>
                <span>
                  {f.id} · {f.facility}
                </span>
                <span className="lra-muted">{money(f.lineSize)}</span>
              </li>
            ))}
          </ul>
        </AppSection>
        <AppSection title="Recommended offer" filled={filled.has("offer")}>
          <Kv
            rows={[
              ["Product", "Security-based loan"],
              ["Line size", money(8000000)],
              ["Pricing", `SOFR +${chat.spread.toFixed(2)}%`],
              ["Advance rate", "67%"],
              ["Term", `${chat.term} months`],
            ]}
          />
        </AppSection>
        <AppSection title="Collateral & host account" filled={filled.has("collateral")}>
          <Kv
            rows={[
              ["Collateral", "12345678; 12345689"],
              ["Managed account", "Included"],
              ["Host account", "9502050"],
            ]}
          />
        </AppSection>
        <AppSection title="Life insurance" filled={filled.has("insurance")}>
          <Kv
            rows={[
              ["Policy", "LI-20417"],
              ["Insurer", "Northwind Life"],
              ["Market value", money(1250000)],
            ]}
          />
        </AppSection>
        <AppSection title="Underwriting" filled={filled.has("underwriting")}>
          <Kv
            rows={[
              ["Calculated FBI", "17/20"],
              ["Documents", "PFS, 2025 tax returns"],
              ["Underwriting team", "Team A"],
            ]}
          />
        </AppSection>
      </section>
    </div>
  );
}
