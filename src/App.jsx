import { Routes, Route } from "react-router-dom";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import CaseStudy from "./pages/CaseStudy";
import AllProjects from "./pages/AllProjects";
import StyleGuide from "./pages/StyleGuide";

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
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;
