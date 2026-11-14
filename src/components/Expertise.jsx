import { Link } from "react-router-dom";
import data from "../data/expertise.json";
import "./Expertise.css";

/* Expertise — the hard skills behind the work, each with the tools it uses and a link
   to the case study that shows it. Sits under the key skills on the About page. */

export default function Expertise() {
  return (
    <section className="section">
      <div className="wrap">
        <p className="eyebrow center">{data.eyebrow}</p>
        <h2 className="section-title center">{data.title}</h2>
        <ol className="ex-grid">
          {data.items.map((item, i) => (
            <li className="ex-card" key={item.title}>
              <span className="ex-num" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3>{item.title}</h3>
              <p className="ex-desc">{item.desc}</p>
              <ul className="ex-tools" aria-label="Tools and methods">
                {item.tools.map((t) => (
                  <li className="tag-pill md-label-medium" key={t}>
                    {t}
                  </li>
                ))}
              </ul>
              {item.proof && (
                <Link className="ex-proof" to={item.proof.href || `/case-studies/${item.proof.slug}`}>
                  {item.proof.text}
                  <span aria-hidden="true"> →</span>
                </Link>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
