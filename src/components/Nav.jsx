import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import site from "../data/site.json";
import { track } from "../analytics";
import "./Nav.css";

export default function Nav() {
  // The floating capsule tightens into a smaller one once the page scrolls.
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={"nav" + (scrolled ? " is-scrolled" : "")}>
      <div className="nav-inner">
        <Link
          to="/"
          className="nav-logo"
          aria-label="Home"
          onClick={() => window.scrollTo({ top: 0, left: 0, behavior: "auto" })}
        >
          <img src="/images/logo-dcc224.svg" alt="Yichun logo" />
        </Link>
        <nav className="nav-links">
          <Link className="md-label-medium" to={site.nav.links[0].to}>
            {site.nav.links[0].label}
          </Link>
          {site.nav.links.slice(1).map((link) => (
            <Link className="md-label-medium" key={link.to} to={link.to}>
              {link.label}
            </Link>
          ))}
          <a
            className="md-label-medium"
            href={site.nav.resumeUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => track("cv_open", { page: pathname })}
          >
            CV
          </a>
        </nav>
      </div>
    </header>
  );
}
