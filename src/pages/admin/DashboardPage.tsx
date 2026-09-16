import { Link } from "react-router-dom";
import { useProducts } from "../../contexts/ProductsContext";
import { useOrders } from "../../contexts/OrdersContext";
import { useReviews } from "../../contexts/ReviewsContext";
import { useCoupons } from "../../contexts/CouponsContext";
import { useCustomers } from "../../contexts/CustomersContext";

export default function DashboardPage() {
  const { products } = useProducts();
  const { activeOrders } = useOrders();
  const { pendingReviews } = useReviews();
  const { coupons } = useCoupons();
  const { customers } = useCustomers();

  const pendingOrders = activeOrders.filter((o) => o.status === "pendiente");
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 3);
  const outOfStock = products.filter((p) => p.stock <= 0);
  const activeCoupons = coupons.filter((c) => c.active);

  return (
    <div>
      <div className="admin-page-header">
        <h1>Panel</h1>
      </div>

      <div className="admin-stat-grid">
        <Link to="/admin/productos" className="admin-stat-card">
          <span className="admin-stat-card-value">{products.length}</span>
          <span className="admin-stat-card-label">Productos</span>
        </Link>
        <Link to="/admin/pedidos" className="admin-stat-card">
          <span className="admin-stat-card-value">{pendingOrders.length}</span>
          <span className="admin-stat-card-label">Pedidos pendientes</span>
        </Link>
        <Link to="/admin/resenas" className="admin-stat-card">
          <span className="admin-stat-card-value">{pendingReviews.length}</span>
          <span className="admin-stat-card-label">Reseñas por revisar</span>
        </Link>
        <Link to="/admin/clientes" className="admin-stat-card">
          <span className="admin-stat-card-value">{customers.length}</span>
          <span className="admin-stat-card-label">Clientes</span>
        </Link>
        <div className="admin-stat-card">
          <span className="admin-stat-card-value">{lowStock.length}</span>
          <span className="admin-stat-card-label">Pocas unidades</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-card-value">{outOfStock.length}</span>
          <span className="admin-stat-card-label">Agotados</span>
        </div>
        <Link to="/admin/cupones" className="admin-stat-card">
          <span className="admin-stat-card-value">{activeCoupons.length}</span>
          <span className="admin-stat-card-label">Cupones activos</span>
        </Link>
        <Link to="/admin/pedidos/baul" className="admin-stat-card">
          <span className="admin-stat-card-value">
            {activeOrders.length}
          </span>
          <span className="admin-stat-card-label">Pedidos activos</span>
        </Link>
      </div>
    </div>
  );
}
