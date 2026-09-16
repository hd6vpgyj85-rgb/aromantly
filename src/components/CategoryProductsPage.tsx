import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { ActiveFilter, Product, ProductLevel } from "../types";
import { useProducts } from "../contexts/ProductsContext";
import { LEVEL_OPTIONS } from "../data/store";
import CategoryPhotoBanner from "./CategoryPhotoBanner";
import CategoryHero from "./CategoryHero";
import ProductFilters from "./ProductFilters";
import ProductGrid from "./ProductGrid";
import FeaturedCarousel from "./FeaturedCarousel";
import CategoryFooter from "./CategoryFooter";

export interface CategoryPageConfig {
  title: string;
  tagline: string;
  subtitle: string;
  bannerImage?: string;
  baseFilter: (product: Product) => boolean;
  filterType: "nivel" | "marca";
}

export default function CategoryProductsPage({ config }: { config: CategoryPageConfig }) {
  const { products } = useProducts();
  const [searchParams] = useSearchParams();

  const baseProducts = useMemo(() => products.filter(config.baseFilter), [products, config]);

  const initialFilter: ActiveFilter = useMemo(() => {
    if (config.filterType === "nivel") {
      const nivel = searchParams.get("nivel");
      if (nivel) return { type: "nivel", value: nivel as ProductLevel };
    } else {
      const marca = searchParams.get("marca");
      if (marca) return { type: "marca", value: marca };
    }
    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [activeFilter, setActiveFilter] = useState<ActiveFilter>(initialFilter);

  const filterOptions = useMemo(() => {
    if (config.filterType === "nivel") {
      return LEVEL_OPTIONS.map((opt) => ({ type: "nivel" as const, value: opt.slug, label: opt.label }));
    }
    const brands = Array.from(new Set(baseProducts.map((p) => p.brand))).sort((a, b) =>
      a.localeCompare(b)
    );
    return brands.map((brand) => ({ type: "marca" as const, value: brand, label: brand }));
  }, [config.filterType, baseProducts]);

  const filteredProducts = useMemo(() => {
    if (!activeFilter) return baseProducts;
    if (activeFilter.type === "nivel") {
      return baseProducts.filter((p) => p.levels?.includes(activeFilter.value as ProductLevel));
    }
    return baseProducts.filter((p) => p.brand === activeFilter.value);
  }, [baseProducts, activeFilter]);

  return (
    <>
      <CategoryPhotoBanner title={config.title} tagline={config.tagline} image={config.bannerImage} />
      <div className="container">
        <CategoryHero title={config.title} subtitle={config.subtitle} />
        <ProductFilters options={filterOptions} activeFilter={activeFilter} onChange={setActiveFilter} />
        <ProductGrid products={filteredProducts} />
      </div>
      <FeaturedCarousel />
      <CategoryFooter />
    </>
  );
}
