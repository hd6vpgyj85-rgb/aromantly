import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useProducts } from "../contexts/ProductsContext";
import { useAnalytics } from "../contexts/AnalyticsContext";
import { useCart } from "../contexts/CartContext";
import { formatLevels } from "../data/store";
import { formatPrice, getDisplayDescription } from "../utils/product";
import ProductImageGallery from "../components/ProductImageGallery";
import Accordion from "../components/Accordion";
import RelatedProducts from "../components/RelatedProducts";
import "./ProductDetailPage.css";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { products, isLoading, getProduct } = useProducts();
  const { registerView } = useAnalytics();
  const { addToCart } = useCart();

  const product = id ? getProduct(id) : undefined;
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const hasRegisteredView = useRef(false);

  useEffect(() => {
    if (product && !hasRegisteredView.current) {
      hasRegisteredView.current = true;
      registerView(product.id);
    }
  }, [product, registerView]);

  if (isLoading) return null;
  if (!product) return <Navigate to="/404" replace />;

  const isOutOfStock = product.stock <= 0;
  const isOnSale = !!product.onSale && !!product.compareAtPrice;
  const levelsLabel = formatLevels(product.levels);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <div className="container product-detail">
      <div className="product-detail-grid">
        <ProductImageGallery images={product.images ?? []} alt={product.name} />

        <div className="product-detail-info">
          <span className="product-detail-brand">{product.brand}</span>
          <h1>{product.name}</h1>
          {levelsLabel && <span className="product-detail-level">{levelsLabel}</span>}

          <div className="product-detail-price">
            {isOnSale && (
              <span className="product-detail-price-old">{formatPrice(product.compareAtPrice!)}</span>
            )}
            <span className="product-detail-price-current">{formatPrice(product.price)}</span>
            {isOutOfStock ? (
              <span className="product-badge product-badge-sold-out">Agotado</span>
            ) : isOnSale ? (
              <span className="product-badge product-badge-sale">Oferta</span>
            ) : null}
          </div>

          {!isOutOfStock && (
            <div className="product-detail-quantity">
              <span>Cantidad</span>
              <div className="quantity-stepper">
                <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                  −
                </button>
                <span>{quantity}</span>
                <button type="button" onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}>
                  +
                </button>
              </div>
            </div>
          )}

          <button
            type="button"
            className="btn btn-primary btn-block product-detail-add"
            disabled={isOutOfStock}
            onClick={handleAddToCart}
          >
            {isOutOfStock ? "Agotado" : justAdded ? "¡Agregado!" : "Agregar al carrito"}
          </button>

          {justAdded && (
            <Link to="/carrito" className="product-detail-cart-link">
              Ver carrito →
            </Link>
          )}

          <p className="product-detail-description">{getDisplayDescription(product)}</p>

          <div className="product-detail-accordions">
            <Accordion title="Detalles" defaultOpen>
              <ul>
                <li>Marca: {product.brand}</li>
                {levelsLabel && <li>Nivel: {levelsLabel}</li>}
                {product.vendor && <li>Proveedor: {product.vendor}</li>}
                {product.sizes && product.sizes.length > 0 && <li>Presentaciones: {product.sizes.join(", ")}</li>}
              </ul>
            </Accordion>
            <Accordion title="Envíos y devoluciones">
              <p>
                Envíos a todo Cd. Juárez. Coordina la entrega o recolección directamente por WhatsApp al
                finalizar tu pedido. Si tu perfume llega dañado o no es el correcto, contáctanos dentro de las
                primeras 48 horas para resolverlo sin costo.
              </p>
            </Accordion>
          </div>
        </div>
      </div>

      <RelatedProducts excludeId={product.id} />

      {products.length === 0 && <p className="product-detail-empty">Cargando catálogo…</p>}
    </div>
  );
}
