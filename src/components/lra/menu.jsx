import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FRAME_H, useFrame } from "./frame";
import { Icon } from "./ui";

/* Menu — the less-frequent actions behind a ⋯ button. Like the Dropdown
   it renders in the frame's overlay layer, in canvas pixels, opening
   right-aligned to its trigger. When one of its items is the selected
   action, the trigger shows that item with a check instead of the dots,
   so the choice stays visible where it was made; picking it again clears it.

   Keyboard: Enter / Space / ↓ opens; ↑ ↓ Home End move; Enter picks;
   Escape or Tab closes. */

const WIDTH = 220;
const ROW = 36;

export default function Menu({ label, items, value, onSelect }) {
  const frame = useFrame();
  const id = useId();
  const menuId = `${id}-menu`;
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
    const height = items.length * ROW + 10;
    const flip = frame && top + height > FRAME_H - 8;
    setPos({
      left: (t.right - c.left) / k - WIDTH,
      width: WIDTH,
      ...(flip ? { top: (t.top - c.top) / k - 4 - height } : { top }),
    });
    setActive(Math.max(0, items.indexOf(value)));
  }

  function close(refocus = true) {
    setPos(null);
    if (refocus) trigger.current?.focus();
  }

  function pick(item) {
    onSelect(item, item === value);
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
    else if (e.key === "Enter" || e.key === " ") pick(items[active]);
    else if (e.key === "Escape") close();
    else if (e.key === "Tab") close(false);
    else return;
    if (e.key !== "Tab") e.preventDefault();
  }

  const menu = open && (
    <ul
      ref={list}
      id={menuId}
      role="menu"
      tabIndex={-1}
      aria-label={label}
      className={"lra-dd-menu is-compact" + (frame ? "" : " is-inline")}
      style={frame ? pos : undefined}
      onKeyDown={onListKey}
    >
      {items.map((item, i) => (
        <li
          key={item}
          role="menuitemradio"
          aria-checked={item === value}
          className={"lra-dd-option" + (i === active ? " is-active" : "")}
          onMouseEnter={() => setActive(i)}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => pick(item)}
        >
          <span>{item}</span>
          {item === value && <Icon name="check" size={16} />}
        </li>
      ))}
    </ul>
  );

  const shared = {
    type: "button",
    "aria-haspopup": "menu",
    "aria-expanded": open,
    "aria-controls": open ? menuId : undefined,
    onClick: () => (open ? close() : openMenu()),
    onKeyDown: onTriggerKey,
  };

  return (
    <>
      {value ? (
        <button ref={trigger} className="lra-btn is-ghost is-on" aria-label={`${label}: ${value}`} {...shared}>
          <Icon name="check" size={18} />
          {value}
          <Icon name="expand" size={18} />
        </button>
      ) : (
        <button ref={trigger} className="lra-icon-btn" aria-label={label} {...shared}>
          <Icon name="moreHoriz" />
        </button>
      )}
      {menu && (frame?.layer ? createPortal(menu, frame.layer) : menu)}
    </>
  );
}
