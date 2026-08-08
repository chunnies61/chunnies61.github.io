import { Link } from "react-router-dom";
import site from "../data/site.json";
import ContactCta from "../components/ContactCta";
import "./AllProjects.css";

export default function AllProjects() {
  const { home } = site;

  return (
    <article className="all-projects">
      <header className="ap-header">
        <div className="wrap">
          <Link to="/" className="cs-back">
            ← Back home
          </Link>
          <p className="eyebrow center">{home.otherWorkEyebrow}</p>
          <h1>{home.otherWorkTitle}</h1>
          <p className="ap-subtitle">
            A closer look at other things I've designed, prototyped, and shipped.
          </p>
        </div>
      </header>

      <div className="wrap">
        <div className="ap-list">
          {home.otherWork.map((item, i) => (
            <div className="ap-row" key={`${item.thumb}-${i}`}>
              <div className="ap-title">
                <span className="ap-index">{String(i + 1).padStart(2, "0")}</span>
                <h3>{item.title}</h3>
              </div>
              <p className="ap-desc">Project description placeholder — details coming soon.</p>
              <div className="ap-media">
                <img src={item.thumb} alt="" loading="lazy" />
              </div>
              <span className="ap-link">View →</span>
            </div>
          ))}
        </div>
      </div>

      <ContactCta />
    </article>
  );
}
