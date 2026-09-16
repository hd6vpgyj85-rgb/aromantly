import { useEffect, useState } from "react";
import { useHomeBanner } from "../../contexts/HomeBannerContext";
import { supabase, PRODUCT_IMAGES_BUCKET } from "../../lib/supabase";
import { compressImages } from "../../utils/image";

export default function HomeBannerPage() {
  const { images, isLoading, saveImages } = useHomeBanner();
  const [draft, setDraft] = useState<string[]>(images);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDraft(images);
  }, [images]);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setError(null);
    setSaved(false);
    try {
      const compressed = await compressImages(Array.from(files));
      const uploadedUrls: string[] = [];

      for (const file of compressed) {
        const path = `banner/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${file.name}`;
        const { error: uploadError } = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).upload(path, file);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path);
        uploadedUrls.push(data.publicUrl);
      }

      setDraft((prev) => [...prev, ...uploadedUrls]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron subir las imágenes.");
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setDraft((prev) => prev.filter((_, i) => i !== index));
    setSaved(false);
  };

  const moveFirst = (index: number) => {
    setDraft((prev) => {
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.unshift(item);
      return next;
    });
    setSaved(false);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setDraft((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
    setSaved(false);
  };

  const moveDown = (index: number) => {
    setDraft((prev) => {
      if (index === prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
    setSaved(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await saveImages(draft);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron guardar los cambios.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <p className="admin-empty">Cargando…</p>;

  return (
    <div>
      <div className="admin-page-header">
        <h1>Banner de inicio</h1>
      </div>

      <div className="admin-form-section">
        <h2>Imágenes</h2>
        <p className="admin-form-hint">
          Con 1 imagen se muestra fija. Con 2 o más se muestran en carrusel: cambian solas cada 8
          segundos y el cliente también puede deslizar para verlas todas. La primera imagen de la
          lista es la que aparece primero.
        </p>

        <div className="admin-image-grid">
          {draft.map((src, index) => (
            <div key={src} className={`admin-image-item ${index === 0 ? "admin-image-item-cover" : ""}`}>
              <img src={src} alt="" onClick={() => moveFirst(index)} />
              {index === 0 && <span className="admin-image-cover-label">1ra</span>}
              <button type="button" className="admin-image-remove" onClick={() => removeImage(index)}>
                ×
              </button>
              {draft.length > 1 && (
                <div className="admin-image-order-actions">
                  <button type="button" disabled={index === 0} onClick={() => moveUp(index)}>
                    ‹
                  </button>
                  <button type="button" disabled={index === draft.length - 1} onClick={() => moveDown(index)}>
                    ›
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <input type="file" accept="image/*" multiple onChange={(e) => handleUpload(e.target.files)} />
        {isUploading && <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Subiendo…</span>}

        {error && <p className="admin-form-error">{error}</p>}

        <button type="button" className="btn btn-primary btn-block" disabled={isSaving} onClick={handleSave}>
          {isSaving ? "Guardando..." : saved ? "¡Guardado!" : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}
