/* Sample data for the Lending Workspace prototype. Every client, person,
   ticket and figure is illustrative. */

export const USER_ID = "W000123";

// Portfolio Health pages: [id, label]
export const HEALTH_PILLS = [
  ["portfolio", "Portfolio View"],
  ["annual", "Annual Review"],
];

// L2 sections. A section's `subs` are its pages, reached from a dropdown
// on the L2 tab: [id, label]; a single-page section names its page instead.
export const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "deals", label: "Deal Journey", page: "Deal Journey" },
  { id: "opps", label: "Opportunities", page: "Pre-Approved Offers" },
  { id: "health", label: "Portfolio Health", subs: HEALTH_PILLS },
  { id: "insights", label: "Insights", page: "Collateral Insights" },
  { id: "docqc", label: "Doc QC" },
  { id: "margin", label: "Margin Call" },
  { id: "book", label: "Book Simulation", page: "Book Simulation" },
];

/* --- Overview ------------------------------------------------------------- */
export const TOP_DEALS = ["Robert Johnson", "Peter Walsh", "Jim Wallace", "John Trenton", "Danielle Houston"];

export const HEALTH_TILES = [
  ["Annual Review", 336, "annual"],
  ["Collateral Zone", 1076],
  ["Delinquency", 1302],
  ["Doc Hub", 1713],
  ["Informational Items", 1103],
  ["Risk Watch", 182],
];

export const INSIGHTS = [
  ["Facility Counts", "15.71K"],
  ["Total Line Size", "305.53B"],
  ["Total Used/OS Amt", "110.39B"],
  ["Total Available Amt", "183.17B"],
];

const TASK_TYPES = [
  ["Credit of good standing issue", "High", 3],
  ["KYC Incomplete", "Medium", 20],
  ["Complete the FL Stamp Questionnaire", "Low", 30],
  ["Collateral valuation expired", "High", 5],
  ["Signer verification pending", "Medium", 12],
  ["Upload 2025 tax returns", "Low", 25],
  ["Covenant certificate overdue", "High", 2],
];

function tasks(count, start) {
  return Array.from({ length: count }, (_, i) => {
    const [title, priority, due] = TASK_TYPES[i % TASK_TYPES.length];
    return { ticket: String(start + i), title, priority, due: due + Math.floor(i / TASK_TYPES.length) };
  });
}
export const TASKS = { me: tasks(12, 99968203649), team: tasks(56, 99968204100) };

export const NEWSLETTER = {
  title: "STEPPING INTO SPRING: Q1 RECAP",
  date: "2026-04-10",
  paragraphs: [
    "Team — what a quarter. Custom loan submissions were up on every desk, and the time from first conversation to credit approval kept falling as more of you moved deals through the Workspace.",
    "Our “Liquidity at Tax Time” campaign reached clients right when they needed flexibility, and it turned into one of the strongest origination months we've had.",
    "Lending balances closed the quarter at a record $135Bn in the US and $200Bn globally — a result of steady servicing as much as new business.",
    "Thank you for the care you bring to every client. Let's carry the momentum into Q2.",
  ],
  signature: "JORDAN ELLIS",
  role: "Head of U.S. Lending Solutions",
};

/* --- Deal Journey ------------------------------------------------------------- */
export const DEAL_TILES = [
  ["All", 3609],
  ["Draft", 1369],
  ["In Flight", 2240],
  ["Proposal Not Complete", 158],
  ["Documentation", 175],
  ["Completed Today", 0],
];

const CLIENTS = [
  "Arturo Alphonso",
  "Ilana Thieme",
  "Miles Bach",
  "Tzippy Vega",
  "Julia Zhang",
  "Marcus Oyelaran",
  "Priya Raman",
  "Theo Lindqvist",
  "Nadia Haddad",
  "Owen Castellano",
  "Sofia Brandt",
  "Kenji Mori",
  "Leah Goldfarb",
  "Rafael Ortiz",
  "Hannah Weiss",
  "Daniel Kovacs",
  "Amara Nwosu",
  "Victor Chen",
  "Elena Petrova",
  "Samuel Adeyemi",
  "Grace Whitfield",
];
const PEOPLE = ["Chris Doyle", "Maya Patel", "Luis Romero", "Anna Berg", "Tom Nakamura"];
const STAGES = ["Documentation", "Verify", "Credit Approval"];
const CHANNELS = ["GLOW", "PBLOS", "CDLC"];
const eci = (i) => String(4100000000 + i * 7919);

export const DEALS = CLIENTS.map((name, i) => ({
  id: i,
  client: name,
  eci: eci(i),
  aging: 3 + ((i * 7) % 40),
  lineSize: 5000000,
  assignee: PEOPLE[i % PEOPLE.length],
  stage: STAGES[i % 3],
  ticket: String(99968210000 + i * 13),
  channel: CHANNELS[(i + 1) % 3],
  dealType: i % 3 === 1 ? "" : "SBL",
}));

/* --- Opportunities ----------------------------------------------------------- */
const OFFER_BORROWERS = [
  ["Arturo Alphonso", 100000, 6.25],
  ["Murray Hill Group", 5000000, 6.25],
  ["Miles Bach", 5000000, 6.75],
  ...CLIENTS.slice(3, 21).map((n, i) => [n, [250000, 1000000, 2500000, 5000000][i % 4], [6.25, 6.5, 6.75][i % 3]]),
];

export const OFFERS = OFFER_BORROWERS.map(([name, line, rate], i) => ({
  id: i,
  borrower: name,
  lineSize: line,
  rate,
  collateral: `A${1234567 + i * 11}`,
  dmEci: eci(i + 40),
  borrowerEci: eci(i + 3),
  banker: PEOPLE[(i + 2) % PEOPLE.length],
}));

/* --- Portfolio Health ------------------------------------------------------------- */
export const KPIS = [
  ["Total Line Size", "$305.5B", "+2.1%", "up"],
  ["Active Facilities", "1,247", "+18 this wk", "up"],
  ["Open Exceptions", "43", "8 critical", "warn"],
  ["Reviews Due 30d", "27", "6 overdue", "warn"],
];

export const ALLOCATION = [
  ["Marketable securities", 42, "#0056a6"],
  ["Real estate", 24, "#00796b"],
  ["Life insurance", 16, "#8a4fa6"],
  ["Cash & deposits", 12, "#b26a00"],
  ["Other", 6, "#757780"],
];

export const UTILIZATION = { pct: 36, used: "$110.4B", available: "$183.2B", undrawn: "$11.9B" };

export const CRITICAL = [
  ["critical", "Margin call", "Harborview Family Trust", "$620K equity call due today"],
  ["critical", "Delinquency", "Ortega Holdings", "11 days past due"],
  ["warning", "Annual review due", "Castellan Partners", "Due in 5 days"],
  ["warning", "Missing tax docs", "Whitfield Family", "2025 returns outstanding"],
  ["opportunity", "Pre-approved offer", "Meridian Trust", "+$5M line pre-approved"],
];

export const COVENANTS = [
  ["Halcyon Partners", "Breached", "LTV 72% vs 65% max"],
  ["Cascade Ventures", "Breached", "Liquidity $4.1M vs $5M min"],
  ["Meridian Trust", "Cert due", "Compliance certificate in 7 days"],
  ["Sterling Yacht", "At risk", "DSC 1.30× vs 1.25× floor"],
  ["Blackwood Capital", "In compliance", "All tests passing"],
];

export const REVIEWS = [
  ["Castellan Partners", "Overdue", "12 days overdue"],
  ["Northgate Family Office", "Overdue", "4 days overdue"],
  ["Whitfield Family", "Due soon", "Due in 5 days"],
  ["Ortega Holdings", "Due soon", "Due in 9 days"],
  ["Lark & Finch LLC", "Due soon", "Due in 14 days"],
];

export const CAPACITY = { servicing: 60, origination: 40 };

export const COACH = [
  {
    kind: "Pricing anomaly",
    title: "Sterling Yacht is priced below grid",
    body: "Repricing to the current grid recovers about $357K in annual revenue.",
  },
  {
    kind: "Line increase",
    title: "Meridian Trust qualifies for a $15M increase",
    body: "Collateral growth and clean payment history support a larger line.",
  },
  {
    kind: "Refinance",
    title: "3 refinance candidates",
    body: "Three clients on legacy fixed rates would save by moving to current pricing.",
  },
];

const EXCEPTION_TYPES = [
  ["Collateral", "Collateral Shortfall"],
  ["Collateral", "Misc. Collateral"],
];
const FACILITY_TYPES = ["Line of credit", "Term loan", "SBL", "Mortgage"];
const STATUSES = ["Open", "In progress", "Pending client", "Escalated"];

export const ANNUAL = CLIENTS.slice(0, 20).map((name, i) => {
  const [type, sub] = EXCEPTION_TYPES[i === 4 ? 0 : 1];
  return {
    id: i,
    client: name,
    decisionMaker: PEOPLE[(i + 1) % PEOPLE.length],
    facility: FACILITY_TYPES[i % 4],
    type,
    sub,
    age: 5 + ((i * 11) % 90),
    status: STATUSES[i % 4],
    owner: PEOPLE[(i + 3) % PEOPLE.length],
  };
});

/* --- Insights › Collateral Insights ----------------------------------------- */
export const INSIGHT_ASOF = "2026-09-18";

export const INSIGHT_KPIS = [
  ["Total Positions", "80,094"],
  ["DM ECI Count", "13K"],
  ["Facility Count", "19K"],
  ["Collateral MV", "$430B"],
  ["Post Haircut ELV", "$262B"],
  ["Secured Exposure", "$53B"],
];

// Search filters, then the four classification selects
export const INSIGHT_FILTERS = [
  "Inst Long Name",
  "Client Name",
  "ECI Identifier",
  "DM ECI Identifier",
  "Instr Id",
  "Facility Number",
];
export const INSIGHT_SELECTS = [
  "Source Asset Type",
  "Inst Clsf Type Name L1",
  "Inst Clsf Type Name L2",
  "Inst Clsf Type Name L3",
];

/* [label, DM ECI count, facility count, collateral MV, post-haircut ELV,
   secured exposure] — raw numbers so the in-cell bars can scale */
export const ASSET_TYPES = [
  ["Cash", 12000, 17000, 7e9, 5e9, 1e9],
  ["Mutual Fund", 11000, 15000, 116e9, 87e9, 12e9],
  ["Equities", 9000, 12000, 201e9, 116e9, 26e9],
  ["Fixed Income", 4000, 5000, 37e9, 29e9, 6e9],
  ["Alternative Investments", 3000, 4000, 20e9, 449e6, 79e6],
  ["Other", 198, 241, 1e9, 22e3, 15e3],
  ["Commodities", 193, 222, 2e9, 924e6, 50e6],
  ["Hedge Fund", 41, 49, 14e9, 6e9, 2e9],
  ["Life Insurance", 38, 66, 2e9, 2e9, 1e9],
  ["Management Fees", 36, 37, 5e9, 2e9, 764e6],
  ["Artwork", 26, 29, 6e9, 3e9, 1e9],
  ["Private Equity", 8, 10, 4e9, 2e9, 481e6],
];

export const TOP_BY = [
  ["eci", "DM ECI Count"],
  ["facilities", "Facility Count"],
  ["mv", "Collateral MV"],
  ["elv", "Post Haircut ELV"],
  ["exposure", "Secured Exposure"],
];

/* [client, instrument, asset type, facility, DM ECI count, facility count,
   collateral MV, post-haircut ELV, secured exposure] */
export const POSITIONS = [
  ["Atlas Holdings LLC", "US Treasury 4.25% 2030", "Fixed Income", "FAC-880142", 412, 615, 4.2e9, 3.9e9, 1.4e9],
  ["Bellweather Trust", "Vanguard Total Stock Idx", "Mutual Fund", "FAC-880517", 388, 702, 3.8e9, 2.9e9, 1.1e9],
  ["Cortland Family Office", "Apple Inc", "Equities", "FAC-881003", 604, 489, 3.1e9, 1.8e9, 940e6],
  ["Dunmore Partners", "USD Demand Deposit", "Cash", "FAC-881260", 275, 840, 2.6e9, 2.6e9, 780e6],
  ["Everline Capital", "Blackstone Private Credit", "Alternative Investments", "FAC-881744", 96, 138, 2.2e9, 640e6, 410e6],
  ["Fairmount Group", "Microsoft Corp", "Equities", "FAC-882019", 521, 377, 1.9e9, 1.1e9, 360e6],
  ["Glenrock Holdings", "iShares Core MSCI EAFE", "Mutual Fund", "FAC-882388", 344, 296, 1.4e9, 1.0e9, 290e6],
  ["Harbour Point LP", "Gold Bullion — LBMA", "Commodities", "FAC-882640", 58, 71, 980e6, 540e6, 150e6],
];

/* --- Doc QC ------------------------------------------------------------------ */
export const DOCQC_FILE_TYPES = "PDF, DOC, DOCX, XLS, XLSX, XLSM, ZIP";

/* --- Margin Call -------------------------------------------------------------- */
export const MARGIN_META = { app: "GCM Margin Calls", env: "UAT1 NA", release: "CONNECT 1.3.1" };

// [id, label, count, tone]
export const MARGIN_GROUPS = [
  ["invalid", "Invalid", 5, "is-critical"],
  ["resolved", "Resolved", 243, "is-good"],
  ["override", "Review Resolved with Amount Override", 5, "is-warn"],
  ["unreviewed", "Unreviewed", 788, "is-warn"],
  ["cwm", "Valid CWM", 33, "is-neutral"],
  ["gwm", "Valid GWM", 149, "is-neutral"],
];

export const MARGIN_COLUMNS = [
  "LOB",
  "Ticket ID",
  "Arrangement ID",
  "Issue Date",
  "Cause of Margin Call",
  "Classified Valid/Invalid?",
  "Total Margin Call Amount USD",
  "RAG Rating",
  "Team",
];

export const MARGIN_CAUSES = [
  "Market value drop",
  "Collateral withdrawal",
  "Haircut change",
  "New drawdown",
  "FX move",
];

/* --- Book Simulation ---------------------------------------------------------- */
export const BOOK_COB = [
  ["Asia", "11/Oct/2026"],
  ["Europe", "12/Oct/2026"],
  ["Switzerland", "19/May/2026"],
  ["North America", "13/Oct/2026"],
];
