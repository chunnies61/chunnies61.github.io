/* Mock data for the Loan Request App prototype.
   Everything here is dummy: names, IDs, account numbers and amounts are
   invented and stand in for real client and bank data. */

export const REGIONS = [
  { id: "emea", label: "EMEA", flow: "emea" },
  { id: "emea-geneva", label: "EMEA – GVA", flow: "emea" },
  { id: "apac-pilot", label: "APAC – Pilot", flow: "apac" },
  { id: "apac-ga", label: "APAC – GA", flow: "apac", compliance: true },
  { id: "uspb", label: "USPB", flow: "wip" },
];

export const STEPS = ["Client & facility", "Loan details", "Loan review"];

export const CLIENTS = [
  { id: "c1", name: "Alex Morgan", eci: "1000000001", ucn: "2000000001", platform: "SGP", employee: "N", kyc: "Complete" },
  { id: "c2", name: "Casey Lin", eci: "1000000002", ucn: "2000000002", platform: "SGP", employee: "N", kyc: "Complete" },
  { id: "c3", name: "Jordan Patel", eci: "1000000003", ucn: "2000000003", platform: "SGP", employee: "N", kyc: "Complete" },
];

export const ROLES = ["Borrower", "Pledgor", "Guarantor"];

// Dates are counted against a fixed "as of" day so the prototype is stable
export const AS_OF = "2026-09-18";

export const FACILITIES = [
  {
    id: "f1",
    kind: "sbl",
    badge: "Streamlined (SBL)",
    facilityId: "100000001",
    borrowers: "Alex Morgan",
    lineSize: "2,000,000.00 USD",
    lineValue: 2000000,
    drawn: 1240000,
    type: "Global limit",
    opened: "2024-10-28",
    maturity: "28-Oct-2027",
    maturityDate: "2027-10-28",
    collateral: "400001",
  },
  {
    id: "f2",
    kind: "custom",
    badge: "Tailored (Custom)",
    facilityId: "100000002",
    borrowers: "Alex Morgan, Casey Lin",
    lineSize: "5,500,000.00 USD",
    lineValue: 5500000,
    drawn: 4620000,
    type: "Commitment – Term loan",
    opened: "2023-03-15",
    maturity: "15-Mar-2028",
    maturityDate: "2028-03-15",
    collateral: "400002, 400003",
  },
];

export const COLLATERALS = [
  { acct: "400001", owners: "Alex Morgan", platform: "SGP", type: "Custody", pledged: "No", stdLv: "70%", emlLv: "80%", mv: 3250000, ccy: "USD" },
  { acct: "400004", owners: "Alex Morgan, Casey Lin", platform: "SGP", type: "Discretionary", pledged: "Yes", stdLv: "65%", emlLv: "75%", mv: 6100000, ccy: "USD" },
  { acct: "400005", owners: "Alex Morgan", platform: "SGP", type: "Brokerage", pledged: "No", stdLv: "50%", emlLv: "—", mv: 1480000, ccy: "SGD" },
];

export const DM_ACCOUNTS = [{ acct: "DM-000101", owner: "Alex Morgan", status: "Active" }];

export const HOST_ACCOUNTS = [
  { acct: "500001", internal: "INT-0001" },
  { acct: "500002", internal: "INT-0002" },
];

// Actions on an existing facility: the two common paths are buttons, the
// rest sit behind an overflow menu
export const FACILITY_ACTIONS = ["Amend", "Restructure"];
export const FACILITY_MORE_ACTIONS = ["Renew", "Increase limit", "Close facility"];

// Sample documents the upload area attaches, in this order
export const DOCUMENTS = [
  { id: "crf", name: "credit-request-form.pdf", size: "1.2 MB", required: true },
  { id: "cal", name: "client-affirmation-letter.pdf", size: "640 KB" },
  { id: "saf", name: "suitability-assessment-form.pdf", size: "880 KB" },
];

export const FACILITY_TYPES = ["Global limit", "FX/OTC Derivatives", "F&O / ETP", "Commitment – Term loan"];

export const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "SGD", "HKD", "AUD", "CNH"];

export const ASSET_TYPES = ["Other", "Cash", "Equities", "Fixed Income", "Mutual Funds", "Real Estate"];

export const TRANSACTION_TYPES = ["FX forward", "FX option", "Interest rate swap", "CDS"];

export const EXCHANGES = ["SGX", "HKEX", "Eurex", "CME"];

export const REPAYMENTS = ["Bullet", "Amortising"];

export const TICKET = {
  number: "LR-000123",
  account: "30000001",
  owner: "Sam Rivera (F000001)",
  status: "DRAFT",
};

export const RULES = [
  { id: "1002", name: "Client type eligibility" },
  { id: "1003", name: "Final facility LGD" },
  { id: "1008", name: "Private equity LV" },
  { id: "1013", name: "High LGD / illiquid securities" },
  { id: "1017", name: "Local collateral presence" },
];

export const PEAK_LIMIT_USD = 2500000;
export const MAX_TENOR_MONTHS = 120;
export const EQUITY_CONCENTRATION_LIMIT = 40;
