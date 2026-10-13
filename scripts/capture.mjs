// Screenshot a page with headless Chrome over the DevTools protocol, waiting
// for a selector (and web fonts) before capturing. Used with the /capture
// page to make the case-study hero and the link-preview card.
//
//   node scripts/capture.mjs <url> <selector> <out.png> <width> <height> [scale]
//
// e.g. node scripts/capture.mjs "http://localhost:5173/capture?what=og" .og-url og.png 1200 630 2
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const [url, selector, out, W, H, S] = process.argv.slice(2);
if (!url || !selector || !out || !W || !H) {
  console.error("usage: node scripts/capture.mjs <url> <selector> <out.png> <width> <height> [scale]");
  process.exit(1);
}
const width = Number(W), height = Number(H), scale = Number(S || 1);
const port = 9333;
const profile = mkdtempSync(join(tmpdir(), "cdp-"));
const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
  "--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run", "--no-default-browser-check",
  `--user-data-dir=${profile}`, `--remote-debugging-port=${port}`, `--window-size=${width},${height}`, "about:blank",
], { stdio: "ignore" });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function targets() {
  for (let i = 0; i < 50; i++) {
    try { const r = await fetch(`http://127.0.0.1:${port}/json`); if (r.ok) return r.json(); } catch {}
    await sleep(200);
  }
  throw new Error("Chrome did not start");
}
const page = (await targets()).find((t) => t.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0; const pending = new Map();
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });

try {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: scale, mobile: false });
  await send("Page.enable");
  await send("Page.navigate", { url });
  let ready = false;
  for (let i = 0; i < 100 && !ready; i++) {
    const r = await send("Runtime.evaluate", { expression: `!!document.querySelector(${JSON.stringify(selector)}) && document.fonts.status === 'loaded'`, returnByValue: true });
    ready = r.result?.result?.value === true;
    if (!ready) await sleep(200);
  }
  if (!ready) throw new Error(`Timed out waiting for ${selector}`);
  await sleep(800); // let layout and images settle
  const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  writeFileSync(out, Buffer.from(shot.result.data, "base64"));
  console.log("saved", out);
} finally {
  ws.close();
  chrome.kill("SIGKILL");
}
