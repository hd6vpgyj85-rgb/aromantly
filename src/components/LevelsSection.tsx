import { useNavigate } from "react-router-dom";
import { LEVEL_OPTIONS } from "../data/store";
import "./LevelsSection.css";

const LEVEL_DESCRIPTIONS: Record<string, string> = {
  arabe: "Fragancias árabes intensas, de gran proyección y larga duración.",
  disenador: "Firmas reconocidas mundialmente con un estilo atemporal.",
  nicho: "Composiciones exclusivas para quienes buscan algo diferente.",
};

export default function LevelsSection() {
  const navigate = useNavigate();

  return (
    <section className="levels-section">
      <div className="container">
        <h2>Elige tu nivel</h2>
        <div className="levels-grid stagger-reveal">
          {LEVEL_OPTIONS.map((level) => (
            <button
              key={level.slug}
              type="button"
              className="level-card"
              onClick={() => navigate(`/perfumes?nivel=${level.slug}`)}
            >
              <span className="level-card-number">{level.number}</span>
              <h3>{level.label}</h3>
              <p>{LEVEL_DESCRIPTIONS[level.slug]}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
