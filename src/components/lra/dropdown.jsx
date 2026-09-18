import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FRAME_H, useFrame } from "./frame";
import { Icon } from "./ui";

/* Dropdown — a select that lives inside the scaled prototype. A native
   <select> opens a browser-drawn list at full size, ignoring the frame's
   scale, so it looks twice the size of its field. This listbox renders in
   the frame's overlay layer, in canvas pixels: the menu is exactly as wide
   as its trigger and set at the same size as the inputs.

   Keyboard: Enter / Space / ↓ opens; ↑ ↓ Home End move; Enter picks;
   Escape or Tab closes; typing jumps to the first match. */

const norm = (o) => (typeof o === "string" ? { value: o, label: o } : o);

export default function Dropdown({ id, value, onChange, options, placeholder, label, compact = false }) {
  const frame = useFrame();
  const autoId = useId();
  const triggerId = id ?? `${autoId}-trigger`;
  const listId = `${autoId}-list`;
  const items = options.map(norm);
  const selected = items.find((o) => o.value === value);

  const trigger = useRef(null);
  const list = useRef(null);
  const [pos, setPos] = useState(null); // null when closed
  const [active, setActive] = useState(0);
  const open = pos !== null;

  function openMenu() {
    const t = trigger.current.getBoundingClientRect();
    const k = frame?.scale || 1;
    const c = frame?.canvas.current?.getBoundingClientRect() ?? { left: 0, top: 0 };
    const top = (t.bottom - c.top) / k + 4;
    const height = Math.min(items.length * (compact ? 36 : 40) + 10, 320);
    const flip = frame && top + height > FRAME_H - 8;
    setPos({
      left: (t.left - c.left) / k,
      width: t.width / k,
      ...(flip ? { top: (t.top - c.top) / k - 4 - height } : { top }),
    });
    setActive(Math.max(0, items.findIndex((o) => o.value === value)));
  }

  function close(refocus = true) {
    setPos(null);
    if (refocus) trigger.current?.focus();
  }

  function pick(o) {
    onChange(o.value);
    close();
  }

  useEffect(() => {
    if (!open) return;
    list.current?.focus();
    const outside = (e) => {
      if (!trigger.current?.contains(e.target) && !list.current?.contains(e.target)) close(false);
    };
    const scrolled = (e) => {
      if (!list.current?.contains(e.target)) close(false);
    };
    document.addEventListener("pointerdown", outside);
    window.addEventListener("scroll", scrolled, true);
    window.addEventListener("resize", scrolled);
    return () => {
      document.removeEventListener("pointerdown", outside);
      window.removeEventListener("scroll", scrolled, true);
      window.removeEventListener("resize", scrolled);
    };
  }, [open]);

  // Keep the active option in view
  useEffect(() => {
    if (open) list.current?.querySelector(`[data-i="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  function onTriggerKey(e) {
    if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(e.key)) {
      e.preventDefault();
      openMenu();
    }
  }

  function onListKey(e) {
    const last = items.length - 1;
    if (e.key === "ArrowDown") setActive((a) => Math.min(a + 1, last));
    else if (e.key === "ArrowUp") setActive((a) => Math.max(a - 1, 0));
    else if (e.key === "Home") setActive(0);
    else if (e.key === "End") setActive(last);
    else if (e.key === "Enter" || e.key === " ") items[active] && pick(items[active]);
    else if (e.key === "Escape") close();
    else if (e.key === "Tab") close(false);
    else if (e.key.length === 1) {
      const i = items.findIndex((o) => o.label.toLowerCase().startsWith(e.key.toLowerCase()));
      if (i >= 0) setActive(i);
      return;
    } else return;
    if (e.key !== "Tab") e.preventDefault();
  }

  const menu = open && (
    <ul
      ref={list}
      id={listId}
      role="listbox"
      tabIndex={-1}
      aria-label={label}
      aria-labelledby={label ? undefined : triggerId}
      aria-activedescendant={`${listId}-${active}`}
      className={"lra-dd-menu" + (compact ? " is-compact" : "") + (frame ? "" : " is-inline")}
      style={frame ? pos : undefined}
      onKeyDown={onListKey}
    >
      {items.map((o, i) => (
        <li
          key={o.value}
          id={`${listId}-${i}`}
          data-i={i}
          role="option"
          aria-selected={o.value === value}
          className={"lra-dd-option" + (i === active ? " is-active" : "")}
          onMouseEnter={() => setActive(i)}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => pick(o)}
        >
          <span>{o.label}</span>
          {o.value === value && <Icon name="check" size={compact ? 16 : 20} />}
        </li>
      ))}
    </ul>
  );

  return (
    <span className={"lra-dd" + (compact ? " is-compact" : "")}>
      <button
        ref={trigger}
        id={triggerId}
        type="button"
        className={"lra-dd-trigger" + (selected ? "" : " is-placeholder")}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={label}
        onClick={() => (open ? close() : openMenu())}
        onKeyDown={onTriggerKey}
      >
        <span className="lra-dd-value">{selected ? selected.label : placeholder}</span>
        <Icon name="expand" size={compact ? 16 : 20} />
      </button>
      {menu && (frame?.layer ? createPortal(menu, frame.layer) : menu)}
    </span>
  );
}
