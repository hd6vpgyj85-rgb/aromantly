import { Link } from "react-router-dom";
import PerfumeBottleArt from "../components/PerfumeBottleArt";
import "./NotFoundPage.css";

export default function NotFoundPage() {
  return (
    <div className="container not-found-page">
      <PerfumeBottleArt />
      <span className="not-found-code">404</span>
      <h1>Este aroma se evaporó</h1>
      <p>La página que buscas ya no está aquí, pero el catálogo sigue completito.</p>
      <div className="not-found-actions">
        <Link to="/perfumes" className="btn btn-primary">
          Ver perfumes
        </Link>
        <Link to="/" className="btn btn-secondary">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
