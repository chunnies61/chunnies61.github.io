import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import { getCaseStudy } from "../data/caseStudies";

/* Gives every page its own browser-tab title. The site changes pages without
   reloading, so without this every page kept the home page's title and Google
   Analytics filed all views under it. The title is set before the browser paints,
   so it's in place when Analytics records the page view. */

const SITE = "Yichun Liu";
const HOME = "Yichun Liu - Staff Product Designer";
const PAGES = {
  "/": HOME,
  "/about": `About · ${SITE}`,
  "/projects": `Side projects · ${SITE}`,
  "/style-guide": `Style guide · ${SITE}`,
  "/case-studies/lending-solutions-redesign/design-system": `Prototype design system · ${SITE}`,
};

function titleFor(pathname) {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (PAGES[path]) return PAGES[path];
  const m = path.match(/^\/case-studies\/([^/]+)$/);
  const study = m && getCaseStudy(m[1]);
  return study ? `${study.title} · ${SITE}` : HOME;
}

export default function PageTitle() {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    document.title = titleFor(pathname);
  }, [pathname]);
  return null;
}
