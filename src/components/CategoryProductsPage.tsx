import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { Product, ProductLevel } from "../types";
import { useProducts } from "../contexts/ProductsContext";
import { LEVEL_OPTIONS } from "../data/store";
import { extractBrandFromName } from "../utils/product";
import CategoryPhotoBanner from "./CategoryPhotoBanner";
import CategoryHero from "./CategoryHero";
import ProductFilters from "./ProductFilters";
import ProductGrid from "./ProductGrid";
import FeaturedCarousel from "./FeaturedCarousel";
import CategoryFooter from "./CategoryFooter";
import Reveal from "./Reveal";

export interface CategoryPageConfig {
  title: string;
  tagline: string;
  subtitle: string;
  bannerImage?: string;
  baseFilter: (product: Product) => boolean;
  /** Qué filtros mostrar, cada uno en su propia fila, combinados con Y. */
  filterTypes: ("nivel" | "marca")[];
}

export default function CategoryProductsPage({ config }: { config: CategoryPageConfig }) {
  const { products, isLoading } = useProducts();
  const [searchParams] = useSearchParams();

  const baseProducts = useMemo(() => products.filter(config.baseFilter), [products, config]);

  const showNivel = config.filterTypes.includes("nivel");
  const showMarca = config.filterTypes.includes("marca");

  const [nivelFilter, setNivelFilter] = useState<ProductLevel | null>(() => {
    const nivel = searchParams.get("nivel");
    return nivel ? (nivel as ProductLevel) : null;
  });
  const [marcaFilter, setMarcaFilter] = useState<string | null>(() => searchParams.get("marca"));

  const nivelOptions = useMemo(
    () => LEVEL_OPTIONS.map((opt) => ({ type: "nivel" as const, value: opt.slug, label: opt.label })),
    []
  );

  const marcaOptions = useMemo(() => {
    // La marca se detecta de la primera palabra del nombre del producto
    // (ej. "Armaf Club de Nuit" → "Armaf"), no del campo "marca" del admin,
    // que puede tener errores de dedo o mayúsculas inconsistentes.
    const brands = Array.from(new Set(baseProducts.map((p) => extractBrandFromName(p.name)).filter(Boolean)));
    brands.sort((a, b) => a.localeCompare(b));
    return brands.map((brand) => ({ type: "marca" as const, value: brand, label: brand }));
  }, [baseProducts]);

  const filteredProducts = useMemo(() => {
    return baseProducts.filter((p) => {
      if (showNivel && nivelFilter && !p.levels?.includes(nivelFilter)) return false;
      if (showMarca && marcaFilter && extractBrandFromName(p.name) !== marcaFilter) return false;
      return true;
    });
  }, [baseProducts, showNivel, nivelFilter, showMarca, marcaFilter]);

  return (
    <>
      <CategoryPhotoBanner
        title={config.title}
        tagline={config.tagline}
        image={config.bannerImage ?? "/images/category-banner.jpg"}
      />
      <div className="container">
        <Reveal direction="up">
          <CategoryHero title={config.title} subtitle={config.subtitle} />
        </Reveal>

        {showNivel && (
          <Reveal direction="up" delay={80}>
            <ProductFilters
              options={nivelOptions}
              activeFilter={nivelFilter ? { type: "nivel", value: nivelFilter } : null}
              onChange={(f) => setNivelFilter(f ? (f.value as ProductLevel) : null)}
            />
          </Reveal>
        )}

        {showMarca && (
          <Reveal direction="up" delay={showNivel ? 140 : 80}>
            <ProductFilters
              options={marcaOptions}
              activeFilter={marcaFilter ? { type: "marca", value: marcaFilter } : null}
              onChange={(f) => setMarcaFilter(f ? f.value : null)}
            />
          </Reveal>
        )}

        <ProductGrid products={filteredProducts} isLoading={isLoading} />
      </div>
      <FeaturedCarousel />
      <CategoryFooter />
    </>
  );
}
