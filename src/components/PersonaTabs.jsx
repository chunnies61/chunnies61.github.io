import { useId, useRef, useState } from "react";
import "./PersonaTabs.css";

/* Interactive persona set — one tab per persona, WAI-ARIA tabs pattern:
   arrow keys / Home / End move between tabs and select as they go, and only
   the selected tab sits in the Tab order.

   Each persona is laid out as a one-pager: a profile column (portrait, name,
   quote, key attributes) beside a grid of titled boxes. Sections marked
   "span" run across both grid columns; any marked "wide" run full width
   beneath the sheet.
   Every persona uses the same box order, so switching tabs compares like
   with like. */

function ListItem({ item, inline }) {
  if (typeof item === "string") return <li>{item}</li>;
  // Inline items read "Label — text" when the text continues the label
  // ("Drive business growth — expand loan originations…") and "Label: text"
  // when it is its own sentence. Wide multi-column lists stack the label.
  const sep = /^[a-z]/.test(item.text) ? " — " : ": ";
  return (
    <li>
      <strong className={"cs-pt-item-label" + (inline ? "" : " is-block")}>{item.label}</strong>
      {inline && sep}
      {item.text}
    </li>
  );
}

function Pills({ items }) {
  return (
    <ul className="cs-pt-pills">
      {items.map((item) => (
        <li className="cs-pt-pill md-label-small" key={item}>
          {item}
        </li>
      ))}
    </ul>
  );
}

function SectionBody({ section: s }) {
  switch (s.kind) {
    case "list": {
      // Wide lists run up to four across (5 and 6 items take three) so the
      // long-form rows stay short.
      const n = s.items.length;
      const cols = s.columns || (s.wide ? (n <= 4 ? n : 3) : s.span ? 2 : 1);
      return (
        <ul
          className={"cs-pt-list md-body-small" + (s.bullets ? " is-bulleted" : "")}
          style={{ "--cs-pt-cols": cols }}
        >
          {s.items.map((item, i) => (
            <ListItem item={item} inline={cols === 1} key={i} />
          ))}
        </ul>
      );
    }

    case "pills":
      return <Pills items={s.items} />;

    case "groups":
      return (
        <div className="cs-pt-groups">
          {s.items.map((g) => (
            <div className="cs-pt-group" key={g.label}>
              <p className="cs-pt-group-label md-label-small">{g.label}</p>
              <Pills items={g.items} />
            </div>
          ))}
        </div>
      );

    default:
      return null;
  }
}

function Box({ section: s, altStripe = false }) {
  return (
    <div
      className={
        "cs-pt-box" +
        (s.wide ? " is-wide" : "") +
        (s.span ? " is-span" : "") +
        (altStripe ? " is-alt" : "")
      }
    >
      <div className="cs-pt-box-head">
        <h6 className="cs-pt-box-title md-label-large">
          {s.emoji && (
            <span className="cs-pt-box-emoji" aria-hidden="true">
              {s.emoji}
            </span>
          )}
          <span className="cs-pt-box-title-text">{s.title}</span>
        </h6>
        {s.note && <p className="cs-pt-note md-body-small">{s.note}</p>}
      </div>
      <div className="cs-pt-box-body">
        {s.text && <p className="cs-pt-text md-body-small">{s.text}</p>}
        <SectionBody section={s} />
      </div>
    </div>
  );
}

function Persona({ persona: p }) {
  const grid = p.sections.filter((s) => !s.wide);
  const detail = p.sections.filter((s) => s.wide);

  // Checkerboard the title stripes across the right column. Spanning boxes
  // take a whole row, which nth-child can't see, so walk the rows here.
  let row = 0;
  let col = 0;
  const altStripe = grid.map((s) => {
    if (s.span) {
      if (col) {
        row += 1;
        col = 0;
      }
      return row++ % 2 === 1;
    }
    const alt = (row + col) % 2 === 1;
    col += 1;
    if (col === 2) {
      row += 1;
      col = 0;
    }
    return alt;
  });

  return (
    <div className="cs-pt-sheet">
      <div className="cs-pt-profile">
        <div className="cs-pt-portrait" aria-hidden="true">
          {p.avatar}
        </div>

        <div className="cs-pt-id">
          <h5 className="cs-pt-name md-headline-small">{p.name}</h5>
          <p className="cs-pt-role md-body-small">{p.role}</p>
        </div>

        <blockquote className="cs-pt-quote md-body-small">“{p.quote}”</blockquote>
        <p className="cs-pt-summary md-body-small">{p.summary}</p>

        <dl className="cs-pt-attrs">
          {p.stats.map((st) => (
            <div className="cs-pt-attr" key={st.label}>
              <dt className="md-label-small">{st.label}</dt>
              <dd className="md-body-small">
                <span className="cs-pt-attr-value">{st.value}</span>
                {st.note && <span className="cs-pt-attr-note">{st.note}</span>}
              </dd>
            </div>
          ))}

          {p.roleDetail && (
            <div className="cs-pt-attr">
              <dt className="md-label-small">Role</dt>
              <dd className="md-body-small">
                {p.roleDetail.text && <p className="cs-pt-attr-text">{p.roleDetail.text}</p>}
                <SectionBody section={{ ...p.roleDetail, columns: 1 }} />
              </dd>
            </div>
          )}

          <div className="cs-pt-attr">
            <dt className="md-label-small">Characteristics</dt>
            <dd>
              <ul className="cs-pt-traits">
                {p.traits.map((t) => (
                  <li className="cs-pt-trait md-label-small" key={t}>
                    {t}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        </dl>
      </div>

      <div className="cs-pt-grid">
        {grid.map((s, i) => (
          <Box section={s} altStripe={altStripe[i]} key={s.title} />
        ))}
      </div>

      {detail.length > 0 && (
        <div className="cs-pt-detail">
          {detail.map((s) => (
            <Box section={s} key={s.title} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function PersonaTabs({ personas, label }) {
  const [active, setActive] = useState(0);
  const baseId = useId();
  const rootRef = useRef(null);
  const barRef = useRef(null);
  const stripRef = useRef(null);
  const tabRefs = useRef([]);

  function select(i, { focus = false } = {}) {
    setActive(i);
    const tab = tabRefs.current[i];
    const strip = stripRef.current;
    if (focus && tab) tab.focus({ preventScroll: true });

    // Narrow screens scroll the tab strip sideways — keep the chosen tab in it.
    // The strip snaps to each tab's start edge, so scroll to exactly that
    // edge: any in-between offset would just snap back to where it was.
    if (strip && tab) {
      const left = tab.offsetLeft;
      const right = left + tab.offsetWidth;
      const outOfView = left < strip.scrollLeft || right > strip.scrollLeft + strip.clientWidth;
      if (outOfView) {
        const pad = parseFloat(getComputedStyle(strip).paddingLeft) || 0;
        strip.scrollLeft = left - pad;
      }
    }

    // Panels run long. If the reader switches tabs from partway down one, the
    // strip is stuck under the nav — bring the new persona in from its name.
    const root = rootRef.current;
    const bar = barRef.current;
    if (root && bar) {
      const stickyTop = parseFloat(getComputedStyle(bar).top) || 0;
      const top = root.getBoundingClientRect().top;
      if (top < stickyTop) {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({
          top: window.scrollY + top - stickyTop,
          // "auto" would defer to the site's html { scroll-behavior: smooth }
          behavior: reduce ? "instant" : "smooth",
        });
      }
    }
  }

  function onKeyDown(e) {
    const n = personas.length;
    const next = {
      ArrowRight: (active + 1) % n,
      ArrowLeft: (active - 1 + n) % n,
      Home: 0,
      End: n - 1,
    }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    select(next, { focus: true });
  }

  return (
    <div className="cs-pt" ref={rootRef}>
      <div className="cs-pt-bar" ref={barRef}>
        <div
          className="cs-pt-tabs"
          role="tablist"
          aria-label={label}
          ref={stripRef}
          onKeyDown={onKeyDown}
        >
          {personas.map((p, i) => (
            <button
              key={p.id}
              ref={(el) => (tabRefs.current[i] = el)}
              type="button"
              role="tab"
              id={`${baseId}-tab-${p.id}`}
              aria-selected={i === active}
              aria-controls={`${baseId}-panel-${p.id}`}
              tabIndex={i === active ? 0 : -1}
              className={"cs-pt-tab" + (i === active ? " is-active" : "")}
              onClick={() => select(i)}
            >
              <span className="cs-pt-tab-avatar" aria-hidden="true">
                {p.avatar}
              </span>
              <span className="cs-pt-tab-name md-label-large">{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      {personas.map((p, i) => (
        <div
          key={p.id}
          role="tabpanel"
          id={`${baseId}-panel-${p.id}`}
          aria-labelledby={`${baseId}-tab-${p.id}`}
          className="cs-pt-panel"
          hidden={i !== active}
          tabIndex={0}
        >
          <Persona persona={p} />
        </div>
      ))}
    </div>
  );
}
