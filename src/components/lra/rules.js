import {
  COLLATERALS,
  FACILITIES,
  PEAK_LIMIT_USD,
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
    ...freshBuilder(currency),
  };
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
    blockers: [
      [],
      required,
      required.length ? ["complete the required fields in Loan details"] : [],
      [],
    ],
  };
}
