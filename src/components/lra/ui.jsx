/* Shared bits for the prototypes: the Icon component (Iconstica line icons —
   see icons.generated.js and scripts/build-icons.mjs) and the tonal banner. */
import { ICONS } from "./icons.generated";

export const ICON_NAMES = Object.keys(ICONS);

export function Icon({ name, size = 24 }) {
  const parts = ICONS[name];
  return (
    <svg
      className="lra-icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {parts?.map((props, i) => (
        <path key={i} {...props} />
      ))}
    </svg>
  );
}

const BANNER_ICON = { info: "info", warning: "warning", success: "checkCircle" };

/* A form field: label above, the control, then an error or a hint */
export function Field({ label, error, hint, children, id, required = false }) {
  return (
    <div className={"lra-field" + (error ? " has-error" : "")}>
      <label htmlFor={id}>
        {label}
        {required && (
          <span className="lra-req" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </label>
      {children}
      {error ? (
        <p className="lra-field-error" id={`${id}-err`}>
          {error}
        </p>
      ) : (
        hint && <p className="lra-field-hint">{hint}</p>
      )}
    </div>
  );
}

/* A titled block of a step */
export function Section({ title, children, aside }) {
  return (
    <section className="lra-section">
      <div className="lra-section-head">
        <h4>{title}</h4>
        {aside}
      </div>
      {children}
    </section>
  );
}

export function Banner({ tone = "info", children }) {
  return (
    <div className={`lra-banner is-${tone}`} role={tone === "warning" ? "alert" : "status"}>
      <Icon name={BANNER_ICON[tone]} />
      <p>{children}</p>
    </div>
  );
}

/* Toggle — the black segmented switch above a prototype. Equal-width
   options on a gray-800 track; a white thumb slides to the selected one. The
   label is announced (aria-label) but not shown. An
   option's `tip` renders inside its cell (for hover tooltips). */
export function Toggle({ label, options, value, onChange }) {
  const index = Math.max(
    0,
    options.findIndex((o) => o.id === value)
  );
  return (
    <div className="lra-toggle-row">
      <div
        className="lra-toggle"
        role="group"
        aria-label={label}
        style={{ "--n": options.length, "--i": index }}
      >
        <span className="lra-toggle-thumb" aria-hidden="true" />
        {options.map((o) => {
          const on = o.id === value;
          return (
            <span key={o.id} className={"lra-toggle-cell" + (o.tip ? " has-tip" : "")}>
              <button
                type="button"
                className={"lra-toggle-btn" + (on ? " is-on" : "")}
                aria-pressed={on}
                aria-describedby={o.tipId}
                onClick={() => !on && onChange(o.id)}
              >
                {o.label}
              </button>
              {o.tip}
            </span>
          );
        })}
      </div>
    </div>
  );
}
