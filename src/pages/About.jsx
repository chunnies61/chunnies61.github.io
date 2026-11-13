import site from "../data/site.json";
import ContactCta from "../components/ContactCta";
import KeySkills from "../components/KeySkills";
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

      <section className="section">
        <div className="wrap">
          <p className="eyebrow center">{about.testimonialsEyebrow}</p>
          <h2 className="section-title center">{about.testimonialsTitle}</h2>
          <div className="testimonial-grid">
            {about.testimonials.map((t) => (
              <div className="testimonial-card" key={t.name}>
                <p className="testimonial-quote">&ldquo;{t.quote}&rdquo;</p>
                <div className="testimonial-person">
                  <img src={t.photo} alt={t.name} />
                  <div>
                    <p className="testimonial-name">{t.name}</p>
                    <p className="testimonial-title">{t.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ContactCta title={home.ctaTitle} subtitle={home.ctaSubtitle} />
    </div>
  );
}
