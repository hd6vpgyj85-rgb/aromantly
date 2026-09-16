export const LEVEL_LABELS: Record<string, string> = {
  arabe: "Árabe",
  disenador: "Diseñador",
  nicho: "Nicho",
};

export const LEVEL_OPTIONS: { slug: "arabe" | "disenador" | "nicho"; label: string; number: string }[] = [
  { slug: "arabe", label: "Árabe", number: "01" },
  { slug: "disenador", label: "Diseñador", number: "02" },
  { slug: "nicho", label: "Nicho", number: "03" },
];

export function formatLevels(levels?: string[] | null): string {
  if (!levels || levels.length === 0) return "";
  return levels.map((l) => LEVEL_LABELS[l] ?? l).join(" / ");
}

export const CATEGORY_LABELS: Record<string, string> = {
  perfume: "Perfumes",
  "eau de parfum": "Eau de Parfum",
  "eau de toilette": "Eau de Toilette",
  "eau de cologne": "Eau de Cologne",
  "eau fraiche": "Eau Fraiche",
};

export const CATEGORY_TAGLINES: Record<string, string> = {
  perfume: "Fragancias que se quedan contigo todo el día.",
  "eau de parfum": "Concentración alta, presencia que dura.",
  "eau de toilette": "Frescura ligera para el día a día.",
  "eau de cologne": "El toque cítrico y fresco de siempre.",
  "eau fraiche": "La versión más suave y fresca de tu fragancia favorita.",
};

export const storeInfo = {
  name: "Aromantly",
  tagline: "Perfumería en Cd. Juárez",
  whatsappNumber: "526561234567",
  address: "Av. Paseo Triunfo de la República, Cd. Juárez, Chih.",
  scheduleLines: ["Lunes a sábado: 10:00 am – 8:00 pm", "Domingo: 11:00 am – 6:00 pm"],
  instagram: "https://instagram.com/aromantly",
  facebook: "https://facebook.com/aromantly",
};

export function getWhatsAppUrl(message: string): string {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${storeInfo.whatsappNumber}?text=${encoded}`;
}
