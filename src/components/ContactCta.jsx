import { useLocation } from "react-router-dom";
import site from "../data/site.json";
import { track } from "../analytics";
import "./ContactCta.css";

export default function ContactCta({ title, subtitle }) {
  const { pathname } = useLocation();
  return (
    <section className="contact-cta">
      <div className="wrap contact-cta-inner">
        <h2>{title ?? "Have a fun idea?"}</h2>
        <p className="contact-cta-subtitle">{subtitle ?? "Let's connect."}</p>
        <div className="contact-cta-actions">
          <a
            className="btn btn-primary"
            href={`mailto:${site.contact.email}`}
            onClick={() => track("contact_click", { method: "email", page: pathname })}
          >
            Email
          </a>
          <a
            className="btn btn-secondary"
            href={site.contact.linkedin}
            target="_blank"
            rel="noreferrer"
            onClick={() => track("contact_click", { method: "linkedin", page: pathname })}
          >
            LinkedIn
          </a>
        </div>
      </div>
    </section>
  );
}
