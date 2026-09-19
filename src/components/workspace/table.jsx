import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "../lra/ui";
import { FRAME_H, useFrame } from "../lra/frame";

/* M3 menu — portalled into the scaled frame's overlay layer (so a table's
   scroll box can't clip it) and placed under its trigger in canvas
   coordinates, so it scales with the app. Closes on Escape, an outside
   click or scroll; arrow keys move between items.
   Pass `children` for a labelled trigger (styled by triggerClassName /
   triggerProps) instead of the default icon button; align="left" hangs the
   menu from the trigger's left edge. */
export function Menu({
  label,
  icon = "moreVert",
  items,
  onSelect,
  className = "",
  align = "right",
  triggerClassName = "lra-icon-btn",
  triggerProps,
  children,
}) {
  const [pos, setPos] = useState(null); // null when closed
  const wrap = useRef(null);
  const menu = useRef(null);
  const menuId = useId();
  const frame = useFrame();
  const open = pos !== null;

  useEffect(() => {
    if (!open) return;
    menu.current?.querySelector('[role^="menuitem"]')?.focus();
    const outside = (e) => {
      if (!wrap.current?.contains(e.target) && !menu.current?.contains(e.target)) setPos(null);
    };
    const close = (e) => {
      if (!menu.current?.contains(e.target)) setPos(null);
    };
    document.addEventListener("pointerdown", outside);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("pointerdown", outside);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  function toggle() {
    if (open) return setPos(null);
    // Trigger position, converted from screen pixels to canvas pixels
    const r = wrap.current.getBoundingClientRect();
    const f = frame.canvas.current.getBoundingClientRect();
    const k = frame.scale;
    const top = (r.bottom - f.top) / k + 4;
    const below = FRAME_H - top > 280;
    setPos({
      ...(align === "left"
        ? { left: Math.max(8, (r.left - f.left) / k) }
        : { right: Math.max(8, (f.right - r.right) / k) }),
      ...(below ? { top } : { bottom: (f.bottom - r.top) / k + 4 }),
    });
  }

  function onKeyDown(e) {
    const list = [...(menu.current?.querySelectorAll('[role^="menuitem"]') ?? [])];
    const i = list.indexOf(document.activeElement);
    if (e.key === "Escape" || e.key === "Tab") {
      setPos(null);
      if (e.key === "Escape") wrap.current?.querySelector("button")?.focus();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      list[(i + 1) % list.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      list[(i - 1 + list.length) % list.length]?.focus();
    }
  }

  return (
    <div className={`ws-menu-wrap ${className}`} ref={wrap}>
      <button
        type="button"
        className={triggerClassName}
        aria-label={children ? undefined : label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={toggle}
        {...triggerProps}
      >
        {children ?? <Icon name={icon} />}
      </button>
      {open &&
        frame.layer &&
        createPortal(
          <div className="ws-portal">
            <div
              className="ws-menu"
              role="menu"
              id={menuId}
              aria-label={label}
              ref={menu}
              style={pos}
              onKeyDown={onKeyDown}
            >
              {items.map((item) =>
                item.checked !== undefined ? (
                  <button
                    key={item.label}
                    type="button"
                    role="menuitemcheckbox"
                    aria-checked={item.checked}
                    className="ws-menu-item"
                    onClick={() => onSelect(item)}
                  >
                    <span className={"ws-menu-check" + (item.checked ? " is-on" : "")} aria-hidden="true">
                      {item.checked && <Icon name="check" size={16} />}
                    </span>
                    {item.label}
                  </button>
                ) : (
                  <button
                    key={item.label}
                    type="button"
                    role="menuitem"
                    className={
                      "ws-menu-item" + (item.current ? " is-current" : "") + (item.disabled ? " is-off" : "")
                    }
                    aria-current={item.current ? "page" : undefined}
                    aria-disabled={item.disabled || undefined}
                    onClick={() => {
                      setPos(null);
                      wrap.current?.querySelector("button")?.focus();
                      onSelect(item);
                    }}
                  >
                    <span className="ws-menu-label">{item.label}</span>
                    {item.current && <Icon name="check" size={18} />}
                  </button>
                )
              )}
            </div>
          </div>,
          frame.layer
        )}
    </div>
  );
}

const compare = (a, b) =>
  typeof a === "number" && typeof b === "number" ? a - b : String(a).localeCompare(String(b));

/* Data table with a toolbar: Filter (a text filter over every column),
   Download XLS, and a column selector. Headers sort. */
export function DataTable({ caption, columns, rows, rowActions, onPlaceholder, dense }) {
  const uid = useId();
  const [sort, setSort] = useState(null); // { key, dir }
  const [hidden, setHidden] = useState(() => new Set());
  const [filtering, setFiltering] = useState(false);
  const [query, setQuery] = useState("");

  const shown = columns.filter((c) => !hidden.has(c.key));
  const q = query.trim().toLowerCase();
  let list = q
    ? rows.filter((r) => columns.some((c) => String(c.text ? c.text(r) : r[c.key]).toLowerCase().includes(q)))
    : rows;
  if (sort) {
    list = [...list].sort((a, b) => compare(a[sort.key], b[sort.key]) * (sort.dir === "asc" ? 1 : -1));
  }

  function toggleSort(key) {
    setSort((s) =>
      s?.key !== key ? { key, dir: "asc" } : s.dir === "asc" ? { key, dir: "desc" } : null
    );
  }

  return (
    <div className="ws-table">
      <div className="ws-toolbar">
        <p className="ws-count" aria-live="polite">
          {list.length} of {rows.length} rows
        </p>
        <div className="ws-toolbar-btns">
          <button
            type="button"
            className={"lra-btn is-ghost" + (filtering ? " is-active" : "")}
            aria-pressed={filtering}
            onClick={() => {
              setFiltering((f) => !f);
              setQuery("");
            }}
          >
            <Icon name="filter" size={18} />
            Filter
          </button>
          <button type="button" className="lra-btn is-ghost" onClick={() => onPlaceholder("Download XLS isn't part of this prototype.")}>
            <Icon name="download" size={18} />
            Download XLS
          </button>
          <Menu
            label="Choose columns"
            icon="columns"
            items={columns.map((c) => ({ label: c.label, key: c.key, checked: !hidden.has(c.key) }))}
            onSelect={(item) =>
              setHidden((h) => {
                const next = new Set(h);
                if (next.has(item.key)) next.delete(item.key);
                else if (shown.length > 1) next.add(item.key);
                return next;
              })
            }
          />
        </div>
      </div>

      {filtering && (
        <div className="lra-field ws-filter">
          <label htmlFor={`${uid}-q`}>Filter rows</label>
          <input
            id={`${uid}-q`}
            autoFocus
            placeholder="Type a name, ECI, stage…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      )}

      <div className="lra-table-wrap">
        <table className={"lra-table" + (dense ? " is-dense" : "")}>
          <caption className="lra-sr">{caption}</caption>
          <thead>
            <tr>
              {shown.map((c) => {
                const dir = sort?.key === c.key ? sort.dir : null;
                return (
                  <th
                    key={c.key}
                    scope="col"
                    className={c.num ? "is-num" : ""}
                    aria-sort={dir === "asc" ? "ascending" : dir === "desc" ? "descending" : "none"}
                  >
                    <button type="button" className="ws-sort" onClick={() => toggleSort(c.key)}>
                      {c.label}
                      <span className={"ws-sort-icon" + (dir ? " is-on" : "")} aria-hidden="true">
                        <Icon name={dir === "desc" ? "arrowDown" : "arrowUp"} size={16} />
                      </span>
                    </button>
                  </th>
                );
              })}
              {rowActions && (
                <th scope="col">
                  <span className="lra-sr">Actions</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr>
                <td colSpan={shown.length + (rowActions ? 1 : 0)} className="ws-empty-cell">
                  No rows match “{query}”.
                </td>
              </tr>
            )}
            {list.map((r) => (
              <tr key={r.id}>
                {shown.map((c, i) =>
                  i === 0 ? (
                    <th key={c.key} scope="row">
                      {c.render ? c.render(r) : r[c.key]}
                    </th>
                  ) : (
                    <td key={c.key} className={c.num ? "is-num" : ""}>
                      {c.render ? c.render(r) : r[c.key]}
                    </td>
                  )
                )}
                {rowActions && (
                  <td>
                    <Menu
                      label={`Actions for ${r[columns[0].key]}`}
                      items={rowActions.map((a) => ({ label: a }))}
                      onSelect={(item) => onPlaceholder(`“${item.label}” isn't part of this prototype.`)}
                    />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
