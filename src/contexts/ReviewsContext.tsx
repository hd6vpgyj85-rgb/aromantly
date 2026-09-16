import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "../lib/supabase";
import type { Review, ReviewStatus } from "../types";

interface ReviewRow {
  id: string;
  name: string;
  level: string | null;
  rating: number;
  quote: string;
  image: string | null;
  status: string;
  created_at: string;
}

function rowToReview(row: ReviewRow): Review {
  return {
    id: row.id,
    name: row.name,
    level: row.level ?? undefined,
    rating: row.rating,
    quote: row.quote,
    image: row.image ?? undefined,
    status: row.status as ReviewStatus,
    createdAt: row.created_at,
  };
}

interface CreateReviewInput {
  name: string;
  level?: string;
  rating: number;
  quote: string;
  image?: string;
}

interface ReviewsContextValue {
  reviews: Review[];
  isLoading: boolean;
  refresh: () => Promise<void>;
  approvedReviews: Review[];
  pendingReviews: Review[];
  createReview: (input: CreateReviewInput) => Promise<Review>;
  updateStatus: (id: string, status: ReviewStatus) => Promise<void>;
  deleteReview: (id: string) => Promise<void>;
}

const ReviewsContext = createContext<ReviewsContextValue | undefined>(undefined);

export function ReviewsProvider({ children }: { children: ReactNode }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });
    setReviews(((data ?? []) as ReviewRow[]).map(rowToReview));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createReview = useCallback(async (input: CreateReviewInput) => {
    const { data, error } = await supabase
      .from("reviews")
      .insert({
        name: input.name,
        level: input.level ?? null,
        rating: input.rating,
        quote: input.quote,
        image: input.image ?? null,
        status: "pendiente",
      })
      .select()
      .single();

    if (error) throw error;

    const created = rowToReview(data as ReviewRow);
    setReviews((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateStatus = useCallback(async (id: string, status: ReviewStatus) => {
    const { error } = await supabase.from("reviews").update({ status }).eq("id", id);
    if (error) throw error;
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  }, []);

  const deleteReview = useCallback(async (id: string) => {
    const { error, count } = await supabase.from("reviews").delete({ count: "exact" }).eq("id", id);
    if (error) throw error;
    if (!count) throw new Error("No se pudo eliminar la reseña (bloqueado por RLS).");
    setReviews((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const approvedReviews = reviews.filter((r) => r.status === "aprobada");
  const pendingReviews = reviews.filter((r) => r.status === "pendiente");

  return (
    <ReviewsContext.Provider
      value={{ reviews, isLoading, refresh, approvedReviews, pendingReviews, createReview, updateStatus, deleteReview }}
    >
      {children}
    </ReviewsContext.Provider>
  );
}

export function useReviews() {
  const ctx = useContext(ReviewsContext);
  if (!ctx) throw new Error("useReviews debe usarse dentro de ReviewsProvider");
  return ctx;
}
