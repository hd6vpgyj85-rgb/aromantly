import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { formatPrice } from "../utils/product";
import type { LastAdded } from "../contexts/CartContext";
import "./CartToast.css";

const VISIBLE_MS = 3200;

/**
 * Aviso que aparece abajo cuando se agrega algo al carrito, con la foto y
 * el nombre del producto. Se va solo, o se puede cerrar antes.
 */
export default function CartToast() {
  const { lastAdded } = useCart();
  const [shown, setShown] = useState<LastAdded | null>(null);

  useEffect(() => {
    if (!lastAdded) return;
    setShown(lastAdded);
    const timer = setTimeout(() => setShown(null), VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [lastAdded]);

  if (!shown) return null;

  const { product, quantity } = shown;

  return createPortal(
    // key reinicia la animación si se agrega otra cosa mientras sigue visible
    <div className="cart-toast" key={shown.key} role="status" aria-live="polite">
      <div className="cart-toast-thumb">
        {product.images?.[0] ? (
          <img src={product.images[0]} alt="" />
        ) : (
          <span className="cart-toast-thumb-placeholder" />
        )}
        <span className="cart-toast-check" aria-hidden="true">
          ✓
        </span>
      </div>

      <div className="cart-toast-body">
        <span className="cart-toast-title">Agregado al carrito</span>
        <span className="cart-toast-name">
          {quantity > 1 ? `${quantity} × ` : ""}
          {product.name}
        </span>
        <span className="cart-toast-price">{formatPrice(product.price * quantity)}</span>
      </div>

      <Link to="/carrito" className="cart-toast-link" onClick={() => setShown(null)}>
        Ver
      </Link>

      <button
        type="button"
        className="cart-toast-close"
        aria-label="Cerrar aviso"
        onClick={() => setShown(null)}
      >
        ×
      </button>

      <span className="cart-toast-timer" aria-hidden="true" />
    </div>,
    document.body
  );
}
