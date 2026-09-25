import { lazy, Suspense } from "react";
import { useSearchParams } from "react-router-dom";

/* A capture page for producing marketing images: renders a prototype at its
   full 1920px canvas, unframed, so headless Chrome can screenshot it.
   ?h=<px> sets the app window's height (default 984). Not linked anywhere. */

const WorkspacePrototype = lazy(() => import("../components/workspace/WorkspacePrototype"));

export default function Capture() {
  const [params] = useSearchParams();
  const h = Number(params.get("h")) || 984;
  const total = h + 96; // the browser chrome sits above the window
  return (
    <div className="capture" style={{ width: 1920 }}>
      <style>{`
        body { margin: 0; background: #fff; }
        .nav, footer { display: none !important; }
        main { padding: 0 !important; margin: 0 !important; }
        .capture .lra-frame { width: 1920px !important; height: ${total}px !important; border: 0 !important; border-radius: 0 !important; box-shadow: none !important; }
        .capture .lra-frame-canvas { height: ${total}px !important; }
        .capture .lra-window { height: ${h}px !important; border: 0 !important; border-radius: 0 !important; }
      `}</style>
      <Suspense fallback={null}>
        <WorkspacePrototype />
      </Suspense>
    </div>
  );
}
