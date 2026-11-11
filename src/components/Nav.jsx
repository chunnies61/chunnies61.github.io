import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import site from "../data/site.json";
import "./Nav.css";

export default function Nav() {
  // The home page runs its aurora up behind this bar, so the nav is
  // transparent there — but only while the page is at the top. Once anything
  // scrolls under the sticky bar it needs its background back.
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={"nav" + (scrolled ? " is-scrolled" : "")}>
      <div className="wrap nav-inner">
        <Link
          to="/"
          className="nav-logo"
          aria-label="Home"
          onClick={() => window.scrollTo({ top: 0, left: 0, behavior: "auto" })}
        >
          <img src="/images/logo-dcc224.svg" alt="Yichun logo" />
        </Link>
        <nav className="nav-links">
          <Link className="md-label-large" to={site.nav.links[0].to}>
            {site.nav.links[0].label}
          </Link>
          {site.nav.links.slice(1).map((link) => (
            <Link className="md-label-large" key={link.to} to={link.to}>
              {link.label}
            </Link>
          ))}
          <a className="md-label-large" href={site.nav.resumeUrl} target="_blank" rel="noreferrer">
            CV
          </a>
        </nav>
      </div>
    </header>
  );
}
