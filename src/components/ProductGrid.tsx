import type { Product } from "../types";
import ProductGridCard from "./ProductGridCard";
import "./ProductGrid.css";

interface ProductGridProps {
  products: Product[];
  emptyMessage?: string;
}

export default function ProductGrid({ products, emptyMessage }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="product-grid-empty">
        <p>{emptyMessage ?? "No encontramos productos con ese filtro."}</p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductGridCard key={product.id} product={product} />
      ))}
    </div>
  );
}
