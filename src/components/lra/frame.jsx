import { createContext, useContext, useLayoutEffect, useRef, useState } from "react";
import { Icon } from "./ui";

/* ScaledFrame — the prototypes are designed for a 1920×1080 (Full HD)
   screen. Each one runs inside a simulated desktop browser window drawn on
   a 1920×1080 canvas (browser chrome on top, the app filling the rest),
   which then scales down uniformly to the width it's given — so every
   viewer sees the Full HD layout. Popovers that must escape scroll boxes
   (menus) portal into the frame's overlay layer, in canvas coordinates, so
   they scale with it. */

// The prototypes' typeface, loaded once, only when a prototype is
if (typeof document !== "undefined" && !document.getElementById("lra-font")) {
  const link = document.createElement("link");
  link.id = "lra-font";
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600&display=swap";
  document.head.append(link);
}

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

export function ScaledFrame({ title, path = "/", children }) {
  const outer = useRef(null);
  const inner = useRef(null);
  const [layer, setLayer] = useState(null);
  const [scale, setScale] = useState(0);

  useLayoutEffect(() => {
    const el = outer.current;
    const fit = () => setScale(el.clientWidth / FRAME_W);
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="lra-frame" ref={outer} style={{ height: FRAME_H * scale }}>
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
  );
}
