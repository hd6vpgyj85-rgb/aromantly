import { Link } from "react-router-dom";
import { useCoupons } from "../../contexts/CouponsContext";
import { formatPrice } from "../../utils/product";

export default function CouponsPage() {
  const { coupons, toggleActive, deleteCoupon } = useCoupons();

  return (
    <div>
      <div className="admin-page-header">
        <h1>Cupones</h1>
        <Link to="/admin/cupones/nuevo" className="btn btn-primary admin-btn-sm">
          + Nuevo
        </Link>
      </div>

      {coupons.length === 0 ? (
        <p className="admin-empty">No hay cupones creados.</p>
      ) : (
        <div className="admin-list">
          {coupons.map((coupon) => (
            <div key={coupon.code} className="admin-row-card">
              <div className="admin-row-card-info">
                <div className="admin-row-card-title">{coupon.code}</div>
                <div className="admin-row-card-subtitle">
                  {coupon.discountType === "percentage"
                    ? `${coupon.discountValue}% de descuento`
                    : `${formatPrice(coupon.discountValue)} de descuento`}{" "}
                  · Usado {coupon.timesUsed}/{coupon.usageLimit}
                </div>
                <span className={`admin-badge ${coupon.active ? "admin-badge-green" : "admin-badge-gray"}`}>
                  {coupon.active ? "Activo" : "Inactivo"}
                </span>
              </div>
              <div className="admin-row-card-actions">
                <button
                  type="button"
                  className="btn btn-secondary admin-btn-sm"
                  onClick={() => toggleActive(coupon.code, !coupon.active)}
                >
                  {coupon.active ? "Desactivar" : "Activar"}
                </button>
                <button
                  type="button"
                  className="admin-btn-icon admin-btn-danger"
                  onClick={() => {
                    if (confirm(`¿Eliminar el cupón ${coupon.code}?`)) deleteCoupon(coupon.code);
                  }}
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
