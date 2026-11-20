import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Icon } from "./ui";

/* ScaledFrame — the prototypes are designed for a 1920×1080 (Full HD)
   screen. Each one runs inside a simulated desktop browser window drawn on
   a 1920×1080 canvas (browser chrome on top, the app filling the rest),
   which then scales down uniformly to the width it's given — so every
   viewer sees the Full HD layout. Popovers that must escape scroll boxes
   (menus) portal into the frame's overlay layer, in canvas coordinates, so
   they scale with it. */

export const FRAME_W = 1920;
export const FRAME_H = 1080;

// Sample host for the address bar — a reserved .example domain, not a real site
const HOST = "connect.privatebank.example";

const FrameContext = createContext(null);
export const useFrame = () => useContext(FrameContext);

/* Browser chrome: a tab strip with window controls, then a toolbar with
   navigation and the address bar. Decorative, so hidden from assistive tech. */
function BrowserChrome({ title, path }) {
  return (
    <div className="lra-browser-chrome" aria-hidden="true">
      <div className="lra-browser-tabs">
        <span className="lra-browser-lights">
          <span />
          <span />
          <span />
        </span>
        <span className="lra-browser-tab">
          <span className="lra-browser-favicon">C</span>
          <span className="lra-browser-tab-title">{title}</span>
          <Icon name="close" size={16} />
        </span>
        <span className="lra-browser-newtab">
          <Icon name="add" size={20} />
        </span>
      </div>
      <div className="lra-browser-toolbar">
        <span className="lra-browser-nav">
          <Icon name="arrowBack" size={22} />
          <Icon name="arrowForward" size={22} />
          <Icon name="refresh" size={22} />
        </span>
        <span className="lra-browser-address">
          <Icon name="lock" size={16} />
          <span>
            <span className="lra-browser-host">{HOST}</span>
            {path}
          </span>
        </span>
        <span className="lra-browser-profile">W</span>
        <Icon name="moreVert" size={22} />
      </div>
    </div>
  );
}

/* Below this width the column can't show the whole 1920 canvas legibly (it would be ~18%),
   so the frame keeps the canvas at a readable size and lets the visitor drag around it,
   with a full-screen view for more room. Tablets and up still scale to fit. */
const COMPACT_BELOW = 600;
const READ_SCALE = 0.6;

export function ScaledFrame({ title, path = "/", children }) {
  const outer = useRef(null);
  const inner = useRef(null);
  const [layer, setLayer] = useState(null);
  const [scale, setScale] = useState(0);
  const [compact, setCompact] = useState(false);
  const [full, setFull] = useState(false);
  const [fit, setFit] = useState(false); // full screen only: the whole canvas on screen at once

  useLayoutEffect(() => {
    const el = outer.current;
    const measure = () => {
      const w = el.clientWidth;
      if (full) {
        const h = el.clientHeight;
        // zoomed in: readable, and tall enough that a portrait screen has no empty band below
        setScale(fit ? Math.min(w / FRAME_W, h / FRAME_H) : Math.max(READ_SCALE, h / FRAME_H));
      } else {
        const c = w < COMPACT_BELOW;
        setCompact(c);
        setScale(c ? READ_SCALE : w / FRAME_W);
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [full, fit]);

  // Full screen: lock the page behind it, and let Escape close it
  useEffect(() => {
    if (!full) return undefined;
    const onKey = (e) => e.key === "Escape" && setFull(false);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [full]);

  const flowHeight = compact ? `min(${FRAME_H * scale}px, 70svh)` : FRAME_H * scale;

  return (
    <>
      <div
        className={"lra-frame" + (compact ? " is-compact" : "") + (full ? " is-full" : "")}
        ref={outer}
        style={full ? undefined : { height: flowHeight }}
      >
        <div
          className="lra-frame-canvas"
          ref={inner}
          style={{ width: FRAME_W, height: FRAME_H, transform: `scale(${scale})` }}
        >
          <FrameContext.Provider value={{ scale, canvas: inner, layer }}>
            <BrowserChrome title={title} path={path} />
            <div className="lra-browser-viewport">{children}</div>
            <div className="lra-frame-layer" ref={setLayer} />
          </FrameContext.Provider>
        </div>
      </div>
      {/* keeps the page from jumping while the frame is lifted out into full screen */}
      {full && <div aria-hidden="true" style={{ height: flowHeight }} />}
      {compact && !full && (
        <button type="button" className="btn btn-secondary lra-frame-expand" onClick={() => setFull(true)}>
          Open full screen
        </button>
      )}
      {full && (
        <div className="lra-frame-bar">
          <button type="button" className="btn btn-secondary" aria-pressed={fit} onClick={() => setFit((v) => !v)}>
            {fit ? "Zoom in" : "Fit to screen"}
          </button>
          <button type="button" className="btn btn-primary" onClick={() => setFull(false)}>
            Close
          </button>
        </div>
      )}
    </>
  );
}
