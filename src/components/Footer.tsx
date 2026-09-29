import { Link } from "react-router-dom";
import { getWhatsAppUrl, storeInfo } from "../data/store";
import "./Footer.css";

export default function Footer({ plain = false }: { plain?: boolean }) {
  return (
    <footer className={`site-footer ${plain ? "site-footer-plain" : ""}`}>
      <div className="container site-footer-content">
        <div className="site-footer-brand">
          <span className="site-footer-logo">Aromantly</span>
          <p>{storeInfo.address}</p>
        </div>
        <nav className="site-footer-links">
          <a href={getWhatsAppUrl("¡Hola! Quiero más información 🌿")} target="_blank" rel="noopener noreferrer">
            WhatsApp
          </a>
          <Link to="/terminos">Términos</Link>
          <Link to="/privacidad">Privacidad</Link>
        </nav>
      </div>
      <div className="container site-footer-bottom">
        <span>© {new Date().getFullYear()} Aromantly. Todos los derechos reservados.</span>
      </div>
    </footer>
  );
}
