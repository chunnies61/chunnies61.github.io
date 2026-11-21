/* Google Analytics helpers. The tag itself loads in index.html, and only on yichuns.com,
   so these do nothing in local previews. */

// Send a GA4 event, e.g. track("select_case_study", { case_study: "Agent Desk" }).
export function track(event, params = {}) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", event, params);
  }
}
