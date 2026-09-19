/* Sample data for the future-vision prototype. Every name, number and rule
   here is illustrative — nothing maps to a real client or account. */

export const VARIANTS = [
  {
    id: "current",
    chip: "Current state",
    name: "Current state",
    desc: "Today's Loan Request workflow — the Loan Request App's EMEA flow, exactly as it works now. The baseline for comparing each proposal.",
    steps: ["Client & facility", "Loan details", "Loan review"],
  },
  {
    id: "p1",
    chip: "P1 · One Request",
    name: "Proposal 1 – One Request, Any Deal",
    desc: "A single unified request that adapts as you go — no SBL-vs-Custom fork up front.",
    steps: ["Request", "Loan details", "Review"],
  },
  {
    id: "p2",
    chip: "P2 · AI Agent",
    name: "Proposal 2 – AI Application Agent",
    desc: "Fill the whole request by chatting with an assistant.",
    steps: ["Build with Coach", "Review"],
  },
  {
    id: "p3",
    chip: "P3 · Collateral-First",
    name: "Proposal 3 – Collateral-First Builder",
    desc: "Start from the client's assets; the deal recalculates live.",
    steps: ["Deal workspace", "Loan details", "Review"],
  },
];

export const TICKET = {
  number: "A12345678",
  account: "12345678",
  owner: "Stephen Green (F123456)",
  status: "DRAFT",
};

export const CLIENTS = [
  { id: "c1", name: "Adam Ross", eci: "9876543210", ucn: "5550010001", platform: "PB", role: "Primary borrower" },
  { id: "c2", name: "Carol Simpson", eci: "9876543211", ucn: "5550010002", platform: "PB", role: "Co-borrower" },
  { id: "c3", name: "David Peterson", eci: "9876543212", ucn: "5550010003", platform: "PB", role: "Guarantor" },
  { id: "c4", name: "Taylor Evans", eci: "9876543213", ucn: "5550010004", platform: "PB", role: "Pledgor" },
];

export const ROLES = ["Primary borrower", "Co-borrower", "Guarantor", "Pledgor"];
export const KYC_AFFIRMATIONS = ["Affirmed", "Pending", "Not required"];

// A party on the request: a client plus the role they play
export const party = (id, role) => ({ id, role: role ?? CLIENTS.find((c) => c.id === id).role, kycAff: "Affirmed" });
export const ALL_PARTIES = CLIENTS.map((c) => party(c.id));

export const OPPORTUNITIES = [
  { id: "o1", badge: "Lowest rate", product: "Term loan", lineSize: 250000, rate: "2.1% (SOFR +0.00%)" },
  { id: "o2", badge: "Shortest SLA", product: "Line of credit", lineSize: 500000, rate: "2.4% (SOFR +0.00%)" },
  { id: "o3", badge: "Best deal", product: "Term loan", lineSize: 750000, rate: "2.6% (SOFR +0.00%)" },
  { id: "o4", badge: "Highest line size", product: "Line of credit", lineSize: 1000000, rate: "2.8% (SOFR +0.00%)" },
];
export const OPPORTUNITY_COLLATERAL = ["A1234567", "A1234568", "A1234569"];

export const FACILITIES = [
  { id: "123456780", borrowers: "Adam Ross, Carol Simpson" },
  { id: "123456789", borrowers: "Adam Ross, Taylor Evans" },
].map((f) => ({
  ...f,
  facility: "Asset-Based Lending",
  rate: "2.1%",
  lineSize: 5000000,
  review: "28-Apr-2026",
  maturity: "28-Oct-2026",
}));

export const COLLATERALS = [
  { acct: "12345678", internal: "INT-4471", legacy: "LG-88120", owners: "Adam Ross" },
  { acct: "12345689", internal: "INT-4472", legacy: "LG-88121", owners: "Adam Ross, Carol Simpson" },
  { acct: "12345690", internal: "INT-4473", legacy: "LG-88122", owners: "Taylor Evans" },
].map((c) => ({
  ...c,
  type: "Asset",
  facility: "Investments",
  mv: 4000000,
  ccy: "USD",
  std: "70%",
  maint: "60%",
  plv: "75%",
}));
// Standard lending value, as a fraction of market value
export const STANDARD_LV = 0.7;

export const HOST_ACCOUNTS = [
  { acct: "9502050", internal: "H-20050", owner: "Adam Ross" },
  { acct: "9502097", internal: "H-20097", owner: "Adam Ross, Carol Simpson" },
];

export const CURRENCIES = ["USD", "EUR", "GBP"];
export const BESPOKE_FACILITIES = ["Fixed term loan", "Line of credit", "Revolving credit"];
export const DM_FACILITIES = ["Advised line", "Committed line", "Uncommitted line"];
export const ASSET_TYPES = ["Equities", "Fixed income", "Alternatives"];
export const TEAMS = ["Team A", "Team B", "Team C"];

export const LIFE_POLICY = {
  policy: "LI-20417",
  holder: "Adam Ross",
  company: "Northwind Life",
  ccy: "USD",
  mv: "1,250,000.00",
  broker: "Yes",
};

// Financial based indicators — each graded out of 5; the FBI is their sum
export const FBI_ROWS = [
  { key: "netWorth", label: "Net Worth", value: "$48.2M", initial: 5 },
  { key: "liquidity", label: "Unencumbered Liquidity", value: "$12.6M", initial: 4 },
  { key: "leverage", label: "Leverage", value: "18%", initial: 4 },
  { key: "dsc", label: "DSC", value: "2.4×", initial: 4 },
];

export const RISK_COMMENT = {
  author: "John Smith",
  when: "12/05/2026 8:00 AM",
  text: "Liquidity is strong relative to the requested line. Please confirm the source of the 2025 K-1 distributions before pitch.",
};

export const DOC_TYPES = [
  "PFS",
  "Tax Returns/K1s",
  "Appraisal docs",
  "FST",
  "Structure Diagrams",
  "Sources/Uses Table",
];

export const SAMPLE_DOCS = [
  { name: "Adam_Ross_PFS_2026.pdf", by: "Stephen Green", type: "PFS", date: "12-May-2026" },
  { name: "Ross_Tax_Returns_2025.pdf", by: "Stephen Green", type: "Tax Returns/K1s", date: "12-May-2026" },
];

// File names used when a document is "uploaded" by clicking the drop zone
export const NEXT_DOC_NAMES = {
  "Appraisal docs": "Ross_Residence_Appraisal.pdf",
  FST: "Ross_FST_Q2_2026.xlsx",
  "Structure Diagrams": "Ross_Family_Structure.png",
  "Sources/Uses Table": "Sources_and_Uses.xlsx",
  PFS: "Adam_Ross_PFS_2026.pdf",
  "Tax Returns/K1s": "Ross_Tax_Returns_2025.pdf",
};

export const APPROVALS = [
  { key: "request", title: "Details of the borrowing request", comment: "State the purpose, amount and tenor in one paragraph." },
  { key: "background", title: "Client/family background", comment: "Add the family's source of wealth and relationship history." },
  { key: "risk", title: "Risk/mitigants", comment: "Call out the concentration in the equity portfolio and how it's mitigated." },
  { key: "covenants", title: "Covenants precedent & key financial covenants", comment: "Confirm the minimum liquidity covenant of $5M." },
  { key: "exceptions", title: "Guideline exceptions", comment: "None expected — confirm, or list each exception." },
  { key: "framework", title: "Lending framework", comment: "Map the deal to the committed-line framework." },
  { key: "docs", title: "Documentation/delivery/signers", comment: "List signers and the delivery channel for each document." },
  { key: "spousal", title: "Spousal consent", comment: "Required for the co-borrower — attach consent or explain why not." },
];

export const RULES = [
  ["1002", "Client type eligibility", "Individual client — eligible"],
  ["1003", "Final facility LGD", "LGD 0.0%, within 10%"],
  ["1004", "Max position level LGD", "Highest position 2.1%"],
  ["1005", "Single-position concentration", "Largest position 18% of collateral"],
  ["1008", "Issuer concentration", "No issuer above 10%"],
  ["1010", "Private equity exposure", "None pledged"],
  ["1012", "Restricted stock", "None pledged"],
  ["1013", "Call credit", "No outstanding calls"],
  ["1015", "Illiquid collateral", "All positions daily-priced"],
  ["1017", "Local collateral presence", "Collateral held in the US booking entity"],
];

/* --- Proposal 3: the client's collateral pool ---------------------------- */
export const POOL = [
  { id: "a1", name: "Diversified equity portfolio", acct: "A1234567", mv: 4200000, advance: 0.7 },
  { id: "a2", name: "Investment-grade bonds", acct: "A1234568", mv: 3000000, advance: 0.85 },
  { id: "a3", name: "US Treasuries", acct: "A1234569", mv: 1500000, advance: 0.95 },
  { id: "a4", name: "Concentrated stock (single issuer)", acct: "A1234570", mv: 2000000, advance: 0.5, concentrated: true },
  { id: "a5", name: "Cash & money market", acct: "A1234571", mv: 800000, advance: 0.95 },
  { id: "a6", name: "Hedge fund LP interest", acct: "A1234572", mv: 1200000, advance: 0, reason: "Illiquid — not eligible" },
];

/* --- Proposal 2: the scripted Connect Coach conversation -------------------
   Each turn: what the agent says, the application sections it fills, the
   completion it reaches, and the replies it suggests. Typing anything plays
   the next turn. */
export const SCRIPT = [
  {
    say: ["Hi Stephen 👋 I'm Connect Coach. Tell me who the loan is for and I'll fill in the application as we go."],
    fills: [],
    progress: 0,
    chips: ["It's for Adam Ross", "Search by ECI"],
  },
  {
    say: [
      "Found Adam Ross (ECI 9876543210). I've added him as Primary borrower, with his related parties Carol Simpson, David Peterson and Taylor Evans.",
      "He has 2 existing facilities — both Asset-Based Lending at 5,000,000.00 USD. Amend one, or start something new?",
    ],
    fills: ["parties", "facilities"],
    progress: 25,
    chips: ["Start something new", "Amend facility 123456789"],
  },
  {
    say: [
      "Based on his portfolio I recommend a Security-based loan: $8M line at SOFR +1.35%, with a 67% advance rate.",
    ],
    fills: ["offer"],
    progress: 45,
    chips: ["Sounds good", "Change term to 36 months"],
  },
  {
    say: [
      "Done. I've pledged accounts 12345678 and 12345689 as collateral, added life-insurance policy LI-20417, and set the managed account 9502050 as host.",
    ],
    fills: ["collateral", "insurance"],
    progress: 75,
    chips: ["Continue"],
  },
  {
    say: [
      "His FBI comes out at 17/20 — net worth and liquidity are strong. I attached his PFS and 2025 tax returns from Doc Manager, and suggest Underwriting Team A.",
      "The application is complete. Review and submit when you're ready.",
    ],
    fills: ["underwriting"],
    progress: 100,
    chips: ["Review & submit", "Save as draft", "Change term to 36 months"],
  },
];
