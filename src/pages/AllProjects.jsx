import site from "../data/site.json";
import ContactCta from "../components/ContactCta";
import { ProjectLinks, ProjectMedia, projectImages } from "../components/SideProject";
import "./AllProjects.css";

const PROJECT_LIMIT = 6;

export default function AllProjects() {
  const { home } = site;
  // Unfinished entries (still titled "Project title") stay in the data but never show
  const projects = home.otherWork.filter((p) => p.title !== "Project title").slice(0, PROJECT_LIMIT);

  return (
    <article className="all-projects">
      <header className="ap-header">
        <div className="wrap">
          <p className="eyebrow">{home.otherWorkEyebrow}</p>
          <h1 className="md-display-small">{home.otherWorkTitle}</h1>
        </div>
      </header>

      <div className="wrap">
        <div className="ap-list">
          {projects.map((item, i) => (
            <div className="ap-row" key={`${item.thumb}-${i}`}>
              <div className="ap-title">
                <h3 className="md-headline-small">{item.title}</h3>
                {item.award && (
                  <img
                    className="ap-award"
                    src={item.award.image}
                    alt={item.award.alt}
                    loading="lazy"
                  />
                )}
              </div>
              <div className="ap-desc">
                {item.desc && item.desc.length ? (
                  item.desc.map((p, pi) => <p key={pi}>{p}</p>)
                ) : (
                  <p>Project description placeholder. Details coming soon.</p>
                )}
                <ProjectLinks item={item} from="side projects page" />
              </div>
              <ProjectMedia images={projectImages(item)} ratio={item.ratio} />
            </div>
          ))}
        </div>
      </div>

      <ContactCta />
    </article>
  );
}
