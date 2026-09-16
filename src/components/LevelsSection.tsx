import { Link, useNavigate } from "react-router-dom";
import { LEVEL_OPTIONS } from "../data/store";
import { useLevelImages } from "../contexts/LevelImagesContext";
import "./LevelsSection.css";

export default function LevelsSection() {
  const navigate = useNavigate();
  const { images } = useLevelImages();

  return (
    <section className="levels-section">
      <div className="container">
        <div className="levels-header">
          <h2>Elige tu perfume</h2>
          <Link to="/perfumes" className="levels-view-all">
            Explorar aromas
          </Link>
        </div>
        <div className="levels-grid stagger-reveal">
          {LEVEL_OPTIONS.map((level) => (
            <button
              key={level.slug}
              type="button"
              className="level-card"
              onClick={() => navigate(`/perfumes?nivel=${level.slug}`)}
            >
              <span className="level-card-photo">
                {images[level.slug] ? (
                  <img src={images[level.slug] as string} alt={level.label} loading="lazy" />
                ) : (
                  <span className="level-card-photo-placeholder" />
                )}
              </span>
              <h3>{level.label}</h3>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
