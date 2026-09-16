import { useState, type FormEvent } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useProducts } from "../../contexts/ProductsContext";
import { supabase, PRODUCT_IMAGES_BUCKET } from "../../lib/supabase";
import { compressImages } from "../../utils/image";
import type { Product, ProductCategory, ProductLevel } from "../../types";
import { LEVEL_OPTIONS } from "../../data/store";

const CATEGORY_OPTIONS: { value: ProductCategory; label: string }[] = [
  { value: "perfume", label: "Perfume" },
  { value: "eau de parfum", label: "Eau de Parfum" },
  { value: "eau de toilette", label: "Eau de Toilette" },
  { value: "eau de cologne", label: "Eau de Cologne" },
  { value: "eau fraiche", label: "Eau Fraiche" },
];

export default function ProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = id !== undefined;
  const { products, isLoading, getProduct } = useProducts();

  if (isLoading) return <p className="admin-empty">Cargando…</p>;

  const existing = isEditing ? getProduct(id) : undefined;
  if (isEditing && !existing) {
    return <Navigate to="/admin/productos" replace />;
  }

  return <ProductFormInner key={existing?.id ?? "new"} product={existing} allProducts={products} />;
}

interface ProductFormInnerProps {
  product?: Product;
  allProducts: Product[];
}

function ProductFormInner({ product, allProducts }: ProductFormInnerProps) {
  const navigate = useNavigate();
  const { createProduct, updateProduct, deleteProduct } = useProducts();

  const [name, setName] = useState(product?.name ?? "");
  const [price, setPrice] = useState(product?.price?.toString() ?? "");
  const [compareAtPrice, setCompareAtPrice] = useState(product?.compareAtPrice?.toString() ?? "");
  const [onSale, setOnSale] = useState(product?.onSale ?? false);
  const [category, setCategory] = useState<ProductCategory>(product?.category ?? "perfume");
  const [levels, setLevels] = useState<ProductLevel[]>(product?.levels ?? []);
  const [brand, setBrand] = useState(product?.brand ?? "");
  const [stock, setStock] = useState(product?.stock?.toString() ?? "0");
  const [vendor, setVendor] = useState(product?.vendor ?? "");
  const [sizesText, setSizesText] = useState((product?.sizes ?? []).join(", "));
  const [description, setDescription] = useState(product?.description ?? "");
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [homeImageFit, setHomeImageFit] = useState<"cover" | "contain">(product?.homeImageFit ?? "cover");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleLevel = (level: ProductLevel) => {
    setLevels((prev) => (prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]));
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setError(null);
    try {
      const compressed = await compressImages(Array.from(files));
      const uploadedUrls: string[] = [];

      for (const file of compressed) {
        const path = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${file.name}`;
        const { error: uploadError } = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).upload(path, file);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path);
        uploadedUrls.push(data.publicUrl);
      }

      setImages((prev) => [...prev, ...uploadedUrls]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron subir las imágenes.");
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const makeCover = (index: number) => {
    setImages((prev) => {
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.unshift(item);
      return next;
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const priceNumber = Number(price);
    if (!name.trim() || Number.isNaN(priceNumber)) {
      setError("Completa al menos el nombre y el precio.");
      return;
    }

    const compareAtNumber = compareAtPrice.trim() ? Number(compareAtPrice) : undefined;
    const sizes = sizesText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    setIsSaving(true);
    try {
      const payload = {
        name: name.trim(),
        price: priceNumber,
        compareAtPrice: compareAtNumber,
        onSale,
        category,
        levels: levels.length > 0 ? levels : undefined,
        brand: brand.trim(),
        stock: Number(stock) || 0,
        vendor: vendor.trim() || undefined,
        sizes: sizes.length > 0 ? sizes : undefined,
        description: description.trim() || undefined,
        images: images.length > 0 ? images : undefined,
        homeImageFit,
      };

      if (product) {
        await updateProduct(product.id, payload);
      } else {
        await createProduct(payload);
      }

      navigate("/admin/productos");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el producto.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!product) return;
    if (!confirm(`¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`)) return;
    try {
      await deleteProduct(product.id);
      navigate("/admin/productos");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar el producto.");
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>{product ? "Editar producto" : "Nuevo producto"}</h1>
      </div>

      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="admin-form-section">
          <h2>Imágenes</h2>
          <div className="admin-image-grid">
            {images.map((src, index) => (
              <div
                key={src}
                className={`admin-image-item ${index === 0 ? "admin-image-item-cover" : ""}`}
              >
                <img src={src} alt="" onClick={() => makeCover(index)} />
                {index === 0 && <span className="admin-image-cover-label">Portada</span>}
                <button type="button" className="admin-image-remove" onClick={() => removeImage(index)}>
                  ×
                </button>
              </div>
            ))}
          </div>
          <input type="file" accept="image/*" multiple onChange={(e) => handleUpload(e.target.files)} />
          {isUploading && <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Subiendo…</span>}

          <label className="admin-checkbox-pill" style={{ marginTop: 8 }}>
            <input
              type="checkbox"
              checked={homeImageFit === "contain"}
              onChange={(e) => setHomeImageFit(e.target.checked ? "contain" : "cover")}
            />
            Ajustar imagen de portada sin recortar (contain)
          </label>
        </div>

        <div className="admin-form-section">
          <h2>Información</h2>
          <input placeholder="Nombre" required value={name} onChange={(e) => setName(e.target.value)} />
          <div className="admin-form-row">
            <input
              placeholder="Precio"
              type="number"
              step="0.01"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <input
              placeholder="Precio de oferta (antes)"
              type="number"
              step="0.01"
              value={compareAtPrice}
              onChange={(e) => setCompareAtPrice(e.target.value)}
            />
          </div>
          <label className="admin-checkbox-pill">
            <input type="checkbox" checked={onSale} onChange={(e) => setOnSale(e.target.checked)} />
            Producto en oferta
          </label>
        </div>

        <div className="admin-form-section">
          <h2>Categoría</h2>
          <select value={category} onChange={(e) => setCategory(e.target.value as ProductCategory)}>
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="admin-form-section">
          <h2>Nivel (puedes elegir varios)</h2>
          <div className="admin-checkbox-group">
            {LEVEL_OPTIONS.map((opt) => (
              <label key={opt.slug} className="admin-checkbox-pill">
                <input
                  type="checkbox"
                  checked={levels.includes(opt.slug)}
                  onChange={() => toggleLevel(opt.slug)}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        <div className="admin-form-section">
          <h2>Marca y existencias</h2>
          <input placeholder="Marca" required value={brand} onChange={(e) => setBrand(e.target.value)} />
          <div className="admin-form-row">
            <input
              placeholder="Existencias"
              type="number"
              required
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            />
            <input placeholder="Proveedor (opcional)" value={vendor} onChange={(e) => setVendor(e.target.value)} />
          </div>
          <input
            placeholder="Presentaciones, separadas por coma (ej. 50ml, 100ml)"
            value={sizesText}
            onChange={(e) => setSizesText(e.target.value)}
          />
        </div>

        <div className="admin-form-section">
          <h2>Descripción</h2>
          <textarea
            rows={4}
            placeholder="Si la dejas vacía, se generará una descripción automática."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {error && <p className="admin-form-error">{error}</p>}

        <button type="submit" className="btn btn-primary btn-block" disabled={isSaving || isUploading}>
          {isSaving ? "Guardando..." : "Guardar producto"}
        </button>

        {product && (
          <button type="button" className="btn btn-secondary btn-block admin-btn-danger" onClick={handleDelete}>
            Eliminar producto
          </button>
        )}
      </form>

      {allProducts.length === 0 && <p className="admin-empty">Aún no tienes productos.</p>}
    </div>
  );
}
