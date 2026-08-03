import site from "../data/site.json";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <p>{site.footer}</p>
      </div>
    </footer>
  );
}
