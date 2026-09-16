import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import "./Header.css";

const NAV_LINKS = [
  { to: "/perfumes", label: "Perfumes" },
  { to: "/eau-de-parfum", label: "Eau de Parfum" },
  { to: "/eau-de-toilette", label: "Eau de Toilette" },
  { to: "/eau-de-cologne", label: "Eau de Cologne" },
  { to: "/eau-fraiche", label: "Eau Fraiche" },
  { to: "/ofertas", label: "Ofertas" },
];

export default function Header() {
  const { itemCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="container site-header-bar">
        <Link to="/" className="site-header-logo" onClick={() => setIsMenuOpen(false)}>
          Aromantly
        </Link>

        <nav className={`site-header-nav ${isMenuOpen ? "site-header-nav-open" : ""}`}>
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `site-header-link ${isActive ? "site-header-link-active" : ""}`}
              onClick={() => setIsMenuOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="site-header-actions">
          <Link to="/buscar" className="site-header-icon" aria-label="Buscar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </Link>
          <Link to="/carrito" className="site-header-icon site-header-cart" aria-label="Carrito">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {itemCount > 0 && <span className="site-header-cart-badge">{itemCount}</span>}
          </Link>
          <Link to="/admin" className="site-header-icon site-header-admin" aria-label="Panel de administración" title="Admin">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="10" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </Link>
          <button
            type="button"
            className="site-header-burger"
            aria-label="Menú"
            onClick={() => setIsMenuOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}
