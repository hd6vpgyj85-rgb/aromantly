import { useMemo } from "react";
import { useProducts } from "../contexts/ProductsContext";
import ProductCard from "./ProductCard";
import "./RelatedProducts.css";

function pickRandom<T>(items: T[], count: number): T[] {
  const shuffled = [...items].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

interface RelatedProductsProps {
  excludeId: string;
}

export default function RelatedProducts({ excludeId }: RelatedProductsProps) {
  const { products } = useProducts();

  const related = useMemo(() => {
    const pool = products.filter((p) => p.id !== excludeId);
    return pickRandom(pool, Math.min(4, pool.length));
  }, [products, excludeId]);

  if (related.length === 0) return null;

  return (
    <section className="related-products">
      <h2>También te puede interesar</h2>
      <div className="related-products-grid">
        {related.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
