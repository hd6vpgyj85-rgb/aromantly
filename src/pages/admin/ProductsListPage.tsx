import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useProducts } from "../../contexts/ProductsContext";
import { normalizeSearch } from "../../utils/normalize";
import { formatLevels, CATEGORY_LABELS } from "../../data/store";
import { formatPrice } from "../../utils/product";

type FilterKey = "todos" | "oferta" | "agotados" | "pocas";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "oferta", label: "En oferta" },
  { key: "agotados", label: "Agotados" },
  { key: "pocas", label: "Pocas unidades" },
];

export default function ProductsListPage() {
  const { products, deleteAllProducts, deleteProduct } = useProducts();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("todos");
  const [showDeleteAll, setShowDeleteAll] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = products;

    if (filter === "oferta") list = list.filter((p) => p.onSale);
    else if (filter === "agotados") list = list.filter((p) => p.stock <= 0);
    else if (filter === "pocas") list = list.filter((p) => p.stock > 0 && p.stock <= 3);

    const normalizedQuery = normalizeSearch(query);
    if (normalizedQuery) {
      list = list.filter((p) => {
        const haystack = normalizeSearch(`${p.name} ${p.brand} ${p.category}`);
        return haystack.includes(normalizedQuery);
      });
    }

    return list;
  }, [products, filter, query]);

  const handleDeleteAll = async () => {
    if (confirmText !== "delete products") return;
    setIsDeletingAll(true);
    setError(null);
    try {
      await deleteAllProducts();
      setShowDeleteAll(false);
      setConfirmText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar.");
    } finally {
      setIsDeletingAll(false);
    }
  };

  const handleDeleteOne = async (id: string) => {
    if (!confirm("¿Eliminar este producto?")) return;
    try {
      await deleteProduct(id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "No se pudo eliminar el producto.");
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>Productos</h1>
        <Link to="/admin/productos/nuevo" className="btn btn-primary admin-btn-sm">
          + Nuevo
        </Link>
      </div>

      <input
        className="admin-search"
        placeholder="Buscar por nombre, marca o categoría..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="admin-chip-row">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            className={`admin-chip ${filter === f.key ? "admin-chip-active" : ""}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="admin-inline-actions" style={{ marginBottom: 16 }}>
        <Link to="/admin/productos/importar" className="btn btn-secondary admin-btn-sm">
          Importar de Shopify
        </Link>
        <button type="button" className="btn btn-secondary admin-btn-sm admin-btn-danger" onClick={() => setShowDeleteAll(true)}>
          Eliminar todos
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="admin-empty">No hay productos que coincidan.</p>
      ) : (
        <div className="admin-list">
          {filtered.map((product) => (
            <div key={product.id} className="admin-row-card">
              <div className="admin-row-card-thumb">
                {product.images?.[0] && <img src={product.images[0]} alt={product.name} />}
              </div>
              <div className="admin-row-card-info">
                <div className="admin-row-card-title">{product.name}</div>
                <div className="admin-row-card-subtitle">
                  {product.brand} · {CATEGORY_LABELS[product.category] ?? product.category}
                  {formatLevels(product.levels) && ` · ${formatLevels(product.levels)}`}
                </div>
                <div className="admin-row-card-subtitle">
                  {formatPrice(product.price)} · Stock: {product.stock}
                  {product.onSale && <span className="admin-badge admin-badge-green" style={{ marginLeft: 6 }}>Oferta</span>}
                  {product.stock <= 0 && <span className="admin-badge admin-badge-red" style={{ marginLeft: 6 }}>Agotado</span>}
                </div>
              </div>
              <div className="admin-row-card-actions">
                <Link to={`/admin/productos/${product.id}`} className="admin-btn-icon" title="Editar">
                  ✎
                </Link>
                <button
                  type="button"
                  className="admin-btn-icon admin-btn-danger"
                  title="Eliminar"
                  onClick={() => handleDeleteOne(product.id)}
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showDeleteAll && (
        <div className="admin-modal-overlay" onClick={() => setShowDeleteAll(false)}>
          <div className="admin-modal admin-confirm-danger" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Eliminar todos los productos</h2>
              <button type="button" className="admin-modal-close" onClick={() => setShowDeleteAll(false)}>
                ×
              </button>
            </div>
            <p style={{ fontSize: 13, color: "var(--color-text-muted)", marginBottom: 14 }}>
              Esta acción no se puede deshacer. Escribe <strong>delete products</strong> para confirmar.
            </p>
            <input
              className="admin-search"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="delete products"
            />
            {error && <p className="admin-form-error">{error}</p>}
            <div className="admin-inline-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteAll(false)}>
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-primary admin-btn-danger"
                disabled={confirmText !== "delete products" || isDeletingAll}
                onClick={handleDeleteAll}
              >
                {isDeletingAll ? "Eliminando..." : "Eliminar todo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
