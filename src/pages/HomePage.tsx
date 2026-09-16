import { Link } from "react-router-dom";
import { getWhatsAppUrl } from "../data/store";
import PromoBanner from "../components/PromoBanner";
import LevelsSection from "../components/LevelsSection";
import TopProducts from "../components/TopProducts";
import Testimonials from "../components/Testimonials";
import VisitUs from "../components/VisitUs";
import CtaFooter from "../components/CtaFooter";
import "./HomePage.css";

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="hero-overlay" />
        <div className="container hero-content">
          <span className="hero-badge">Especialistas en perfumes</span>
          <h1>Encuentra la fragancia que te define</h1>
          <p className="hero-subtitle">
            Perfumes árabes, de diseñador y de nicho, 100% originales, en el corazón de Cd. Juárez.
          </p>
          <div className="hero-actions">
            <Link to="/perfumes" className="btn btn-primary">
              Ver perfumes
            </Link>
            <a
              href={getWhatsAppUrl("¡Hola! Quiero información sobre sus perfumes 🌿")}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              Escríbenos
            </a>
          </div>
          <div className="hero-rating">
            <span className="hero-stars">★★★★★</span>
            <span>+500 clientes asesorados</span>
          </div>
        </div>
      </section>

      <PromoBanner />
      <LevelsSection />
      <TopProducts />
      <Testimonials />
      <VisitUs />
      <CtaFooter />
    </>
  );
}
