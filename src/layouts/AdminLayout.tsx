import { Navigate, NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./AdminLayout.css";
import "../pages/admin/admin.css";

const BOTTOM_TABS = [
  { to: "/admin", label: "Panel", end: true },
  { to: "/admin/productos", label: "Productos" },
  { to: "/admin/categorias", label: "Categorías" },
  { to: "/admin/pedidos", label: "Pedidos" },
];

export default function AdminLayout() {
  const { session, isLoading, signOut } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="admin-gate">Cargando…</div>;
  }

  if (!session) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div className="admin-header-bar">
          <NavLink to="/admin" className="admin-logo">
            Aromantly
          </NavLink>

          <div className="admin-header-actions">
            <NavLink to="/admin/clientes" className="admin-header-icon" title="Clientes">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </NavLink>
            <NavLink to="/admin/resenas" className="admin-header-icon" title="Reseñas">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </NavLink>
            <NavLink to="/admin/cupones" className="admin-header-icon" title="Cupones">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
            </NavLink>
            <NavLink to="/admin/banner" className="admin-header-icon" title="Contenido de inicio">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <circle cx="8.5" cy="10" r="1.5" />
                <path d="m21 16-5-5-9 9" />
              </svg>
            </NavLink>

            <span className="admin-header-separator" />

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="admin-header-icon"
              title="Ver sitio"
              aria-label="Ver sitio"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </a>
            <button
              type="button"
              className="admin-header-icon"
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
              onClick={signOut}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="admin-main">
        <div key={location.pathname} className="page-transition">
          <Outlet />
        </div>
      </main>

      <nav className="admin-bottom-tabs">
        {BOTTOM_TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) => `admin-bottom-tab ${isActive ? "admin-bottom-tab-active" : ""}`}
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
