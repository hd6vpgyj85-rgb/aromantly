import { Link } from "react-router-dom";
import { getWhatsAppUrl } from "../data/store";
import "./CtaFooter.css";

export default function CtaFooter() {
  return (
    <section className="cta-footer">
      <div className="container cta-footer-content">
        <h2>Encuentra tu firma olfativa</h2>
        <p>Perfumes árabes, de diseñador y de nicho, con asesoría personalizada.</p>
        <div className="cta-footer-actions">
          <Link to="/perfumes" className="btn btn-primary">
            Ver perfumes
          </Link>
          <a
            href={getWhatsAppUrl("¡Hola! Quiero información sobre sus perfumes 🌿")}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
          >
            Escríbenos por WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
