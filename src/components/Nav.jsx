import { Link } from "react-router-dom";
import site from "../data/site.json";
import "./Nav.css";

export default function Nav() {
  return (
    <header className="nav">
      <div className="wrap nav-inner">
        <Link to="/" className="nav-logo">
          <img src="/images/logo-dcc224.svg" alt="Yichun logo" />
        </Link>
        <nav className="nav-links">
          <a href={site.nav.resumeUrl} target="_blank" rel="noreferrer">
            Resume
          </a>
          {site.nav.links.map((link) => (
            <Link key={link.to} to={link.to}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
