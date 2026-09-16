import { Link } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { formatLevels } from "../data/store";
import { formatPrice } from "../utils/product";
import "./CartPage.css";

export default function CartPage() {
  const { lines, setQuantity, removeFromCart, subtotal } = useCart();

  if (lines.length === 0) {
    return (
      <div className="container cart-page cart-empty">
        <h1>Tu carrito</h1>
        <p>Aún no has agregado perfumes a tu carrito.</p>
        <Link to="/perfumes" className="btn btn-primary">
          Ver perfumes
        </Link>
      </div>
    );
  }

  return (
    <div className="container cart-page">
      <h1>Tu carrito</h1>

      <div className="cart-lines">
        {lines.map((line) => {
          const levelsLabel = formatLevels(line.product.levels);
          return (
            <div key={line.product.id} className="cart-line">
              <Link to={`/producto/${line.product.id}`} className="cart-line-image">
                {line.product.images?.[0] ? (
                  <img src={line.product.images[0]} alt={line.product.name} />
                ) : (
                  <div className="cart-line-image-placeholder" />
                )}
              </Link>
              <div className="cart-line-info">
                <Link to={`/producto/${line.product.id}`} className="cart-line-name">
                  {line.product.name}
                </Link>
                {levelsLabel && <span className="cart-line-level">{levelsLabel}</span>}
                <span className="cart-line-price">{formatPrice(line.product.price)}</span>

                <div className="cart-line-actions">
                  <div className="quantity-stepper">
                    <button type="button" onClick={() => setQuantity(line.product.id, line.quantity - 1)}>
                      −
                    </button>
                    <span>{line.quantity}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity(line.product.id, Math.min(line.product.stock, line.quantity + 1))
                      }
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    className="cart-line-remove"
                    onClick={() => removeFromCart(line.product.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="cart-summary">
        <div className="cart-summary-row">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <p className="cart-summary-note">Envío y descuentos se calculan en el siguiente paso.</p>
        <Link to="/checkout" className="btn btn-primary btn-block">
          Continuar al checkout
        </Link>
      </div>
    </div>
  );
}
