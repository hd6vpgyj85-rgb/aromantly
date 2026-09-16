import { Link } from "react-router-dom";
import { getWhatsAppUrl } from "../data/store";
import PromoBanner from "../components/PromoBanner";
import LevelsSection from "../components/LevelsSection";
import TopProducts from "../components/TopProducts";
import Testimonials from "../components/Testimonials";
import VisitUs from "../components/VisitUs";
import CtaFooter from "../components/CtaFooter";
import Reveal from "../components/Reveal";
import "./HomePage.css";

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="hero-overlay" />
        <div className="container hero-content">
          <span className="hero-badge hero-anim hero-anim-1">Especialistas en perfumes</span>
          <h1 className="hero-anim hero-anim-2">Encuentra la fragancia que te define</h1>
          <p className="hero-subtitle hero-anim hero-anim-3">
            Perfumes árabes, de diseñador y de nicho, 100% originales, en el corazón de Cd. Juárez.
          </p>
          <div className="hero-actions hero-anim hero-anim-4">
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
          <div className="hero-rating hero-anim hero-anim-5">
            <span className="hero-stars">★★★★★</span>
            <span>+500 clientes asesorados</span>
          </div>
        </div>
        <div className="hero-scroll-hint hero-anim hero-anim-5" aria-hidden="true">
          <span />
        </div>
      </section>

      <Reveal direction="zoom">
        <PromoBanner />
      </Reveal>
      <Reveal direction="up">
        <LevelsSection />
      </Reveal>
      <Reveal direction="up">
        <TopProducts />
      </Reveal>
      <Reveal direction="up">
        <Testimonials />
      </Reveal>
      <Reveal direction="up">
        <VisitUs />
      </Reveal>
      <Reveal direction="fade">
        <CtaFooter />
      </Reveal>
    </>
  );
}
