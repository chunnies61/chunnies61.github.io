import "./IAMap.css";

/* Information architecture map, laid out as a classic site-map tree:

     L1 products ──── one column head each, joined by a bus
       │
       ├─ L2 app ──┬─ L3 page
       │           └─ L3 page
       ├─ L2 app ──── L3 page
       ⋮

   Only the current product has apps mapped beneath it; the others are
   heads alone. Every connector is drawn in CSS from the list structure, so
   the tree needs no measuring and holds at any length of data. */

export default function IAMap({ block }) {
  const { products, apps, personaFilter } = block;

  return (
    <div className="cs-ia">
      <header className="cs-ia-head">
        <div className="cs-ia-intro">
          <h5 className="cs-ia-title md-headline-small">{block.title}</h5>
          <p className="cs-ia-subtitle md-body-small">{block.subtitle}</p>
          <ul className="cs-ia-legend md-label-small" aria-label="Levels">
            <li>
              <span className="cs-ia-key is-l1" aria-hidden="true" />
              L1 · Products
            </li>
            <li>
              <span className="cs-ia-key is-l2" aria-hidden="true" />
              L2 · Apps
            </li>
            <li>
              <span className="cs-ia-key is-l3" aria-hidden="true" />
              Pages
            </li>
          </ul>
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

      {/* Wide diagram: scrolls sideways on narrow screens rather than
          collapsing the tree */}
      <div className="cs-ia-scroll">
        <ul className="cs-ia-tree" aria-label={block.label}>
          {products.map((prod) => (
            <li
              key={prod.name}
              className={"cs-ia-col" + (prod.current ? " is-current" : "")}
            >
              <span
                className="cs-ia-node is-l1 md-label-large"
                aria-current={prod.current ? "true" : undefined}
              >
                {prod.current && (
                  <span className="cs-ia-star" aria-hidden="true">
                    ★
                  </span>
                )}
                {prod.name}
              </span>

              {prod.current && (
                <ol className="cs-ia-apps">
                  {apps.map((app) => (
                    <li key={app.name} className="cs-ia-app">
                      <span className="cs-ia-node is-l2 md-label-medium">{app.name}</span>
                      <ul className="cs-ia-pages">
                        {app.pages.length ? (
                          app.pages.map((page) => (
                            <li key={page} className="cs-ia-page">
                              <span className="cs-ia-node is-l3 md-body-small">{page}</span>
                            </li>
                          ))
                        ) : (
                          <li className="cs-ia-page">
                            <span className="cs-ia-node is-l3 is-empty md-body-small">
                              Not yet mapped
                            </span>
                          </li>
                        )}
                      </ul>
                    </li>
                  ))}
                </ol>
              )}
            </li>
          ))}
        </ul>
      </div>

      {block.footer && <p className="cs-ia-footer md-label-small">{block.footer}</p>}
    </div>
  );
}
