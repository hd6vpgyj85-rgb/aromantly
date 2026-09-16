import { Link } from "react-router-dom";
import { useOrders } from "../../contexts/OrdersContext";
import { formatPrice } from "../../utils/product";

export default function OrdersArchivePage() {
  const { archivedOrders, restoreOrder } = useOrders();

  return (
    <div>
      <div className="admin-page-header">
        <h1>Baúl de pedidos</h1>
        <Link to="/admin/pedidos" className="btn btn-secondary admin-btn-sm">
          Volver a pedidos
        </Link>
      </div>

      {archivedOrders.length === 0 ? (
        <p className="admin-empty">No hay pedidos archivados.</p>
      ) : (
        <div className="admin-list">
          {archivedOrders.map((order) => (
            <div key={order.id} className="admin-row-card">
              <div className="admin-row-card-info">
                <div className="admin-row-card-title">
                  {order.customer.nombre} {order.customer.apellido} · {formatPrice(order.total)}
                </div>
                <div className="admin-row-card-subtitle">
                  {new Date(order.createdAt).toLocaleDateString("es-MX")} · {order.status}
                </div>
              </div>
              <button type="button" className="btn btn-secondary admin-btn-sm" onClick={() => restoreOrder(order.id)}>
                Restaurar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
