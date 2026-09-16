import { useMemo, useState } from "react";
import { useProducts } from "../contexts/ProductsContext";
import { normalizeSearch } from "../utils/normalize";
import ProductGrid from "../components/ProductGrid";
import "./SearchPage.css";

export default function SearchPage() {
  const { products } = useProducts();
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const normalized = normalizeSearch(query);
    if (!normalized) return [];
    return products.filter(
      (p) => normalizeSearch(p.name).includes(normalized) || normalizeSearch(p.brand).includes(normalized)
    );
  }, [products, query]);

  return (
    <div className="container search-page">
      <h1>Buscar</h1>
      <input
        type="search"
        className="search-input"
        placeholder="Buscar por nombre o marca..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
      />
      {query.trim() ? (
        <ProductGrid products={results} emptyMessage={`No encontramos resultados para "${query}".`} />
      ) : (
        <p className="search-hint">Escribe el nombre de un perfume o una marca para empezar a buscar.</p>
      )}
    </div>
  );
}
