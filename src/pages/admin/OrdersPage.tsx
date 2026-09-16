import { Link } from "react-router-dom";
import { useOrders } from "../../contexts/OrdersContext";
import { formatPrice } from "../../utils/product";
import type { OrderStatus } from "../../types";

const STATUS_OPTIONS: OrderStatus[] = ["pendiente", "en proceso", "completado", "cancelado"];

const STATUS_BADGE: Record<OrderStatus, string> = {
  pendiente: "admin-badge-orange",
  "en proceso": "admin-badge-green",
  completado: "admin-badge-green",
  cancelado: "admin-badge-red",
};

export default function OrdersPage() {
  const { activeOrders, updateStatus, archiveOrder } = useOrders();

  return (
    <div>
      <div className="admin-page-header">
        <h1>Pedidos</h1>
        <Link to="/admin/pedidos/baul" className="btn btn-secondary admin-btn-sm">
          Baúl
        </Link>
      </div>

      {activeOrders.length === 0 ? (
        <p className="admin-empty">No hay pedidos activos.</p>
      ) : (
        <div className="admin-list">
          {activeOrders.map((order) => (
            <div key={order.id} className="admin-row-card" style={{ alignItems: "flex-start" }}>
              <div className="admin-row-card-info">
                <div className="admin-row-card-title">
                  {order.customer.nombre} {order.customer.apellido} · {formatPrice(order.total)}
                </div>
                <div className="admin-row-card-subtitle">
                  {order.customer.telefono} · {new Date(order.createdAt).toLocaleString("es-MX")}
                </div>
                <div className="admin-row-card-subtitle">
                  {order.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}
                </div>
                <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <span className={`admin-badge ${STATUS_BADGE[order.status]}`}>{order.status}</span>
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)}
                    style={{ padding: "6px 10px", fontSize: 12, width: "auto" }}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn btn-secondary admin-btn-sm"
                    onClick={() => archiveOrder(order.id)}
                  >
                    Archivar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
