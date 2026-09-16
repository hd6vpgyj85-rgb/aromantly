/**
 * Normaliza texto para búsquedas: quita acentos, pasa a minúsculas
 * y elimina espacios/guiones. Usa NFD + \p{Diacritic} (Unicode property
 * escape) en vez de un rango numérico literal para evitar que un editor
 * corrompa esos puntos de código al guardar el archivo.
 */
export function normalizeSearch(value: string): string {
  const withoutAccents = value.normalize("NFD").replace(/\p{Diacritic}/gu, "");
  return withoutAccents.toLowerCase().replace(/[\s\-_()+]/g, "");
}

/**
 * Normaliza un número telefónico para comparación: se queda solo
 * con los dígitos y toma los últimos 10 (formato México sin lada país).
 */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.slice(-10);
}

export function phonesMatch(a: string, b: string): boolean {
  return normalizePhone(a) === normalizePhone(b);
}

export function slugify(value: string): string {
  const withoutAccents = value.normalize("NFD").replace(/\p{Diacritic}/gu, "");
  return withoutAccents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
