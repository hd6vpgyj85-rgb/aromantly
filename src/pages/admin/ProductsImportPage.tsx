import { useState } from "react";
import Papa from "papaparse";
import JSZip from "jszip";
import { useNavigate } from "react-router-dom";
import { useProducts } from "../../contexts/ProductsContext";
import { supabase, PRODUCT_IMAGES_BUCKET } from "../../lib/supabase";
import { generateProductId } from "../../utils/product";
import { LEVEL_OPTIONS } from "../../data/store";
import {
  groupShopifyRows,
  markDuplicates,
  type ImportedProductDraft,
  type ShopifyCsvRow,
} from "../../utils/shopifyImport";
import type { ProductLevel } from "../../types";

export default function ProductsImportPage() {
  const navigate = useNavigate();
  const { products, importProducts } = useProducts();

  const [drafts, setDrafts] = useState<ImportedProductDraft[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setIsParsing(true);
    setDrafts([]);
    setSelected(new Set());

    try {
      let csvText: string;

      if (file.name.toLowerCase().endsWith(".zip")) {
        const zip = await JSZip.loadAsync(file);
        const csvEntry = Object.values(zip.files).find(
          (f) => !f.dir && f.name.toLowerCase().endsWith(".csv")
        );
        if (!csvEntry) throw new Error("No encontramos un archivo .csv dentro del .zip.");
        csvText = await csvEntry.async("text");
      } else {
        csvText = await file.text();
      }

      const parsed = Papa.parse<ShopifyCsvRow>(csvText, { header: true, skipEmptyLines: true });
      const grouped = groupShopifyRows(parsed.data);
      const withDuplicates = markDuplicates(grouped, products.map((p) => p.name));

      setDrafts(withDuplicates);
      setSelected(new Set(withDuplicates.filter((d) => !d.isPossibleDuplicate).map((d) => d.handle)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo leer el archivo.");
    } finally {
      setIsParsing(false);
    }
  };

  const toggleSelected = (handle: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(handle)) next.delete(handle);
      else next.add(handle);
      return next;
    });
  };

  const toggleLevel = (handle: string, level: ProductLevel) => {
    setDrafts((prev) =>
      prev.map((d) =>
        d.handle === handle
          ? { ...d, levels: d.levels.includes(level) ? d.levels.filter((l) => l !== level) : [...d.levels, level] }
          : d
      )
    );
  };

  const uploadImageFromUrl = async (url: string): Promise<string> => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("fetch failed");
      const blob = await response.blob();
      const filename = url.split("/").pop()?.split("?")[0] ?? `${Date.now()}.jpg`;
      const path = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${filename}`;
      const { error: uploadError } = await supabase.storage
        .from(PRODUCT_IMAGES_BUCKET)
        .upload(path, blob);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path);
      return data.publicUrl;
    } catch {
      // si falla la descarga/subida, usamos la URL original como respaldo
      return url;
    }
  };

  const handleImport = async () => {
    const toImport = drafts.filter((d) => selected.has(d.handle));
    if (toImport.length === 0) return;

    setIsImporting(true);
    setError(null);

    try {
      const existingProducts = [...products];
      const newProducts = [];

      for (let i = 0; i < toImport.length; i++) {
        const draft = toImport[i];
        setProgress(`Importando ${i + 1} de ${toImport.length}: ${draft.name}`);

        const uploadedImages: string[] = [];
        for (const url of draft.imageUrls) {
          uploadedImages.push(await uploadImageFromUrl(url));
        }

        const id = generateProductId(draft.name, [...existingProducts, ...newProducts]);
        const product = {
          id,
          name: draft.name,
          price: draft.price,
          compareAtPrice: draft.compareAtPrice,
          onSale: draft.onSale,
          levels: draft.levels.length > 0 ? draft.levels : undefined,
          category: draft.category,
          brand: draft.brand,
          stock: draft.stock,
          sizes: draft.sizes.length > 0 ? draft.sizes : undefined,
          description: draft.description,
          images: uploadedImages.length > 0 ? uploadedImages : undefined,
          homeImageFit: "cover" as const,
        };

        newProducts.push(product);
      }

      await importProducts(newProducts);
      navigate("/admin/productos");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo completar la importación.");
    } finally {
      setIsImporting(false);
      setProgress("");
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>Importar de Shopify</h1>
      </div>

      <p style={{ fontSize: 13, color: "var(--color-text-muted)", marginBottom: 14 }}>
        Sube el archivo <strong>.zip</strong> completo de tu exportación de Shopify o directamente el{" "}
        <strong>products_export.csv</strong>.
      </p>

      <input
        type="file"
        accept=".zip,.csv"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {isParsing && <p className="admin-empty">Leyendo archivo…</p>}
      {error && <p className="admin-form-error">{error}</p>}

      {drafts.length > 0 && (
        <>
          <p style={{ fontSize: 13, color: "var(--color-text-muted)", margin: "20px 0 10px" }}>
            {drafts.length} productos encontrados · {selected.size} seleccionados para importar
          </p>

          <div className="admin-list">
            {drafts.map((draft) => (
              <div key={draft.handle} className="admin-row-card" style={{ alignItems: "flex-start" }}>
                <input
                  type="checkbox"
                  checked={selected.has(draft.handle)}
                  onChange={() => toggleSelected(draft.handle)}
                  style={{ width: "auto", marginTop: 4 }}
                />
                <div className="admin-row-card-info">
                  <div className="admin-row-card-title">
                    {draft.name}
                    {draft.isPossibleDuplicate && (
                      <span className="admin-badge admin-badge-orange" style={{ marginLeft: 8 }}>
                        Posible duplicado
                      </span>
                    )}
                  </div>
                  <div className="admin-row-card-subtitle">
                    {draft.brand} · {draft.category} · ${draft.price} · Stock {draft.stock} ·{" "}
                    {draft.imageUrls.length} imágenes
                  </div>
                  <div className="admin-checkbox-group" style={{ marginTop: 8 }}>
                    {LEVEL_OPTIONS.map((opt) => (
                      <label key={opt.slug} className="admin-checkbox-pill">
                        <input
                          type="checkbox"
                          checked={draft.levels.includes(opt.slug)}
                          onChange={() => toggleLevel(draft.handle, opt.slug)}
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {progress && <p style={{ fontSize: 13, color: "var(--color-accent-neon)", marginTop: 14 }}>{progress}</p>}

          <button
            type="button"
            className="btn btn-primary btn-block"
            style={{ marginTop: 20 }}
            disabled={selected.size === 0 || isImporting}
            onClick={handleImport}
          >
            {isImporting ? "Importando..." : `Importar ${selected.size} productos`}
          </button>
        </>
      )}
    </div>
  );
}
