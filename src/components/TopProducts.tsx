import { useMemo } from "react";
import { useProducts } from "../contexts/ProductsContext";
import { useAnalytics } from "../contexts/AnalyticsContext";
import ProductCard from "./ProductCard";
import "./TopProducts.css";

function pickRandom<T>(items: T[], count: number): T[] {
  const shuffled = [...items].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export default function TopProducts() {
  const { products } = useProducts();
  const { getTopProducts } = useAnalytics();

  const topThree = useMemo(() => {
    const topIds = getTopProducts(3);
    const byId = topIds
      .map((id) => products.find((p) => p.id === id))
      .filter((p): p is NonNullable<typeof p> => !!p);

    if (byId.length >= 3) return byId;

    const remaining = products.filter((p) => !byId.some((b) => b.id === p.id));
    const filler = pickRandom(remaining, 3 - byId.length);
    return [...byId, ...filler];
  }, [products, getTopProducts]);

  if (topThree.length === 0) return null;

  return (
    <section className="top-products" id="top-perfumes">
      <div className="container">
        <h2>Top productos de la semana</h2>
        <div className="top-products-grid stagger-reveal">
          {topThree.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
