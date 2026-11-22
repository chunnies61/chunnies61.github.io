import { useEffect, useRef } from "react";
import site from "../data/site.json";
import ContactCta from "../components/ContactCta";
import GridGlow from "../components/GridGlow";
import KeySkills from "../components/KeySkills";
import Testimonials from "../components/Testimonials";
import useReveal from "../hooks/useReveal";
import "./Home.css";
import "./About.css";

/* About — the intro panel, the key skills and the testimonials, on their own page. The two
   sections keep the styles they had as part of the home page. */

export default function About() {
  const { home, about } = site;
  const rootRef = useRef(null);
  useReveal(rootRef); // the page arrives in layers as it scrolls into view

  // The same graph-paper background as the home page (styled in Home.css), nav and footer included;
  // <GridGlow /> below is its pointer-following highlight
  useEffect(() => {
    document.body.classList.add("has-grid");
    return () => document.body.classList.remove("has-grid");
  }, []);

  return (
    <div className="about-page" ref={rootRef}>
      <GridGlow />
      <section className="about-hero" data-reveal>
        <div className="wrap about-hero-inner">
          <div className="about-hero-text">
            <h1 data-reveal style={{ "--reveal-delay": "100ms" }}>
              {about.heading}
            </h1>
            {about.paragraphs.map((p, i) => (
              <p className="md-body-medium" key={i} data-reveal style={{ "--reveal-delay": `${200 + i * 90}ms` }}>
                {p}
              </p>
            ))}
          </div>
          <img className="about-hero-image" src={about.headerImage} alt="" data-reveal style={{ "--reveal-delay": "260ms" }} />
        </div>
      </section>

      <KeySkills />

      <Testimonials />

      <ContactCta title={home.ctaTitle} subtitle={home.ctaSubtitle} />
    </div>
  );
}
