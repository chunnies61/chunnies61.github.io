import { lazy, Suspense } from "react";
import { useSearchParams } from "react-router-dom";

/* A capture page for producing images with headless Chrome. Not linked
   anywhere.
   - /capture            renders the Workspace prototype at its full 1920px
                         canvas, unframed; ?h=<px> sets the app window's
                         height (default 984).
   - /capture?what=og    renders the 1200×630 link-preview card. */

const WorkspacePrototype = lazy(() => import("../components/workspace/WorkspacePrototype"));

const CHROME = `
  body { margin: 0; background: #fff; }
  .nav, footer { display: none !important; }
  main { padding: 0 !important; margin: 0 !important; }
`;

/* The card people see when the site's link is shared */
function OgCard() {
  return (
    <div className="og">
      <style>{`
        ${CHROME}
        .og { position: relative; display: flex; width: 1200px; height: 630px; overflow: hidden; background: #fff; font-family: "Poppins", sans-serif; color: #333945; }
        .og-copy { display: flex; flex: 0 0 660px; flex-direction: column; justify-content: center; padding: 64px 56px 64px 72px; }
        .og-logo { width: 150px; height: auto; margin-bottom: 44px; }
        .og-name { margin: 0; font-family: "Bricolage Grotesque", sans-serif; font-size: 72px; line-height: 1.02; font-weight: 700; letter-spacing: -0.02em; color: #1b1f28; }
        .og-role { margin: 20px 0 0; font-size: 28px; line-height: 1.35; font-weight: 500; color: #1e57c8; }
        .og-sub { margin: 10px 0 0; font-size: 22px; line-height: 1.45; color: #5b6472; }
        .og-url { margin: 40px 0 0; font-size: 20px; font-weight: 600; letter-spacing: 0.01em; color: #1b1f28; }
        .og-art { display: flex; flex: 1; align-items: center; justify-content: center; padding: 0 8px 0 0; background: #126bc5; }
        .og-art img { display: block; width: 100%; height: auto; }
      `}</style>
      <div className="og-copy">
        <img className="og-logo" src="/images/logo-dcc224.svg" alt="" />
        <h1 className="og-name">Yichun Liu</h1>
        <p className="og-role">Staff Product Designer</p>
        <p className="og-sub">Fintech, healthtech &amp; SaaS — 7+ years turning complex workflows into products people adopt.</p>
        <p className="og-url">yichuns.com</p>
      </div>
      <div className="og-art">
        <img src="/images/og-laptop.png" alt="" />
      </div>
    </div>
  );
}

export default function Capture() {
  const [params] = useSearchParams();
  if (params.get("what") === "og") return <OgCard />;

  const h = Number(params.get("h")) || 984;
  const total = h + 96; // the browser chrome sits above the window
  return (
    <div className="capture" style={{ width: 1920 }}>
      <style>{`
        ${CHROME}
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
