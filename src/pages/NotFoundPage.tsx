import { Link } from "react-router-dom";
import "./NotFoundPage.css";

export default function NotFoundPage() {
  return (
    <div className="container not-found-page">
      <span className="not-found-code">404</span>
      <h1>No encontramos esta página</h1>
      <p>El enlace que buscas no existe o fue movido.</p>
      <Link to="/" className="btn btn-primary">
        Volver al inicio
      </Link>
    </div>
  );
}
