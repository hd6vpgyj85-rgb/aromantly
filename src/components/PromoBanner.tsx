import { Link } from "react-router-dom";
import "./PromoBanner.css";

export default function PromoBanner() {
  return (
    <div className="container">
      <Link to="/ofertas" className="promo-banner" aria-label="Ver edición limitada en Ofertas">
        <img src="/images/promo-mandarin-sky.jpg" alt="Edición limitada" loading="lazy" />
      </Link>
    </div>
  );
}
