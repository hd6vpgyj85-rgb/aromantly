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

            <span className="admin-header-separator" />

            <a href="/" target="_blank" rel="noopener noreferrer" className="admin-header-text-action">
              Ver sitio
            </a>
            <button type="button" className="admin-header-text-action" onClick={signOut}>
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="admin-main">
        <Outlet />
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
