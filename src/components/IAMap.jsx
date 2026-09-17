import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import "./IAMap.css";

/* Interactive information architecture map, read top to bottom:
   L1 products → L2 apps → the pages inside the selected app.

   A Primary line runs from the current product down to its apps, and the
   pages panel carries a notch pointing back at the selected app, so the
   active path stays traceable at any width. Apps follow the WAI-ARIA tabs
   pattern: arrow keys / Home / End move and select. */

function pageCount(pages) {
  if (!pages.length) return "Not yet mapped";
  return pages.length === 1 ? "1 page" : `${pages.length} pages`;
}

export default function IAMap({ block }) {
  const { products, apps, personaFilter } = block;
  const initial = Math.max(
    0,
    apps.findIndex((a) => a.name === block.defaultApp)
  );
  const [active, setActive] = useState(initial);
  const [geo, setGeo] = useState({ l1: null, notch: null });
  const [fontsTick, setFontsTick] = useState(0);

  const baseId = useId();
  const treeRef = useRef(null);
  const productRef = useRef(null);
  const appsRef = useRef(null);
  const panelRef = useRef(null);
  const appRefs = useRef([]);

  // Place the L1 → L2 line under the current product, and the panel's notch
  // under the selected app. Re-measured on selection and on any resize.
  useLayoutEffect(() => {
    const tree = treeRef.current;
    if (!tree) return undefined;

    const measure = () => {
      const t = tree.getBoundingClientRect();
      const prod = productRef.current?.getBoundingClientRect();
      const grid = appsRef.current?.getBoundingClientRect();
      const app = appRefs.current[active]?.getBoundingClientRect();
      const panel = panelRef.current?.getBoundingClientRect();
      setGeo({
        l1:
          prod && grid
            ? {
                left: prod.left + prod.width / 2 - t.left,
                top: prod.bottom - t.top,
                height: Math.max(0, grid.top - prod.bottom),
              }
            : null,
        notch: app && panel ? app.left + app.width / 2 - panel.left : null,
      });
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(tree);
    return () => ro.disconnect();
  }, [active, fontsTick]);

  // Web fonts can land after first paint and shift every width — measure again.
  useEffect(() => {
    let live = true;
    document.fonts?.ready.then(() => live && setFontsTick((t) => t + 1));
    return () => {
      live = false;
    };
  }, []);

  function select(i, focus = false) {
    setActive(i);
    if (focus) appRefs.current[i]?.focus();
  }

  function onKeyDown(e) {
    const n = apps.length;
    const next = {
      ArrowRight: (active + 1) % n,
      ArrowDown: (active + 1) % n,
      ArrowLeft: (active - 1 + n) % n,
      ArrowUp: (active - 1 + n) % n,
      Home: 0,
      End: n - 1,
    }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    select(next, true);
  }

  const app = apps[active];

  return (
    <div className="cs-ia">
      <header className="cs-ia-head">
        <div className="cs-ia-intro">
          <h5 className="cs-ia-title md-headline-small">{block.title}</h5>
          <p className="cs-ia-subtitle md-body-small">{block.subtitle}</p>
        </div>

        {personaFilter && (
          <div className="cs-ia-filter">
            <div className="cs-ia-filter-options" role="group" aria-label="Persona view">
              {personaFilter.options.map((opt, i) => (
                <button
                  key={opt}
                  type="button"
                  className={"cs-ia-filter-option md-label-medium" + (i === 0 ? " is-active" : "")}
                  aria-pressed={i === 0}
                  // Only "All" is live: there's no persona → app mapping yet,
                  // matching the work-in-progress state of the real product.
                  disabled={i !== 0}
                >
                  {opt}
                </button>
              ))}
            </div>
            <p className="cs-ia-filter-note md-body-small">{personaFilter.note}</p>
          </div>
        )}
      </header>

      <div className="cs-ia-tree" ref={treeRef}>
        {geo.l1 && (
          <span
            className="cs-ia-line"
            aria-hidden="true"
            style={{ left: geo.l1.left, top: geo.l1.top, height: geo.l1.height }}
          />
        )}

        <section className="cs-ia-level">
          <p className="cs-ia-level-label md-label-medium">
            <span className="cs-ia-level-badge md-label-small">L1</span>
            Products
          </p>
          <ul className="cs-ia-products">
            {products.map((prod) => (
              <li
                key={prod.name}
                ref={prod.current ? productRef : undefined}
                className={"cs-ia-product md-label-large" + (prod.current ? " is-current" : "")}
                aria-current={prod.current ? "true" : undefined}
              >
                {prod.current && (
                  <span className="cs-ia-star" aria-hidden="true">
                    ★
                  </span>
                )}
                {prod.name}
              </li>
            ))}
          </ul>
        </section>

        <section className="cs-ia-level">
          <p className="cs-ia-level-label md-label-medium">
            <span className="cs-ia-level-badge md-label-small">L2</span>
            Apps &amp; Pages
          </p>
          <div
            className="cs-ia-apps"
            role="tablist"
            aria-label={`${block.title} apps`}
            ref={appsRef}
            onKeyDown={onKeyDown}
          >
            {apps.map((a, i) => (
              <button
                key={a.name}
                ref={(el) => (appRefs.current[i] = el)}
                type="button"
                role="tab"
                id={`${baseId}-app-${i}`}
                aria-selected={i === active}
                aria-controls={`${baseId}-pages`}
                tabIndex={i === active ? 0 : -1}
                className={"cs-ia-app" + (i === active ? " is-active" : "")}
                onClick={() => select(i)}
              >
                <span className="cs-ia-app-num md-label-small" aria-hidden="true">
                  {i + 1}
                </span>
                <span className="cs-ia-app-name md-label-large">{a.name}</span>
                <span className="cs-ia-app-count md-body-small">{pageCount(a.pages)}</span>
              </button>
            ))}
          </div>
        </section>

        <section
          className="cs-ia-pages"
          role="tabpanel"
          id={`${baseId}-pages`}
          aria-labelledby={`${baseId}-app-${active}`}
          ref={panelRef}
          style={geo.notch != null ? { "--cs-ia-notch": `${geo.notch}px` } : undefined}
        >
          <div className="cs-ia-pages-head">
            <h6 className="cs-ia-pages-title md-label-large">
              <span className="cs-ia-level-badge md-label-small">L3</span>
              {app.name}
              <span className="cs-ia-pages-count md-body-small">{pageCount(app.pages)}</span>
            </h6>
            <p className="cs-ia-hint md-body-small">{block.hint}</p>
          </div>

          {app.pages.length ? (
            <ul className="cs-ia-page-list">
              {app.pages.map((page) => (
                <li key={page} className="cs-ia-page md-body-small">
                  {page}
                </li>
              ))}
            </ul>
          ) : (
            <p className="cs-ia-empty md-body-small">Not yet mapped</p>
          )}
        </section>
      </div>

      {block.footer && <p className="cs-ia-footer md-label-small">{block.footer}</p>}
    </div>
  );
}
