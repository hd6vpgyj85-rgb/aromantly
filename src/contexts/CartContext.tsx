import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CartLine, Product } from "../types";
import { useAnalytics } from "./AnalyticsContext";
import { supabase } from "../lib/supabase";

const STORAGE_KEY = "aromantly_cart";

interface StoredLine {
  productId: string;
  quantity: number;
}

interface CartContextValue {
  lines: CartLine[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  itemCount: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

function readStoredLines(): StoredLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const { registerCartAdd } = useAnalytics();

  useEffect(() => {
    const stored = readStoredLines();
    if (stored.length === 0) {
      setIsHydrated(true);
      return;
    }

    (async () => {
      const ids = stored.map((s) => s.productId);
      const { data } = await supabase.from("products").select("*").in("id", ids);
      const products = (data ?? []) as Record<string, unknown>[];

      const restored: CartLine[] = stored
        .map((line) => {
          const row = products.find((p) => p.id === line.productId);
          if (!row) return null;
          const product: Product = {
            id: row.id as string,
            name: row.name as string,
            price: row.price as number,
            compareAtPrice: (row.compare_at_price as number) ?? undefined,
            onSale: row.on_sale as boolean,
            levels: (row.levels as Product["levels"]) ?? undefined,
            category: row.category as Product["category"],
            brand: row.brand as string,
            stock: row.stock as number,
            vendor: (row.vendor as string) ?? undefined,
            sizes: (row.sizes as string[]) ?? undefined,
            description: (row.description as string) ?? undefined,
            images: (row.images as string[]) ?? undefined,
            homeImageFit: (row.home_image_fit as Product["homeImageFit"]) ?? "cover",
          };
          return { product, quantity: line.quantity };
        })
        .filter((l): l is CartLine => l !== null);

      setLines(restored);
      setIsHydrated(true);
    })();
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    const toStore: StoredLine[] = lines.map((l) => ({ productId: l.product.id, quantity: l.quantity }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  }, [lines, isHydrated]);

  const addToCart = useCallback(
    (product: Product, quantity = 1) => {
      setLines((prev) => {
        const existing = prev.find((l) => l.product.id === product.id);
        if (existing) {
          return prev.map((l) =>
            l.product.id === product.id ? { ...l, quantity: l.quantity + quantity } : l
          );
        }
        return [...prev, { product, quantity }];
      });
      registerCartAdd(product.id);
    },
    [registerCartAdd]
  );

  const removeFromCart = useCallback((productId: string) => {
    setLines((prev) => prev.filter((l) => l.product.id !== productId));
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setLines((prev) => prev.filter((l) => l.product.id !== productId));
      return;
    }
    setLines((prev) => prev.map((l) => (l.product.id === productId ? { ...l, quantity } : l)));
  }, []);

  const clearCart = useCallback(() => {
    setLines([]);
  }, []);

  const subtotal = useMemo(
    () => lines.reduce((sum, l) => sum + l.product.price * l.quantity, 0),
    [lines]
  );

  const itemCount = useMemo(() => lines.reduce((sum, l) => sum + l.quantity, 0), [lines]);

  return (
    <CartContext.Provider
      value={{ lines, addToCart, removeFromCart, setQuantity, clearCart, subtotal, itemCount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider");
  return ctx;
}
