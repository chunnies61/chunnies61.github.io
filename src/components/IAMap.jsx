import { useEffect, useRef, useState } from "react";
import "./IAMap.css";

/* Information architecture map, after the Lending Workspace IA screen:

        L1 · Products        [★ Current] [Product] [Product] [Product]
                                          │
        L2 · Apps & Pages  ───────────────┴──────────────────────────
        [1 App]   [2 App]   [3 App]   …      ← scrolls sideways
        │ page    │ page    │ page
                  │ page    │ page

   Products and apps are filled nodes, unselected products are outlined,
   pages are pills. Connectors are CSS, placed from shared geometry tokens,
   so nothing is measured at runtime. */

export default function IAMap({ block }) {
  const { products, apps, personaFilter } = block;

  // The app row scrolls sideways, and overlay scrollbars stay hidden until
  // used — so fade whichever edge still has apps beyond it.
  const scrollRef = useRef(null);
  const [edges, setEdges] = useState({ left: false, right: false });

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return undefined;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      setEdges({ left: el.scrollLeft > 1, right: el.scrollLeft < max - 1 });
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);

  return (
    <div className="cs-ia">
      <header className="cs-ia-head">
        <div className="cs-ia-intro">
          {block.eyebrow && <p className="cs-ia-eyebrow md-label-small">{block.eyebrow}</p>}
          <h5 className="cs-ia-title md-headline-small">{block.title}</h5>
          <p className="cs-ia-subtitle md-body-small">{block.subtitle}</p>
        </div>

        {personaFilter && (
          <div className="cs-ia-filter">
            {personaFilter.label && (
              <p className="cs-ia-filter-label md-label-small">{personaFilter.label}</p>
            )}
            <div className="cs-ia-filter-options" role="group" aria-label="Persona view">
              {personaFilter.options.map((opt, i) => (
                <button
                  key={opt}
                  type="button"
                  className={"cs-ia-filter-option md-label-medium" + (i === 0 ? " is-active" : "")}
                  aria-pressed={i === 0}
                  // Only "All" is live: there's no persona → app mapping yet
                  disabled={i !== 0}
                >
                  {opt}
                </button>
              ))}
            </div>
            {personaFilter.note && (
              <p className="cs-ia-filter-note md-body-small">{personaFilter.note}</p>
            )}
          </div>
        )}
      </header>

      <ul className="cs-ia-legend md-label-small" aria-label="Legend">
        <li>
          <span className="cs-ia-key is-node" aria-hidden="true" />
          Product / App node
        </li>
        <li>
          <span className="cs-ia-key is-page" aria-hidden="true" />
          Page
        </li>
        <li>
          <span className="cs-ia-key is-other" aria-hidden="true" />
          Product (unselected)
        </li>
        <li>
          <span className="cs-ia-key is-empty" aria-hidden="true" />
          Not yet mapped
        </li>
      </ul>

      <div className="cs-ia-map" aria-label={block.label}>
        {/* L1 */}
        <p className="cs-ia-level md-label-small">L1 · Products</p>
        <ul className="cs-ia-products">
          {products.map((prod) => (
            <li
              key={prod.name}
              className={
                "cs-ia-node md-label-large " + (prod.current ? "is-product is-current" : "is-other")
              }
              aria-current={prod.current ? "true" : undefined}
            >
              {prod.name}
              {prod.current && (
                <span className="cs-ia-star" aria-hidden="true">
                  ★
                </span>
              )}
            </li>
          ))}
        </ul>

        {/* L1 → L2 */}
        <span className="cs-ia-drop" aria-hidden="true" />
        <p className="cs-ia-level is-l2 md-label-small">L2 · Apps &amp; Pages</p>

        {/* L2: one column per app, scrolling sideways */}
        <div
          ref={scrollRef}
          className={
            "cs-ia-scroll" +
            (edges.left ? " has-more-left" : "") +
            (edges.right ? " has-more-right" : "")
          }
        >
          <ol className="cs-ia-apps">
            {apps.map((app, i) => (
              <li key={app.name} className="cs-ia-app">
                <span className="cs-ia-node is-app md-label-large">
                  <span className="cs-ia-num md-label-small" aria-hidden="true">
                    {i + 1}
                  </span>
                  <span className="cs-ia-app-name">{app.name}</span>
                </span>
                <ul className="cs-ia-pages">
                  {app.pages.length ? (
                    app.pages.map((page) => (
                      <li key={page} className="cs-ia-node is-page md-body-small">
                        {page}
                      </li>
                    ))
                  ) : (
                    <li className="cs-ia-node is-page is-empty md-body-small">Not yet mapped</li>
                  )}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {block.footer && <p className="cs-ia-footer md-label-small">{block.footer}</p>}
    </div>
  );
}
