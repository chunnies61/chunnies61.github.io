/* Mock data for the Loan Request App prototype.
   Everything here is dummy: names, IDs, account numbers and amounts are
   invented and stand in for real client and bank data. */

// The prototype covers the EMEA flow only. Its currency is the one every
// amount is shown in.
export const EMEA = { id: "emea", label: "EMEA", currency: "EUR" };

export const STEPS = [
  "Client & facility",
  "Loan details",
  "Loan review",
  "Credit questionnaire",
];

// Clients the search returns. Two of them carry an eligibility block: the
// client can be found, but can't be added to a request.
export const CLIENTS = [
  {
    id: "c1",
    name: "Adam Ross",
    eci: "9876543210",
    ucn: "9876543210",
    account: "100200301",
    platform: "SGP",
    employee: "N",
    kyc: "Complete",
  },
  {
    id: "c2",
    name: "Carol Simpson",
    eci: "9876543211",
    ucn: "9876543211",
    account: "100200302",
    platform: "SGP",
    employee: "N",
    kyc: "Complete",
  },
  {
    id: "c3",
    name: "David Peterson",
    eci: "9876543212",
    ucn: "9876543212",
    account: "100200303",
    platform: "SGP",
    employee: "N",
    kyc: "Complete",
  },
  {
    id: "c4",
    name: "Maria Hoffmann",
    eci: "9876543213",
    ucn: "9876543213",
    account: "100200304",
    platform: "SGP",
    employee: "N",
    kyc: "Complete",
    error:
      "This client isn't eligible for this request because they're outside the applicable jurisdiction.",
  },
  {
    id: "c5",
    name: "James Okafor",
    eci: "9876543214",
    ucn: "9876543214",
    account: "100200305",
    platform: "HKG",
    employee: "Y",
    kyc: "Complete",
    error:
      "Hong-Kong employee clients are ineligible for submission. Please verify HKG client employee status.",
  },
];

export const CLIENT_SEARCH_PLACEHOLDER =
  "Search by ECI, UCN, facility number, account number";

export const ROLES = ["Borrower", "Guarantor"];

// Dates are counted against a fixed "as of" day so the prototype is stable
export const AS_OF = "2026-09-18";

export const FACILITIES_TOOLTIP =
  "This is the existing client facility for the borrower above. You can select one of the available actions to either amend the existing facility or build a new deal based on the existing facility.";

export const FACILITIES = [
  {
    id: "f1",
    kind: "sbl",
    badge: "Streamlined (SBL)",
    facilityId: "123456780",
    borrowers: "Adam Ross, Carol Simpson, David Peterson",
    lineValue: 1650000,
    drawn: 980000,
    type: "Advised line",
    opened: "2024-10-28",
    maturity: "28-Oct-2027",
    maturityDate: "2027-10-28",
    collateral: "9502050",
  },
];

export const COLLATERALS = [
  { acct: "9502050", owners: "Adam Ross", platform: "SGP", type: "Custody", pledged: "Yes", stdLv: "70%", emlLv: "80%", plv: "70%", mv: 3250000 },
  { acct: "9502051", owners: "Adam Ross, Carol Simpson", platform: "SGP", type: "Discretionary", pledged: "No", stdLv: "65%", emlLv: "75%", plv: "65%", mv: 6100000 },
  { acct: "9502052", owners: "David Peterson", platform: "SGP", type: "Brokerage", pledged: "No", stdLv: "50%", emlLv: "—", plv: "50%", mv: 1480000 },
];

export const DM_ACCOUNTS = [{ acct: "DM-000101", owner: "Adam Ross", status: "Active" }];

export const HOST_ACCOUNTS = [
  { acct: "500001", internal: "INT-0001" },
  { acct: "500002", internal: "INT-0002" },
];

// Actions on an existing facility: the two common paths are buttons, the
// rest sit behind an overflow menu
export const FACILITY_ACTIONS = ["Amendment", "Replace"];
export const FACILITY_MORE_ACTIONS = ["Annual review"];

// Sample documents the upload area attaches, in this order
export const DOCUMENTS = [
  { id: "crf", name: "credit-request-form.pdf", size: "1.2 MB", required: true },
  { id: "cal", name: "client-affirmation-letter.pdf", size: "640 KB" },
  { id: "saf", name: "suitability-assessment-form.pdf", size: "880 KB" },
];

export const FACILITY_TYPES = [
  "Advised line",
  "Committed term loan",
  "FX/OTC derivatives",
  "F&O/ETP derivatives",
  "SBLC and guarantees",
  "Hybrid line of credit",
  "Committed revolving line",
];

/* Tenor, by facility type. `hidden` leaves the field out; `fixed` shows it
   read-only at its default; otherwise it's editable and required, capped at
   `max`. Facility types not listed here hide the field. */
export const TENOR_RULES = {
  "FX/OTC derivatives": { default: "12", max: 120, required: true },
  "F&O/ETP derivatives": { default: "36", fixed: true },
  "Committed term loan": { default: "", max: 60, required: true },
  "SBLC and guarantees": { default: "", max: 60, required: true },
};

// Unsecured facilities carry no collateral and get no detailed results
export const UNSECURED_TYPES = ["Committed term loan", "SBLC and guarantees"];

export const CUSTOM_FACILITY_TYPES = ["Advised line", "Committed line", "Uncommitted line"];

export const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "SGD", "HKD", "AUD", "CNH"];

export const ASSET_TYPES = ["Other", "Cash", "Equities", "Fixed Income", "Mutual Funds", "Real Estate"];

export const TRANSACTION_TYPES = ["FX forward", "FX option", "Interest rate swap", "CDS"];

export const EXCHANGES = ["SGX", "HKEX", "Eurex", "CME"];

export const REPAYMENTS = ["Bullet", "Amortising"];

/* --- Loan details: pricing, purpose and rate structure (§4) ------------------ */

export const PRICING_MODES = ["Standard", "Exception"];

export const BASE_RATE_TYPES = ["Enhanced reference rate", "Base rate"];

export const PURPOSE_MODES = ["Non-purpose", "Purpose"];

export const LOAN_PURPOSES = [
  "General liquidity",
  "Real estate",
  "Personal business investment",
  "Personal expenditure",
  "Working capital",
  "General corporate purposes",
  "Debt refinancing",
  "Other",
];

export const REAL_ESTATE_PURPOSES = [
  "Acquisition residential",
  "Acquisition commercial",
  "Construction new residential",
  "Construction new commercial",
  "Construction rehabilitation residential",
  "Construction rehabilitation commercial",
  "Refinancing residential",
  "Refinancing commercial",
];

export const INTEREST_RATE_TYPES = ["Variable", "Fixed"];

export const RATE_OPTIONS = ["Enhanced reference rate", "Base rate"];

export const RATE_FUNDING_TENORS = ["Daily floating", "1 month", "2 months", "3 months"];

export const IR_PAYMENT_FREQUENCIES = [
  "Monthly",
  "Quarterly",
  "Weekly",
  "Bi-monthly",
  "Semi-annually",
  "Annually",
  "At maturity",
  "Other",
];

// Facility types that carry the interest rate structure. The review shows a
// dash for the rest.
export const RATE_STRUCTURE_TYPES = ["Hybrid line of credit", "Committed revolving line", "Committed term loan"];

export const SEND_TO = ["Front office", "Middle office"];

/* Financial based indicators — the grid in Loan details and its review */
export const FBI_ROWS = [
  { id: "netWorth", label: "Net Worth", value: 25000000, grade: "3", indicative: "3" },
  { id: "liquidity", label: "Unencumbered Liquidity", value: 8500000, grade: "4", indicative: "4" },
  { id: "leverage", label: "Leverage", value: 2.1, grade: "5", indicative: "5", ratio: true },
  { id: "dsc", label: "DSC", value: 1.8, grade: "5", indicative: "5", ratio: true },
  { id: "calculated", label: "Calculated FBI", value: 5, grade: "5", indicative: "5", ratio: true, total: true },
];

export const FBI_COMMENT_LABEL = "Brief overview of balance sheet / cash flows";
export const FBI_COMMENT_MAX = 5000;

export const COVENANTS = [
  { id: "NC006", title: "Minimum net worth", category: "Financial", description: "Net worth not to fall below EUR 20,000,000.", parties: "Adam Ross" },
  { id: "NC002", title: "Loan-to-value", category: "Collateral", description: "LTV not to exceed 70% of pledged market value.", parties: "Adam Ross, Carol Simpson" },
  { id: "NC005", title: "Reporting", category: "Information", description: "Annual financial statements within 120 days of year end.", parties: "Adam Ross" },
];

export const GUIDELINES = [
  {
    id: "NSC_0196",
    requirement: "Local collateral presence",
    approval: "Regional credit executive",
    detail: "Collateral is held on the SGP platform; EMEA booking requires a documented waiver.",
  },
];

export const WAIVE_OPTIONS = ["Not waived", "Waived", "Pending approval"];

/* --- Ticket (§2 summary bar and §11 submission) ------------------------------ */

export const TICKET = {
  number: "A12345678",
  account: "12345678",
  owner: "STEPHEN GREEN (F123456)",
  status: "DRAFT",
  client: "ADAM ROSS",
  eci: "9876543210",
};

export const SUBMIT_MESSAGE =
  "Loan origination request has been successfully Submitted. You can view and share ticket information.";

export const NO_SPREAD_NOTE =
  "Loan pricing entry couldn't be generated. The pricing request will be completed during a later review stage.";

export const RULES_TOOLTIP =
  "These are the credit engine rules the request was checked against. Each one is evaluated against the client, the collateral and the facility structure.";

// The twelve rules the engine reports on a streamlined deal
export const RULES = [
  { id: "1002", name: "Client type eligibility" },
  { id: "1003", name: "Final facility LGD" },
  { id: "1004", name: "Max position level LGD" },
  { id: "1005", name: "Non-IG country concentration" },
  { id: "1006", name: "Maximum single issuer" },
  { id: "1008", name: "Private equity LV" },
  { id: "1009", name: "Restricted stock LV" },
  { id: "1010", name: "Call credit flag — collateral account" },
  { id: "1011", name: "Call credit flag — facility" },
  { id: "1013", name: "High LGD / illiquid securities — position" },
  { id: "1014", name: "High LGD / illiquid securities — portfolio" },
  { id: "1017", name: "Local collateral presence" },
];

/* --- Credit questionnaire (§10) ---------------------------------------------- */

// `tone` names an existing .lra-pill variant
export const CQ_STATUSES = {
  returned: { label: "Client returned CQ", tone: "good" },
  waiting: { label: "Waiting for client", tone: "warn" },
  ready: { label: "Ready to send", tone: "neutral" },
};

export const QUESTIONNAIRES = [
  {
    id: "CQ-001",
    name: "Adam Ross",
    role: "Borrower",
    type: "Individual",
    status: "returned",
    message: "Submitted 03 Aug 2026, valid until 03 Aug 2027",
  },
  {
    id: "CQ-002",
    name: "Eva Ross",
    role: "Guarantor",
    type: "Individual",
    status: "waiting",
    message: "Sent via JPOI 05 Aug 2026",
  },
  {
    id: "CQ-003",
    name: "Ross Family Trust",
    role: "Pledgor",
    type: "Entity",
    status: "ready",
    message: "Not sent yet. Next step: send to the client via JPOI.",
  },
];

export const CQ_VALIDITY = {
  pending: "Valid for 1 year once the client submits",
  expired: (date) => `Expired on ${date} — a new questionnaire is required`,
};

/* The client data panel, by section. `prior` is the Aug 2025 figure the
   "compare with last year" view puts beside it. */
export const CQ_SECTIONS = [
  {
    id: "borrower",
    title: "Borrower information",
    rows: [
      { id: "name", label: "Full name", text: "Adam Ross" },
      { id: "dob", label: "Date of birth", text: "14 Mar 1971" },
      { id: "residence", label: "Country of residence", text: "Germany" },
      { id: "employment", label: "Employment status", text: "Self-employed" },
    ],
  },
  {
    id: "assets",
    title: "Assets (EUR)",
    rows: [
      { id: "liquid", label: "Liquid assets", value: 3150000, prior: 2520000 },
      { id: "illiquid", label: "Illiquid assets", value: 8200000, prior: 7900000 },
      { id: "realEstate", label: "Real estate", value: 1050000, prior: 1020000 },
    ],
  },
  {
    id: "liabilities",
    title: "Liabilities (EUR)",
    rows: [
      { id: "mortgages", label: "Mortgages", value: 1200000, prior: 1310000 },
      { id: "otherLoans", label: "Other loans", value: 620000, prior: 450000 },
    ],
  },
  {
    id: "revenue",
    title: "Revenue (EUR)",
    rows: [
      { id: "salary", label: "Annual salary", value: 420000, prior: 410000 },
      { id: "otherIncome", label: "Other income", value: 220000, prior: 215000 },
    ],
  },
  {
    id: "expenditure",
    title: "Expenditure (EUR)",
    rows: [{ id: "living", label: "Annual living costs", value: 180000, prior: 176000 }],
  },
];

// A year-on-year move of this much or more is flagged as exceptional
export const CQ_EXCEPTIONAL_PCT = 20;
export const CQ_PRIOR_LABEL = "Aug 2025";

export const CQ_SIGNING_MODES = [
  { id: "single", label: "Single signing", signers: 1, note: "JPOI if eligible" },
  { id: "joint", label: "Joint signing", signers: 2, note: "Manual PDF only" },
];

export const CQ_SIGNERS = [
  { id: "s1", name: "Adam Ross", eci: "9876543210", platform: "SGP", jpoi: true },
  { id: "s2", name: "Eva Ross", eci: "9876543215", platform: "SGP", jpoi: true },
  { id: "s3", name: "Ross Family Trust", eci: "9876543216", platform: "SGP", jpoi: false },
];

export const PEAK_LIMIT_USD = 2500000;
export const MAX_TENOR_MONTHS = 120;
