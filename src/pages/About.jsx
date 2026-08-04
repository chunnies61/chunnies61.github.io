import site from "../data/site.json";
import ContactCta from "../components/ContactCta";
import "./About.css";

export default function About() {
  const { about } = site;
  return (
    <>
      <section className="about-hero">
        <div className="wrap about-hero-inner">
          <div className="about-hero-text">
            <h1>{about.heading}</h1>
            {about.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <img className="about-hero-image" src={about.headerImage} alt="" />
        </div>
      </section>

      <section className="section fun-facts-section">
        <div className="fun-facts-card">
          <h2 className="fun-facts-heading">{about.funFactsLabel}</h2>
          <img className="fun-facts-image" src={about.funFactsImage} alt="Fun facts about Yichun" />
        </div>
      </section>

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

      <ContactCta />
    </>
  );
}
