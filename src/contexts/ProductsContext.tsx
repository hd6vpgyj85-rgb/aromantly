import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "../lib/supabase";
import type { Product } from "../types";
import { generateProductId } from "../utils/product";

interface ProductRow {
  id: string;
  name: string;
  price: number;
  compare_at_price: number | null;
  on_sale: boolean;
  levels: string[] | null;
  category: string;
  brand: string;
  stock: number;
  vendor: string | null;
  sizes: string[] | null;
  description: string | null;
  images: string[] | null;
  home_image_fit: string | null;
  created_at: string;
}

function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    compareAtPrice: row.compare_at_price ?? undefined,
    onSale: row.on_sale,
    levels: (row.levels as Product["levels"]) ?? undefined,
    category: row.category as Product["category"],
    brand: row.brand,
    stock: row.stock,
    vendor: row.vendor ?? undefined,
    sizes: row.sizes ?? undefined,
    description: row.description ?? undefined,
    images: row.images ?? undefined,
    homeImageFit: (row.home_image_fit as Product["homeImageFit"]) ?? "cover",
    createdAt: row.created_at,
  };
}

function productToRow(product: Product): Omit<ProductRow, "created_at"> {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    compare_at_price: product.compareAtPrice ?? null,
    on_sale: !!product.onSale,
    levels: product.levels && product.levels.length > 0 ? product.levels : null,
    category: product.category,
    brand: product.brand,
    stock: product.stock,
    vendor: product.vendor ?? null,
    sizes: product.sizes && product.sizes.length > 0 ? product.sizes : null,
    description: product.description ?? null,
    images: product.images && product.images.length > 0 ? product.images : null,
    home_image_fit: product.homeImageFit ?? "cover",
  };
}

interface ProductsContextValue {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getProduct: (id: string) => Product | undefined;
  createProduct: (product: Omit<Product, "id"> & { id?: string }) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  deleteAllProducts: () => Promise<void>;
  importProducts: (products: Product[]) => Promise<void>;
}

const ProductsContext = createContext<ProductsContextValue | undefined>(undefined);

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setIsLoading(false);
      return;
    }

    setProducts(((data ?? []) as ProductRow[]).map(rowToProduct));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const getProduct = useCallback(
    (id: string) => products.find((p) => p.id === id),
    [products]
  );

  const createProduct = useCallback(
    async (product: Omit<Product, "id"> & { id?: string }) => {
      const id = product.id ?? generateProductId(product.name, products);
      const full: Product = { ...product, id };
      const row = productToRow(full);

      const { data, error: insertError } = await supabase
        .from("products")
        .insert(row)
        .select()
        .single();

      if (insertError) throw insertError;

      const created = rowToProduct(data as ProductRow);
      setProducts((prev) => [created, ...prev]);
      return created;
    },
    [products]
  );

  const updateProduct = useCallback(async (id: string, updates: Partial<Product>) => {
    const current = products.find((p) => p.id === id);
    if (!current) throw new Error("Producto no encontrado");

    const merged = { ...current, ...updates };
    const row = productToRow(merged);

    const { error: updateError } = await supabase.from("products").update(row).eq("id", id);
    if (updateError) throw updateError;

    setProducts((prev) => prev.map((p) => (p.id === id ? merged : p)));
  }, [products]);

  const deleteProduct = useCallback(async (id: string) => {
    const { error: deleteError, count } = await supabase
      .from("products")
      .delete({ count: "exact" })
      .eq("id", id);

    if (deleteError) throw deleteError;
    if (!count) throw new Error("No se pudo eliminar el producto (bloqueado por RLS).");

    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const deleteAllProducts = useCallback(async () => {
    const { error: deleteError, count } = await supabase
      .from("products")
      .delete({ count: "exact" })
      .not("id", "is", null);

    if (deleteError) throw deleteError;
    if (!count) throw new Error("No se pudo eliminar (bloqueado por RLS).");

    setProducts([]);
  }, []);

  const importProducts = useCallback(async (newProducts: Product[]) => {
    const rows = newProducts.map(productToRow);
    const { error: upsertError } = await supabase.from("products").upsert(rows);
    if (upsertError) throw upsertError;
    await refresh();
  }, [refresh]);

  return (
    <ProductsContext.Provider
      value={{
        products,
        isLoading,
        error,
        refresh,
        getProduct,
        createProduct,
        updateProduct,
        deleteProduct,
        deleteAllProducts,
        importProducts,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error("useProducts debe usarse dentro de ProductsProvider");
  return ctx;
}
