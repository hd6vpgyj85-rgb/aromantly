import { Link } from "react-router-dom";
import { getWhatsAppUrl } from "../data/store";
import "./CategoryFooter.css";

export default function CategoryFooter() {
  return (
    <section className="category-footer">
      <div className="category-footer-photo" role="img" aria-label="Interior de la tienda Aromantly" />
      <div className="container category-footer-content">
        <h2>Proyecta tu mejor versión con Aromantly</h2>
        <p>Fragancias originales, asesoría personalizada y el mejor precio en Cd. Juárez.</p>
        <div className="category-footer-actions">
          <Link to="/perfumes" className="btn btn-primary">
            Ver catálogo
          </Link>
          <a
            href={getWhatsAppUrl("¡Hola! Quiero más información sobre sus perfumes 🌿")}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
          >
            Escríbenos
          </a>
        </div>
      </div>
    </section>
  );
}
