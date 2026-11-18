import site from "../data/site.json";
import ContactCta from "../components/ContactCta";
import KeySkills from "../components/KeySkills";
import Testimonials from "../components/Testimonials";
import "./Home.css";
import "./About.css";

/* About — the intro panel, the key skills and the testimonials, on their own page. The two
   sections keep the styles they had as part of the home page. */

export default function About() {
  const { home, about } = site;

  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="wrap about-hero-inner">
          <div className="about-hero-text">
            <h1>{about.heading}</h1>
            {about.paragraphs.map((p, i) => (
              <p className="md-body-medium" key={i}>
                {p}
              </p>
            ))}
          </div>
          <img className="about-hero-image" src={about.headerImage} alt="" />
        </div>
      </section>

      <KeySkills />

      <Testimonials />

      <ContactCta title={home.ctaTitle} subtitle={home.ctaSubtitle} />
    </div>
  );
}
