import { useEffect, useMemo, useState } from "react";
import type { ProductLevel } from "../types";
import { useProducts } from "../contexts/ProductsContext";
import { normalizeSearch } from "../utils/normalize";
import { extractBrandFromName } from "../utils/product";
import { LEVEL_OPTIONS } from "../data/store";
import ProductFilters from "../components/ProductFilters";
import ProductGrid from "../components/ProductGrid";
import Reveal from "../components/Reveal";
import "./SearchPage.css";

export default function SearchPage() {
  const { products, isLoading } = useProducts();
  const [query, setQuery] = useState("");
  const [nivelFilter, setNivelFilter] = useState<ProductLevel | null>(null);
  const [marcaFilter, setMarcaFilter] = useState<string | null>(null);
  const [hintIndex, setHintIndex] = useState(0);

  // El placeholder va rotando entre marcas reales del catálogo, para que
  // el cliente vea de una qué puede escribir.
  const searchHints = useMemo(() => {
    const brands = Array.from(new Set(products.map((p) => extractBrandFromName(p.name)).filter(Boolean)));
    return brands.length > 0 ? brands.slice(0, 6) : ["una marca", "un perfume"];
  }, [products]);

  useEffect(() => {
    if (searchHints.length < 2) return;
    const timer = setInterval(() => setHintIndex((i) => (i + 1) % searchHints.length), 2600);
    return () => clearInterval(timer);
  }, [searchHints]);

  const nivelOptions = useMemo(
    () => LEVEL_OPTIONS.map((opt) => ({ type: "nivel" as const, value: opt.slug, label: opt.label })),
    []
  );

  const marcaOptions = useMemo(() => {
    // La marca se detecta de la primera palabra del nombre del producto
    // (ej. "Armaf Club de Nuit" → "Armaf"), igual que en las páginas de
    // categoría, en vez del campo "marca" capturado a mano en el admin.
    const brands = Array.from(new Set(products.map((p) => extractBrandFromName(p.name)).filter(Boolean)));
    brands.sort((a, b) => a.localeCompare(b));
    return brands.map((brand) => ({ type: "marca" as const, value: brand, label: brand }));
  }, [products]);

  const results = useMemo(() => {
    const normalized = normalizeSearch(query);
    return products.filter((p) => {
      if (normalized) {
        const matchesText =
          normalizeSearch(p.name).includes(normalized) || normalizeSearch(p.brand).includes(normalized);
        if (!matchesText) return false;
      }
      if (nivelFilter && !p.levels?.includes(nivelFilter)) return false;
      if (marcaFilter && extractBrandFromName(p.name) !== marcaFilter) return false;
      return true;
    });
  }, [products, query, nivelFilter, marcaFilter]);

  const hasActiveFilters = nivelFilter !== null || marcaFilter !== null;

  return (
    <div className="container search-page">
      <h1>Buscar</h1>

      <div className="search-input-wrap">
        <input
          type="search"
          className="search-input"
          placeholder={`Busca "${searchHints[hintIndex] ?? ""}"...`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        {query && (
          <button
            type="button"
            className="search-input-clear"
            aria-label="Borrar búsqueda"
            onClick={() => setQuery("")}
          >
            ×
          </button>
        )}
      </div>

      <Reveal direction="up" delay={80}>
        <ProductFilters
          options={nivelOptions}
          activeFilter={nivelFilter ? { type: "nivel", value: nivelFilter } : null}
          onChange={(f) => setNivelFilter(f ? (f.value as ProductLevel) : null)}
        />
      </Reveal>

      <Reveal direction="up" delay={140}>
        <ProductFilters
          options={marcaOptions}
          activeFilter={marcaFilter ? { type: "marca", value: marcaFilter } : null}
          onChange={(f) => setMarcaFilter(f ? f.value : null)}
        />
      </Reveal>

      <p className="search-count anim-fade-in" key={results.length}>
        {results.length} {results.length === 1 ? "producto encontrado" : "productos encontrados"}
      </p>

      <ProductGrid
        products={results}
        isLoading={isLoading}
        emptyMessage={
          query.trim() || hasActiveFilters
            ? "No encontramos productos con esa búsqueda."
            : "No hay productos disponibles."
        }
      />
    </div>
  );
}
