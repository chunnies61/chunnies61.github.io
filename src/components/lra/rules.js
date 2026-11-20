import {
  AMEND_ORIGINAL,
  COLLATERALS,
  FACILITIES,
  PEAK_LIMIT_USD,
  STEPS,
  TENOR_RULES,
  UNSECURED_TYPES,
} from "./data";

export const num = (v) => {
  const n = Number(String(v ?? "").replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
};

export const money = (n, ccy) =>
  `${num(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${
    ccy ? ` ${ccy}` : ""
  }`;

/* The Loan details fields, empty */
export function freshBuilder(currency = "USD") {
  return {
    collateralTab: "collaterals",
    collaterals: [],
    collateralCcy: {},
    hostMode: "existing",
    hostAccounts: [],
    facilityType: "",
    fields: {},
    lineSize: "",
    currency,
    assetType: "Equities",
    documents: [],
    note: "",
    offers: null, // the three indicative offers, once created
    offer: null, // the chosen one
  };
}

/* The Loan details fields for an action on an existing facility: its
   current terms, ready to be changed */
export function builderFor(fac, currency) {
  return {
    ...freshBuilder(currency),
    facilityType: fac.type,
    lineSize: String(fac.lineValue),
    collaterals: fac.collateral.split(", ").filter((a) => COLLATERALS.some((c) => c.acct === a)),
  };
}

export function emptyDeal(currency = "USD") {
  return {
    parties: [],
    loading: false,
    facilityId: null,
    facilityAction: null,
    build: null, // null | "sbl" | "custom"
    // A tailored (Custom) deal: the few things Credit's Custom intake needs
    custom: { facilityType: "Advised line", lineSize: "", teamComment: "", team: "", risk: "" },
    amend: null, // an amendment's updated terms, started when Amend is chosen
    annual: null, // a submitted annual review: { newNrd, comment }
    ...freshBuilder(currency),
  };
}

/* Which flow the request is in. An annual review runs from a dialog and goes straight to its
   ticket, so it only shows up here once submitted. */
export function flowOf(deal) {
  if (deal.annual) return "annual";
  if (deal.build === "custom") return "custom";
  if (deal.facilityAction === "Amend") return "amendment";
  return "sbl";
}

// An amendment skips the credit questionnaire
export const stepsFor = (deal) => (flowOf(deal) === "amendment" ? STEPS.slice(0, 3) : STEPS);

/* --- Amendment ------------------------------------------------------------------- */

export const amendFor = () => ({
  parties: AMEND_ORIGINAL.parties.map((p) => ({ ...p })),
  pricing: { ...AMEND_ORIGINAL.pricing },
  collaterals: [...AMEND_ORIGINAL.collaterals],
  covenants: { ...AMEND_ORIGINAL.covenants },
});

const partyKey = (p) => `${p.name}|${p.role}`;

/* What an amendment changes, section by section. Each list is the lines that differ; an empty
   one means the section is unchanged. */
export function amendDiff(amend) {
  if (!amend) return { clients: [], pricing: [], collateral: [], covenants: [], total: 0 };
  const o = AMEND_ORIGINAL;
  const had = new Set(o.parties.map(partyKey));
  const has = new Set(amend.parties.map(partyKey));
  const clients = [
    ...amend.parties.filter((p) => !had.has(partyKey(p))).map((p) => ({ kind: "new", p })),
    ...o.parties.filter((p) => !has.has(partyKey(p))).map((p) => ({ kind: "deleted", p })),
  ];
  const pricing = [];
  if (amend.pricing.mode !== o.pricing.mode) pricing.push("mode");
  if (amend.pricing.mode === "Exception") {
    if (amend.pricing.baseRate !== o.pricing.baseRate) pricing.push("baseRate");
    if (amend.pricing.spread !== o.pricing.spread) pricing.push("spread");
  }
  const collateral = [
    ...amend.collaterals.filter((a) => !o.collaterals.includes(a)).map((a) => ({ kind: "new", a })),
    ...o.collaterals.filter((a) => !amend.collaterals.includes(a)).map((a) => ({ kind: "deleted", a })),
  ];
  const covenants = Object.keys(amend.covenants).filter(
    (id) => (amend.covenants[id] ?? "").trim() !== (o.covenants[id] ?? "").trim()
  );
  return {
    clients,
    pricing,
    collateral,
    covenants,
    total: clients.length + pricing.length + collateral.length + covenants.length,
  };
}

/* --- Annual review --------------------------------------------------------------- */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const fmtDate = (iso) => {
  const [y, m, d] = iso.split("-");
  return `${d}-${MONTHS[+m - 1]}-${y}`;
};

// "28-Oct-2027" or "2027-10-28" to an ISO day, or null
export function parseDate(text) {
  const t = String(text ?? "").trim();
  let y, m, d;
  let hit = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (hit) [, y, m, d] = hit;
  else if ((hit = t.match(/^(\d{1,2})[-\s/]([A-Za-z]{3})[a-z]*[-\s/](\d{4})$/))) {
    [, d, , y] = hit;
    m = MONTHS.findIndex((x) => x.toLowerCase() === hit[2].toLowerCase()) + 1;
  } else return null;
  const dt = new Date(Date.UTC(+y, +m - 1, +d));
  if (!m || dt.getUTCMonth() !== +m - 1 || dt.getUTCDate() !== +d) return null;
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

// The same day, `n` months on (the month's last day when it is shorter)
export function addMonths(iso, n) {
  const [y, m, d] = iso.split("-").map(Number);
  const first = new Date(Date.UTC(y, m - 1 + n, 1));
  const last = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
  const out = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), Math.min(d, last)));
  return out.toISOString().slice(0, 10);
}

export const hasCrf = (deal) => deal.documents.some((d) => d.id === "crf");

/* The three indicative offers for what's been entered, generated when the
   user asks. Line size and facility type are the only inputs it needs;
   collateral and host accounts refine it when present. */
export function offersFor(deal) {
  const line = num(deal.lineSize);
  const picked = COLLATERALS.filter((c) => deal.collaterals.includes(c.acct));
  const eml = picked.some((c) => c.emlLv !== "—");
  const base = {
    facilityType: deal.facilityType,
    collaterals: picked.map((c) => c.acct),
    host: deal.hostMode === "new" ? "New host account" : deal.hostAccounts.join(", ") || "To be assigned",
  };
  return [
    {
      ...base,
      id: "term",
      name: "Fixed term loan",
      structure: "36-month term, bullet repayment",
      rate: "SOFR + 1.85%",
      lineSize: money(line, deal.currency),
      recommended: true,
      eligible: true,
    },
    {
      ...base,
      id: "revolving",
      name: "Revolving line",
      structure: "Draw and repay freely, annual review",
      rate: "SOFR + 2.10%",
      lineSize: money(line, deal.currency),
      eligible: true,
    },
    {
      ...base,
      id: "eml",
      name: "Enhanced lending line",
      structure: "24-month term at EML lending values",
      rate: "SOFR + 1.65%",
      lineSize: money(line * 1.2, deal.currency),
      eml: true,
      eligible: eml,
    },
  ];
}

/* Wizard rules. Nothing hard-blocks except the two required fields —
   facility type and requested line size — checked when the user tries to
   continue past Loan details or to submit. Everything else is guidance:
   field errors that explain, and a soft hint per step in the footer. */
export function assess(deal, region) {
  const ccy = region.currency ?? "USD";
  const f = deal.fields;
  const facility = FACILITIES.find((x) => x.id === deal.facilityId);
  // In the builder: a new SBL deal, or an action on an existing SBL facility
  const building = deal.build === "sbl" || (facility?.kind === "sbl" && Boolean(deal.facilityAction));
  const errors = {};

  if (deal.facilityType === "FX/OTC derivatives" && num(f.peakLimit) > PEAK_LIMIT_USD)
    errors.peakLimit = `Exceeds the ${ccy} 2.5MM peak limit — handled as a Custom ticket.`;

  /* Tenor is capped per facility type. Over the cap the facility is no longer
     SBL-eligible, so it stops being a streamlined deal. */
  const tenor = TENOR_RULES[deal.facilityType];
  const tenorOverLimit = Boolean(tenor?.max) && num(f.tenor) > tenor.max;
  if (tenorOverLimit) errors.tenor = `Enter tenor <= ${tenor.max} months.`;

  // Unsecured facilities carry no collateral and get no detailed results
  const unsecured = UNSECURED_TYPES.includes(deal.facilityType);

  // The required fields
  const missing = {
    facilityType: !deal.facilityType,
    lineSize: num(deal.lineSize) <= 0,
    tenor: Boolean(tenor?.required) && !String(f.tenor ?? "").trim(),
  };
  const required = [];
  if (missing.facilityType) required.push("select a facility type");
  if (missing.lineSize) required.push("enter the requested line size");
  if (missing.tenor) required.push("enter the tenor");

  // Soft hints, one per step — shown in the footer, never blocking
  const hints = [
    !deal.parties.length
      ? "Add at least one party."
      : !building && deal.build !== "custom"
        ? "Choose an action on an existing facility, or build a new deal."
        : "",
    !hasCrf(deal)
      ? "Attach the Credit Request Form before submitting — Credit will ask for it."
      : !deal.offer
        ? "Create an offer to see indicative terms."
        : "",
    "",
    "Check the returned client data, then submit.",
  ];
  let blockers = [
    [],
    required,
    required.length ? ["complete the required fields in Loan details"] : [],
    [],
  ];

  const flow = flowOf(deal);

  /* A tailored (Custom) deal: line size, a team comment and a team are needed to start it, and
     Credit wants the risk and mitigants written up. Missing documents are only a hint. */
  const c = deal.custom;
  const customMissing = {
    lineSize: num(c.lineSize) <= 0,
    teamComment: !c.teamComment.trim(),
    team: !c.team,
    risk: !c.risk.trim(),
  };
  if (flow === "custom") {
    const start = [];
    if (customMissing.lineSize) start.push("enter a line size greater than 0");
    if (customMissing.teamComment) start.push("add a team comment");
    if (customMissing.team) start.push("assign a team");
    const details = customMissing.risk ? ["enter the risk & mitigants"] : [];
    blockers = [start, details, details.length ? ["complete the required fields in Loan details"] : [], []];
    hints[0] = !deal.parties.length ? "Add at least one party." : "";
    hints[1] = !hasCrf(deal) ? "Attach the Credit Request Form — Credit will ask for it." : "";
  }

  /* An amendment needs something to amend: the review can't go until a section has changed */
  const diff = amendDiff(deal.amend);
  if (flow === "amendment") {
    blockers = [[], [], diff.total ? [] : ["make at least one change in Loan details"], []];
    hints[1] = diff.total ? "" : "Edit a section to make a change — an amendment needs at least one.";
    hints[2] = "";
  }

  return {
    errors,
    missing,
    building,
    facility,
    hints,
    tenor,
    tenorOverLimit,
    unsecured,
    sblEligible: !unsecured && !tenorOverLimit,
    flow,
    customMissing,
    diff,
    blockers,
  };
}
