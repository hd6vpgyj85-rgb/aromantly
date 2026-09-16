import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "../lib/supabase";
import type { ProductStats } from "../types";

interface StatsRow {
  product_id: string;
  views: number;
  cart_adds: number;
  purchases: number;
}

function rowToStats(row: StatsRow): ProductStats {
  return {
    productId: row.product_id,
    views: row.views,
    cartAdds: row.cart_adds,
    purchases: row.purchases,
  };
}

interface AnalyticsContextValue {
  stats: ProductStats[];
  isLoading: boolean;
  refresh: () => Promise<void>;
  getStats: (productId: string) => ProductStats | undefined;
  registerView: (productId: string) => Promise<void>;
  registerCartAdd: (productId: string) => Promise<void>;
  getTopProducts: (limit: number) => string[];
}

const AnalyticsContext = createContext<AnalyticsContextValue | undefined>(undefined);

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<ProductStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const { data } = await supabase.from("product_stats").select("*");
    setStats(((data ?? []) as StatsRow[]).map(rowToStats));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const getStats = useCallback(
    (productId: string) => stats.find((s) => s.productId === productId),
    [stats]
  );

  const registerView = useCallback(async (productId: string) => {
    await supabase.rpc("increment_product_stat", { p_product_id: productId, p_field: "views" });
  }, []);

  const registerCartAdd = useCallback(async (productId: string) => {
    await supabase.rpc("increment_product_stat", { p_product_id: productId, p_field: "cart_adds" });
  }, []);

  const getTopProducts = useCallback(
    (limit: number) => {
      return [...stats]
        .sort((a, b) => b.views + b.cartAdds * 2 - (a.views + a.cartAdds * 2))
        .slice(0, limit)
        .map((s) => s.productId);
    },
    [stats]
  );

  return (
    <AnalyticsContext.Provider
      value={{ stats, isLoading, refresh, getStats, registerView, registerCartAdd, getTopProducts }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const ctx = useContext(AnalyticsContext);
  if (!ctx) throw new Error("useAnalytics debe usarse dentro de AnalyticsProvider");
  return ctx;
}
