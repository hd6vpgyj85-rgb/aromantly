import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "../lib/supabase";
import type { ProductLevel } from "../types";

export type LevelImages = Record<ProductLevel, string | null>;

const EMPTY_IMAGES: LevelImages = { arabe: null, disenador: null, nicho: null };

interface LevelImagesRow {
  arabe_image: string | null;
  disenador_image: string | null;
  nicho_image: string | null;
}

function rowToImages(row: LevelImagesRow | null): LevelImages {
  if (!row) return EMPTY_IMAGES;
  return {
    arabe: row.arabe_image,
    disenador: row.disenador_image,
    nicho: row.nicho_image,
  };
}

interface LevelImagesContextValue {
  images: LevelImages;
  isLoading: boolean;
  refresh: () => Promise<void>;
  saveImages: (images: LevelImages) => Promise<void>;
}

const LevelImagesContext = createContext<LevelImagesContextValue | undefined>(undefined);

export function LevelImagesProvider({ children }: { children: ReactNode }) {
  const [images, setImages] = useState<LevelImages>(EMPTY_IMAGES);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from("level_images")
      .select("arabe_image, disenador_image, nicho_image")
      .eq("id", true)
      .single();
    setImages(rowToImages(data as LevelImagesRow | null));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveImages = useCallback(async (next: LevelImages) => {
    const { error } = await supabase
      .from("level_images")
      .update({
        arabe_image: next.arabe,
        disenador_image: next.disenador,
        nicho_image: next.nicho,
        updated_at: new Date().toISOString(),
      })
      .eq("id", true);
    if (error) throw error;
    setImages(next);
  }, []);

  return (
    <LevelImagesContext.Provider value={{ images, isLoading, refresh, saveImages }}>
      {children}
    </LevelImagesContext.Provider>
  );
}

export function useLevelImages() {
  const ctx = useContext(LevelImagesContext);
  if (!ctx) throw new Error("useLevelImages debe usarse dentro de LevelImagesProvider");
  return ctx;
}
