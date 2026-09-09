import { Link } from "react-router-dom";
import site from "../data/site.json";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-inner">
        <p>{site.footer}</p>
        <Link className="footer-link" to="/style-guide">
          Style guide
        </Link>
      </div>
    </footer>
  );
}
