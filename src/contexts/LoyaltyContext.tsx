import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "../lib/supabase";
import type { CouponScope, LoyaltyClaim, LoyaltyTier } from "../types";

interface TierRow {
  id: string;
  purchases_required: number;
  reward_description: string;
  discount_percent: number | null;
  coupon_scope: string | null;
  created_at: string;
}

function rowToTier(row: TierRow): LoyaltyTier {
  return {
    id: row.id,
    purchasesRequired: row.purchases_required,
    rewardDescription: row.reward_description,
    discountPercent: row.discount_percent ?? undefined,
    couponScope: (row.coupon_scope as CouponScope) ?? "cart",
    createdAt: row.created_at,
  };
}

interface ClaimRow {
  id: string;
  customer_id: string;
  tier_id: string;
  requested_at: string;
  claimed: boolean;
  claimed_at: string | null;
  coupon_id: string | null;
}

export interface AdminClaim {
  id: string;
  customerId: string;
  tierId: string;
  requestedAt: string;
  claimed: boolean;
  claimedAt?: string | null;
  couponCode?: string | null;
}

function rowToAdminClaim(row: ClaimRow): AdminClaim {
  return {
    id: row.id,
    customerId: row.customer_id,
    tierId: row.tier_id,
    requestedAt: row.requested_at,
    claimed: row.claimed,
    claimedAt: row.claimed_at,
    couponCode: row.coupon_id,
  };
}

interface CreateTierInput {
  purchasesRequired: number;
  rewardDescription: string;
  discountPercent?: number;
  couponScope?: CouponScope;
}

interface CustomerToken {
  id: string;
  token: string;
}

interface CustomerByToken {
  id: string;
  name: string;
  purchasesCount: number;
}

interface LoyaltyContextValue {
  tiers: LoyaltyTier[];
  isLoading: boolean;
  refreshTiers: () => Promise<void>;
  createTier: (input: CreateTierInput) => Promise<LoyaltyTier>;
  updateTier: (id: string, updates: CreateTierInput) => Promise<void>;
  deleteTier: (id: string) => Promise<void>;

  claims: AdminClaim[];
  refreshClaims: () => Promise<void>;
  getClaimsForCustomer: (customerId: string) => AdminClaim[];
  confirmClaim: (claimId: string) => Promise<void>;
  revertClaim: (claimId: string) => Promise<void>;

  getOrCreateCustomerForCheckout: (name: string, phone: string) => Promise<CustomerToken>;
  getCustomerByToken: (token: string) => Promise<CustomerByToken | null>;
  requestClaim: (token: string, tierId: string) => Promise<void>;
  getClaimsByToken: (token: string) => Promise<LoyaltyClaim[]>;
}

const LoyaltyContext = createContext<LoyaltyContextValue | undefined>(undefined);

export function LoyaltyProvider({ children }: { children: ReactNode }) {
  const [tiers, setTiers] = useState<LoyaltyTier[]>([]);
  const [claims, setClaims] = useState<AdminClaim[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshTiers = useCallback(async () => {
    const { data } = await supabase
      .from("loyalty_tiers")
      .select("*")
      .order("purchases_required", { ascending: true });
    setTiers(((data ?? []) as TierRow[]).map(rowToTier));
  }, []);

  const refreshClaims = useCallback(async () => {
    const { data } = await supabase.from("loyalty_claims").select("*");
    setClaims(((data ?? []) as ClaimRow[]).map(rowToAdminClaim));
  }, []);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([refreshTiers(), refreshClaims()]).finally(() => setIsLoading(false));
  }, [refreshTiers, refreshClaims]);

  const createTier = useCallback(async (input: CreateTierInput) => {
    const { data, error } = await supabase
      .from("loyalty_tiers")
      .insert({
        purchases_required: input.purchasesRequired,
        reward_description: input.rewardDescription,
        discount_percent: input.discountPercent ?? null,
        coupon_scope: input.couponScope ?? "cart",
      })
      .select()
      .single();

    if (error) throw error;
    const created = rowToTier(data as TierRow);
    setTiers((prev) => [...prev, created].sort((a, b) => a.purchasesRequired - b.purchasesRequired));
    return created;
  }, []);

  const updateTier = useCallback(async (id: string, updates: CreateTierInput) => {
    const { error } = await supabase
      .from("loyalty_tiers")
      .update({
        purchases_required: updates.purchasesRequired,
        reward_description: updates.rewardDescription,
        discount_percent: updates.discountPercent ?? null,
        coupon_scope: updates.couponScope ?? "cart",
      })
      .eq("id", id);

    if (error) throw error;
    setTiers((prev) =>
      prev
        .map((t) =>
          t.id === id
            ? {
                ...t,
                purchasesRequired: updates.purchasesRequired,
                rewardDescription: updates.rewardDescription,
                discountPercent: updates.discountPercent,
                couponScope: updates.couponScope ?? "cart",
              }
            : t
        )
        .sort((a, b) => a.purchasesRequired - b.purchasesRequired)
    );
  }, []);

  const deleteTier = useCallback(async (id: string) => {
    const { error, count } = await supabase.from("loyalty_tiers").delete({ count: "exact" }).eq("id", id);
    if (error) throw error;
    if (!count) throw new Error("No se pudo eliminar el nivel (bloqueado por RLS).");
    setTiers((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const getClaimsForCustomer = useCallback(
    (customerId: string) => claims.filter((c) => c.customerId === customerId),
    [claims]
  );

  const confirmClaim = useCallback(async (claimId: string) => {
    const { error } = await supabase.rpc("confirm_loyalty_claim", { p_claim_id: claimId });
    if (error) throw error;
    await refreshClaims();
  }, [refreshClaims]);

  const revertClaim = useCallback(async (claimId: string) => {
    const { error } = await supabase.rpc("revert_loyalty_claim", { p_claim_id: claimId });
    if (error) throw error;
    await refreshClaims();
  }, [refreshClaims]);

  const getOrCreateCustomerForCheckout = useCallback(async (name: string, phone: string) => {
    const { data, error } = await supabase.rpc("get_or_create_customer_for_checkout", {
      p_name: name,
      p_phone: phone,
    });
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    return { id: row.id, token: row.token };
  }, []);

  const getCustomerByToken = useCallback(async (token: string) => {
    const { data, error } = await supabase.rpc("get_customer_by_token", { p_token: token });
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) return null;
    return { id: row.id, name: row.name, purchasesCount: row.purchases_count } as CustomerByToken;
  }, []);

  const requestClaim = useCallback(async (token: string, tierId: string) => {
    const { error } = await supabase.rpc("request_loyalty_claim", { p_token: token, p_tier_id: tierId });
    if (error) throw error;
  }, []);

  const getClaimsByToken = useCallback(async (token: string): Promise<LoyaltyClaim[]> => {
    const { data, error } = await supabase.rpc("get_loyalty_claims_by_token", { p_token: token });
    if (error) throw error;
    return ((data ?? []) as { tier_id: string; requested_at: string; claimed: boolean; claimed_at: string | null; coupon_code: string | null }[]).map(
      (row) => ({
        tierId: row.tier_id,
        requestedAt: row.requested_at,
        claimed: row.claimed,
        claimedAt: row.claimed_at,
        couponCode: row.coupon_code,
      })
    );
  }, []);

  return (
    <LoyaltyContext.Provider
      value={{
        tiers,
        isLoading,
        refreshTiers,
        createTier,
        updateTier,
        deleteTier,
        claims,
        refreshClaims,
        getClaimsForCustomer,
        confirmClaim,
        revertClaim,
        getOrCreateCustomerForCheckout,
        getCustomerByToken,
        requestClaim,
        getClaimsByToken,
      }}
    >
      {children}
    </LoyaltyContext.Provider>
  );
}

export function useLoyalty() {
  const ctx = useContext(LoyaltyContext);
  if (!ctx) throw new Error("useLoyalty debe usarse dentro de LoyaltyProvider");
  return ctx;
}
