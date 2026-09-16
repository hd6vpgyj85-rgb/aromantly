import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "../lib/supabase";

interface HomeBannerContextValue {
  images: string[];
  isLoading: boolean;
  refresh: () => Promise<void>;
  saveImages: (images: string[]) => Promise<void>;
}

const HomeBannerContext = createContext<HomeBannerContextValue | undefined>(undefined);

export function HomeBannerProvider({ children }: { children: ReactNode }) {
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const { data } = await supabase.from("home_banner").select("images").eq("id", true).single();
    setImages((data?.images as string[] | null) ?? []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveImages = useCallback(async (next: string[]) => {
    const { error } = await supabase
      .from("home_banner")
      .update({ images: next, updated_at: new Date().toISOString() })
      .eq("id", true);
    if (error) throw error;
    setImages(next);
  }, []);

  return (
    <HomeBannerContext.Provider value={{ images, isLoading, refresh, saveImages }}>
      {children}
    </HomeBannerContext.Provider>
  );
}

export function useHomeBanner() {
  const ctx = useContext(HomeBannerContext);
  if (!ctx) throw new Error("useHomeBanner debe usarse dentro de HomeBannerProvider");
  return ctx;
}
