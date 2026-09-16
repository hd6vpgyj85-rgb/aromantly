import { useProducts } from "../../contexts/ProductsContext";
import { CATEGORY_LABELS } from "../../data/store";
import type { ProductCategory } from "../../types";

const CATEGORIES: ProductCategory[] = [
  "perfume",
  "eau de parfum",
  "eau de toilette",
  "eau de cologne",
  "eau fraiche",
];

export default function CategoriesPage() {
  const { products } = useProducts();

  return (
    <div>
      <div className="admin-page-header">
        <h1>Categorías</h1>
      </div>

      <div className="admin-list">
        {CATEGORIES.map((category) => {
          const count = products.filter((p) => p.category === category).length;
          return (
            <div key={category} className="admin-row-card">
              <div className="admin-row-card-info">
                <div className="admin-row-card-title">{CATEGORY_LABELS[category]}</div>
              </div>
              <span className="admin-badge admin-badge-green">{count} productos</span>
            </div>
          );
        })}

        <div className="admin-row-card">
          <div className="admin-row-card-info">
            <div className="admin-row-card-title">Ofertas</div>
          </div>
          <span className="admin-badge admin-badge-green">
            {products.filter((p) => p.onSale).length} productos
          </span>
        </div>
      </div>
    </div>
  );
}
