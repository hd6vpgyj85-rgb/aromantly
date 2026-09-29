import type { Product } from "../types";
import { LEVEL_LABELS, CATEGORY_LABELS } from "../data/store";
import { slugify } from "./normalize";

/**
 * Genera un id (slug) único para un producto nuevo a partir de su
 * nombre, agregando -2, -3... si ya existe ese slug entre los productos
 * dados.
 */
export function generateProductId(name: string, existingProducts: Product[]): string {
  const base = slugify(name) || "producto";
  const existingIds = new Set(existingProducts.map((p) => p.id));

  if (!existingIds.has(base)) return base;

  let suffix = 2;
  while (existingIds.has(`${base}-${suffix}`)) {
    suffix += 1;
  }
  return `${base}-${suffix}`;
}

export function formatPrice(value: number): string {
  return value.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

/**
 * Descripción generada automáticamente cuando el producto no tiene
 * una descripción manual capturada en el admin.
 */
export function buildAutoDescription(product: Product): string {
  const categoryLabel = CATEGORY_LABELS[product.category] ?? product.category;
  const levelsLabel = (product.levels ?? []).map((l) => LEVEL_LABELS[l] ?? l).join(" y ");

  const parts = [
    `${product.name} de ${product.brand}, un${categoryLabel.toLowerCase().startsWith("e") ? "" : "a"} ${categoryLabel.toLowerCase()} pensad${
      categoryLabel.toLowerCase().startsWith("e") ? "o" : "a"
    } para quienes buscan una fragancia con identidad propia.`,
  ];

  if (levelsLabel) {
    parts.push(`Pertenece a nuestra selección de perfumes de nivel ${levelsLabel}.`);
  }

  parts.push(
    "Ideal para uso diario o para ocasiones especiales, con una proyección y duración pensadas para durar todo el día."
  );

  return parts.join(" ");
}

export function getDisplayDescription(product: Product): string {
  return product.description?.trim() ? product.description : buildAutoDescription(product);
}

/**
 * Detecta la marca de un producto a partir de la primera palabra de su
 * nombre (ej. "Armaf Club de Nuit" → "Armaf"). Se usa para armar los
 * chips de filtro por marca, en vez del campo "brand" capturado a mano
 * en el admin, que puede tener errores de dedo o mayúsculas
 * inconsistentes ("ARMARF", "armaf", etc.).
 */
export function extractBrandFromName(name: string): string {
  const firstWord = name.trim().split(/\s+/)[0] ?? "";
  if (!firstWord) return "";
  return firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
}
