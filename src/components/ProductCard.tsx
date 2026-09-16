import { Link } from "react-router-dom";
import type { Product } from "../types";
import { formatLevels } from "../data/store";
import { formatPrice } from "../utils/product";
import "./ProductCard.css";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const isOutOfStock = product.stock <= 0;
  const isOnSale = !!product.onSale && !!product.compareAtPrice;
  const cover = product.images?.[0];
  const fit = product.homeImageFit ?? "cover";
  const levelsLabel = formatLevels(product.levels);

  return (
    <Link to={`/producto/${product.id}`} className="product-card">
      <div className="product-card-image">
        {cover ? (
          <img src={cover} alt={product.name} style={{ objectFit: fit }} loading="lazy" />
        ) : (
          <div className="product-card-image-placeholder" />
        )}
        {isOutOfStock ? (
          <span className="product-badge product-badge-sold-out">Agotado</span>
        ) : isOnSale ? (
          <span className="product-badge product-badge-sale">Oferta</span>
        ) : null}
      </div>
      <div className="product-card-info">
        <span className="product-card-brand">{product.brand}</span>
        <h3 className="product-card-name">{product.name}</h3>
        {levelsLabel && <span className="product-card-level">{levelsLabel}</span>}
        <div className="product-card-price">
          {isOnSale && (
            <span className="product-card-price-old">{formatPrice(product.compareAtPrice!)}</span>
          )}
          <span className="product-card-price-current">{formatPrice(product.price)}</span>
        </div>
      </div>
    </Link>
  );
}
