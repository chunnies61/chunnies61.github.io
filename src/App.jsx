import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import CaseStudy from "./pages/CaseStudy";
import AllProjects from "./pages/AllProjects";
import StyleGuide from "./pages/StyleGuide";

// The prototypes' design system carries their stylesheets, so it loads on demand
const PrototypeDesignSystem = lazy(() => import("./pages/PrototypeDesignSystem"));

function App() {
  return (
    <>
      <Nav />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/case-studies/:slug" element={<CaseStudy />} />
          <Route path="/projects" element={<AllProjects />} />
          <Route path="/style-guide" element={<StyleGuide />} />
          <Route
            path="/case-studies/lending-solutions-redesign/design-system"
            element={
              <Suspense fallback={null}>
                <PrototypeDesignSystem />
              </Suspense>
            }
          />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;
