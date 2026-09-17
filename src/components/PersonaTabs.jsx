import { useId, useRef, useState } from "react";
import "./PersonaTabs.css";

/* Interactive persona set — one tab per persona, WAI-ARIA tabs pattern:
   arrow keys / Home / End move between tabs and select as they go, and only
   the selected tab sits in the Tab order.

   Each persona is laid out as a one-pager: a profile column (portrait, name,
   quote, key attributes) beside a grid of titled boxes, with the long-form
   detail — scenarios, journeys, frameworks — running full width beneath.
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
        <li className="cs-pt-pill md-label-medium" key={item}>
          {item}
        </li>
      ))}
    </ul>
  );
}

function SectionBody({ section: s }) {
  switch (s.kind) {
    case "list": {
      const cols = s.columns || (s.wide ? 2 : 1);
      return (
        <ul className="cs-pt-list md-body-medium" style={{ "--cs-pt-cols": cols }}>
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
              <p className="cs-pt-group-label md-label-medium">{g.label}</p>
              <Pills items={g.items} />
            </div>
          ))}
        </div>
      );

    case "table":
      return (
        <div className="cs-pt-table-wrap">
          <table className="cs-pt-table md-body-medium">
            <thead>
              <tr>
                {s.columns.map((c) => (
                  <th scope="col" className="md-label-medium" key={c}>
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {s.rows.map((row) => (
                <tr key={row[0]}>
                  {row.map((cell, ci) =>
                    ci === 0 ? (
                      <th scope="row" key={ci}>
                        {cell}
                      </th>
                    ) : (
                      <td data-label={s.columns[ci]} key={ci}>
                        {cell}
                      </td>
                    )
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "journey":
      return (
        <ol className="cs-pt-journey">
          {s.items.map((step, i) => (
            <li className="cs-pt-journey-step" key={step.title}>
              <span className="cs-pt-journey-num md-label-medium" aria-hidden="true">
                {i + 1}
              </span>
              <strong className="cs-pt-journey-title md-title-small">{step.title}</strong>
              <span className="cs-pt-journey-text md-body-small">{step.text}</span>
              <span className="cs-pt-mood md-label-small">{step.mood}</span>
            </li>
          ))}
        </ol>
      );

    case "mapping":
      return (
        <ul className="cs-pt-map md-body-medium">
          {s.items.map((row) => (
            <li className="cs-pt-map-row" key={row.problem}>
              <span className="cs-pt-map-problem">{row.problem}</span>
              <span className="cs-pt-map-arrow" aria-hidden="true">
                →
              </span>
              <span className="cs-pt-map-solution">{row.solution}</span>
            </li>
          ))}
        </ul>
      );

    default:
      return null;
  }
}

function Box({ section: s }) {
  return (
    <div className={"cs-pt-box" + (s.wide ? " is-wide" : "")}>
      <div className="cs-pt-box-head">
        <h6 className="cs-pt-box-title md-title-small">{s.title}</h6>
        {s.note && <p className="cs-pt-note md-body-small">{s.note}</p>}
      </div>
      <div className="cs-pt-box-body">
        {s.text && <p className="cs-pt-text md-body-medium">{s.text}</p>}
        <SectionBody section={s} />
      </div>
    </div>
  );
}

function Persona({ persona: p }) {
  const grid = p.sections.filter((s) => !s.wide);
  const detail = p.sections.filter((s) => s.wide);

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

        <blockquote className="cs-pt-quote md-body-medium">“{p.quote}”</blockquote>
        <p className="cs-pt-summary md-body-small">{p.summary}</p>

        <dl className="cs-pt-attrs">
          {p.stats.map((st) => (
            <div className="cs-pt-attr" key={st.label}>
              <dt className="md-label-medium">{st.label}</dt>
              <dd className="md-body-small">
                <span className="cs-pt-attr-value">{st.value}</span>
                {st.note && <span className="cs-pt-attr-note">{st.note}</span>}
              </dd>
            </div>
          ))}

          {p.roleDetail && (
            <div className="cs-pt-attr">
              <dt className="md-label-medium">Role</dt>
              <dd className="md-body-small">
                {p.roleDetail.text && <p className="cs-pt-attr-text">{p.roleDetail.text}</p>}
                <SectionBody section={{ ...p.roleDetail, columns: 1 }} />
              </dd>
            </div>
          )}

          <div className="cs-pt-attr">
            <dt className="md-label-medium">Characteristics</dt>
            <dd>
              <ul className="cs-pt-traits">
                {p.traits.map((t) => (
                  <li className="cs-pt-trait md-label-medium" key={t}>
                    {t}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        </dl>
      </div>

      <div className="cs-pt-grid">
        {grid.map((s) => (
          <Box section={s} key={s.title} />
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
  const stripRef = useRef(null);
  const tabRefs = useRef([]);

  function select(i, { focus = false } = {}) {
    setActive(i);
    const tab = tabRefs.current[i];
    const strip = stripRef.current;
    if (focus && tab) tab.focus({ preventScroll: true });

    // Narrow screens scroll the tab strip sideways — keep the chosen tab in it.
    if (strip && tab) {
      const left = tab.offsetLeft;
      const right = left + tab.offsetWidth;
      if (left < strip.scrollLeft) strip.scrollLeft = left - 16;
      else if (right > strip.scrollLeft + strip.clientWidth)
        strip.scrollLeft = right - strip.clientWidth + 16;
    }

    // Panels run long. If the reader switches tabs from partway down one, the
    // strip is stuck under the nav — bring the new persona in from its name.
    const root = rootRef.current;
    if (root && strip) {
      const stickyTop = parseFloat(getComputedStyle(strip).top) || 0;
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
      <div
        className="cs-pt-tabs"
        role="tablist"
        aria-label={label}
        ref={stripRef}
        onKeyDown={onKeyDown}
        style={{ "--cs-pt-count": personas.length }}
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
            className={"cs-pt-tab md-title-small" + (i === active ? " is-active" : "")}
            onClick={() => select(i)}
          >
            {p.name}
          </button>
        ))}
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
