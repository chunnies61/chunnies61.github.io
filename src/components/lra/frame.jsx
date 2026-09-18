import { createContext, useContext, useLayoutEffect, useRef, useState } from "react";

/* ScaledFrame — the prototypes are designed for a 1920×1080 (Full HD)
   screen. The app always lays out on a 1920×1080 canvas, then scales down
   uniformly to the width it's given, so every viewer sees the Full HD
   layout. Popovers that must escape scroll boxes (menus) portal into the
   frame's overlay layer, in canvas coordinates, so they scale with it. */

export const FRAME_W = 1920;
export const FRAME_H = 1080;

const FrameContext = createContext(null);
export const useFrame = () => useContext(FrameContext);

export function ScaledFrame({ children }) {
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
          {children}
          <div className="lra-frame-layer" ref={setLayer} />
        </FrameContext.Provider>
      </div>
    </div>
  );
}
