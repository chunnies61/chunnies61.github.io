import { Routes, Route, useLocation } from "react-router-dom";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import CaseStudy from "./pages/CaseStudy";
import AllProjects from "./pages/AllProjects";

function App() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  return (
    <>
      <Nav white={isHome} />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/case-studies/:slug" element={<CaseStudy />} />
          <Route path="/projects" element={<AllProjects />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;
