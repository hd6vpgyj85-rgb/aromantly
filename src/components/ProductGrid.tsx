import type { Product } from "../types";
import ProductGridCard from "./ProductGridCard";
import "./ProductGrid.css";

interface ProductGridProps {
  products: Product[];
  emptyMessage?: string;
  isLoading?: boolean;
  /** Cuántos esqueletos mostrar mientras carga. */
  skeletonCount?: number;
}

export default function ProductGrid({
  products,
  emptyMessage,
  isLoading = false,
  skeletonCount = 6,
}: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="product-grid">
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <div key={index} className="product-card-skeleton">
            <div className="skeleton product-card-skeleton-image" />
            <div className="product-card-skeleton-info">
              <div className="skeleton product-card-skeleton-line product-card-skeleton-line-sm" />
              <div className="skeleton product-card-skeleton-line" />
              <div className="skeleton product-card-skeleton-line product-card-skeleton-line-md" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="product-grid-empty anim-fade-in">
        <p>{emptyMessage ?? "No encontramos productos con ese filtro."}</p>
      </div>
    );
  }

  return (
    <div className="product-grid stagger" key={products.map((p) => p.id).join("-")}>
      {products.map((product) => (
        <ProductGridCard key={product.id} product={product} />
      ))}
    </div>
  );
}
