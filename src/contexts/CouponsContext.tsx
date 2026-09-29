import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "../lib/supabase";
import type { Coupon, CouponScope, DiscountType } from "../types";

interface CouponRow {
  code: string;
  discount_type: string;
  discount_value: number;
  scope: string;
  usage_limit: number;
  times_used: number;
  active: boolean;
  created_at: string;
}

function rowToCoupon(row: CouponRow): Coupon {
  return {
    code: row.code,
    discountType: row.discount_type as DiscountType,
    discountValue: row.discount_value,
    scope: (row.scope as CouponScope) ?? "cart",
    usageLimit: row.usage_limit,
    timesUsed: row.times_used,
    active: row.active,
    createdAt: row.created_at,
  };
}

interface CreateCouponInput {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  scope: CouponScope;
  usageLimit: number;
}

interface RedeemResult {
  discountType: DiscountType;
  discountValue: number;
}

interface CouponsContextValue {
  coupons: Coupon[];
  isLoading: boolean;
  refresh: () => Promise<void>;
  createCoupon: (input: CreateCouponInput) => Promise<Coupon>;
  toggleActive: (code: string, active: boolean) => Promise<void>;
  deleteCoupon: (code: string) => Promise<void>;
  /** itemCount: cantidad total de artículos en el carrito, para validar cupones de un solo producto. */
  redeemCoupon: (code: string, itemCount: number) => Promise<RedeemResult>;
}

const CouponsContext = createContext<CouponsContextValue | undefined>(undefined);

export function CouponsProvider({ children }: { children: ReactNode }) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    setCoupons(((data ?? []) as CouponRow[]).map(rowToCoupon));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createCoupon = useCallback(async (input: CreateCouponInput) => {
    const { data, error } = await supabase
      .from("coupons")
      .insert({
        code: input.code.toUpperCase(),
        discount_type: input.discountType,
        discount_value: input.discountValue,
        scope: input.scope,
        usage_limit: input.usageLimit,
        times_used: 0,
        active: true,
      })
      .select()
      .single();

    if (error) throw error;

    const created = rowToCoupon(data as CouponRow);
    setCoupons((prev) => [created, ...prev]);
    return created;
  }, []);

  const toggleActive = useCallback(async (code: string, active: boolean) => {
    const { error } = await supabase.from("coupons").update({ active }).eq("code", code);
    if (error) throw error;
    setCoupons((prev) => prev.map((c) => (c.code === code ? { ...c, active } : c)));
  }, []);

  const deleteCoupon = useCallback(async (code: string) => {
    const { error, count } = await supabase.from("coupons").delete({ count: "exact" }).eq("code", code);
    if (error) throw error;
    if (!count) throw new Error("No se pudo eliminar el cupón (bloqueado por RLS).");
    setCoupons((prev) => prev.filter((c) => c.code !== code));
  }, []);

  const redeemCoupon = useCallback(async (code: string, itemCount: number): Promise<RedeemResult> => {
    const { data, error } = await supabase.rpc("redeem_coupon", { p_code: code, p_item_count: itemCount });
    if (error) {
      if (error.message.includes("CUPON_AGOTADO")) throw new Error("Este cupón ya alcanzó su límite de usos.");
      if (error.message.includes("CUPON_INVALIDO")) throw new Error("El cupón no existe o está inactivo.");
      if (error.message.includes("CUPON_NO_APLICA"))
        throw new Error("Este cupón solo es válido para la compra de un solo producto.");
      throw error;
    }
    const row = Array.isArray(data) ? data[0] : data;
    return { discountType: row.discount_type as DiscountType, discountValue: row.discount_value };
  }, []);

  return (
    <CouponsContext.Provider
      value={{ coupons, isLoading, refresh, createCoupon, toggleActive, deleteCoupon, redeemCoupon }}
    >
      {children}
    </CouponsContext.Provider>
  );
}

export function useCoupons() {
  const ctx = useContext(CouponsContext);
  if (!ctx) throw new Error("useCoupons debe usarse dentro de CouponsProvider");
  return ctx;
}
