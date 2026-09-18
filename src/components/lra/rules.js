import {
  EQUITY_CONCENTRATION_LIMIT,
  FACILITIES,
  MAX_TENOR_MONTHS,
  PEAK_LIMIT_USD,
} from "./data";

export const num = (v) => {
  const n = Number(String(v ?? "").replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
};

export const money = (n, ccy) =>
  `${num(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${
    ccy ? ` ${ccy}` : ""
  }`;

export function emptyDeal() {
  return {
    parties: [],
    loading: false,
    facilityId: null,
    facilityAction: null,
    build: null, // null | "sbl" | "custom"
    collateralTab: "collaterals",
    collaterals: [],
    collateralCcy: {},
    hostMode: "existing",
    hostAccount: null,
    facilityType: "",
    fields: {},
    lineSize: "",
    currency: "USD",
    assetType: "Equities",
    crfUploaded: false,
    offer: null,
    cdsDismissed: false,
  };
}

/* Step 1 rules. Returns the field errors, the reasons Continue is blocked
   (in the order a user meets them), and which banners/fly-ins to show. */
export function assess(deal, region) {
  const ga = Boolean(region.compliance);
  const f = deal.fields;
  const facility = FACILITIES.find((x) => x.id === deal.facilityId);
  const errors = {};

  if (deal.build === "sbl" && deal.facilityType === "FX/OTC Derivatives") {
    if (num(f.peakLimit) > PEAK_LIMIT_USD)
      errors.peakLimit = "Exceeds the USD 2.5MM peak limit — handled as a Custom ticket.";
    if (num(f.tenor) > MAX_TENOR_MONTHS)
      errors.tenor = "Exceeds 10 years (120 months) — handled as a Custom ticket.";
  }

  const needsComment =
    ga &&
    deal.build === "sbl" &&
    deal.facilityType === "Global limit" &&
    num(f.equityConc) > EQUITY_CONCENTRATION_LIMIT;
  if (needsComment && !String(f.comment ?? "").trim())
    errors.comment = "Equity concentration is above 40% — a supporting comment is required.";

  // Worded to follow "To continue:" in the footer
  const reasons = [];
  if (!deal.parties.length) reasons.push("add at least one party");
  if (facility?.kind === "custom") reasons.push("a Tailored (Custom) facility is selected");
  if (deal.build === "sbl" && !deal.crfUploaded) reasons.push("upload the Credit Request Form");
  if (errors.peakLimit || errors.tenor) reasons.push("resolve the facility validation errors");
  if (errors.comment) reasons.push("add a supporting comment");
  if (deal.parties.length && facility?.kind !== "sbl" && !deal.offer)
    reasons.push("select a Streamlined facility or create an offer");

  return {
    errors,
    reasons,
    needsComment,
    canContinue: reasons.length === 0,
    showSafCal: ga && deal.build === "sbl",
    showCds:
      ga &&
      deal.build === "sbl" &&
      deal.facilityType === "FX/OTC Derivatives" &&
      f.txnType === "CDS" &&
      !deal.cdsDismissed,
  };
}
