import ProductCard from "./ProductCard";
import type { Product } from "../types";

interface ProductGridCardProps {
  product: Product;
}

/** Envoltura fina sobre ProductCard para usarse dentro de ProductGrid. */
export default function ProductGridCard({ product }: ProductGridCardProps) {
  return <ProductCard product={product} />;
}
