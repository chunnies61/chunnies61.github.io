import site from "../data/site.json";
import "./ContactCta.css";

export default function ContactCta({ title, subtitle }) {
  return (
    <section className="contact-cta">
      <div className="wrap contact-cta-inner">
        <h2>{title ?? "Have a fun Idea?"}</h2>
        <p className="contact-cta-subtitle">{subtitle ?? "Let's connect!"}</p>
        <div className="contact-cta-actions">
          <a className="btn btn-primary" href={`mailto:${site.contact.email}`}>
            Email
          </a>
          <a
            className="btn btn-secondary"
            href={site.contact.linkedin}
            target="_blank"
            rel="noreferrer"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </section>
  );
}
