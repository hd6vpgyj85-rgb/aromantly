import { createPortal } from "react-dom";
import { NavLink } from "react-router-dom";
import "./MobileNavOverlay.css";

interface NavItem {
  to: string;
  label: string;
}

interface MobileNavOverlayProps {
  links: NavItem[];
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Menú móvil a pantalla completa, portado a document.body.
 * Necesario porque el header tiene backdrop-filter, que crea un
 * containing block para descendientes position:fixed y les impide
 * cubrir todo el viewport si se renderizan dentro de él.
 */
export default function MobileNavOverlay({ links, isOpen, onClose }: MobileNavOverlayProps) {
  return createPortal(
    <nav className={`mobile-nav-overlay ${isOpen ? "mobile-nav-overlay-open" : ""}`}>
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) => `mobile-nav-link ${isActive ? "mobile-nav-link-active" : ""}`}
          onClick={onClose}
        >
          {link.label}
        </NavLink>
      ))}
    </nav>,
    document.body
  );
}
