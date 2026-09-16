const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;

/**
 * Redimensiona y comprime una imagen en el navegador antes de subirla
 * a Supabase Storage. Devuelve un nuevo File en formato JPEG.
 */
export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, width, height);

  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
  );

  if (!blob) return file;

  const newName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
  return new File([blob], newName, { type: "image/jpeg" });
}

export async function compressImages(files: File[]): Promise<File[]> {
  return Promise.all(files.map((f) => compressImage(f)));
}
