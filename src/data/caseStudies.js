import unifiedCustomerHub from "./unified-customer-hub.json";
import lendingSolutionsRedesign from "./lending-solutions-redesign.json";
import agentDesk from "./agent-desk.json";
import otisDigitalEcoSystem from "./otis-digital-eco-system.json";
import nitroCollege from "./nitro-college.json";
import clinicmindEhrPlatform from "./clinicmind-ehr-platform.json";

export const caseStudies = [
  unifiedCustomerHub,
  lendingSolutionsRedesign,
  agentDesk,
  otisDigitalEcoSystem,
  nitroCollege,
  clinicmindEhrPlatform,
];

export function getCaseStudy(slug) {
  return caseStudies.find((cs) => cs.slug === slug);
}
