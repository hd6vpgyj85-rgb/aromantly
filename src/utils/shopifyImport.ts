import type { ProductCategory, ProductLevel } from "../types";
import { normalizeSearch } from "./normalize";

export interface ShopifyCsvRow {
  Handle?: string;
  Title?: string;
  "Body (HTML)"?: string;
  Vendor?: string;
  Type?: string;
  "Product Category"?: string;
  Tags?: string;
  "Variant SKU"?: string;
  "Variant Price"?: string;
  "Variant Compare At Price"?: string;
  "Variant Inventory Qty"?: string;
  "Option1 Name"?: string;
  "Option1 Value"?: string;
  "Image Src"?: string;
  [key: string]: string | undefined;
}

export interface ImportedProductDraft {
  handle: string;
  name: string;
  description?: string;
  brand: string;
  category: ProductCategory;
  levels: ProductLevel[];
  price: number;
  compareAtPrice?: number;
  onSale: boolean;
  stock: number;
  sizes: string[];
  imageUrls: string[];
  isPossibleDuplicate: boolean;
}

function stripHtml(html?: string): string | undefined {
  if (!html) return undefined;
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return text || undefined;
}

function inferCategory(row: ShopifyCsvRow): ProductCategory {
  const haystack = normalizeSearch(`${row.Type ?? ""} ${row["Product Category"] ?? ""} ${row.Title ?? ""}`);
  if (haystack.includes("toilette")) return "eau de toilette";
  if (haystack.includes("cologne")) return "eau de cologne";
  if (haystack.includes("fraiche") || haystack.includes("fresh")) return "eau fraiche";
  if (haystack.includes("parfum")) return "eau de parfum";
  return "perfume";
}

function inferLevels(row: ShopifyCsvRow): ProductLevel[] {
  const tags = normalizeSearch(row.Tags ?? "");
  const levels: ProductLevel[] = [];
  if (tags.includes("arabe")) levels.push("arabe");
  if (tags.includes("disenador") || tags.includes("designer")) levels.push("disenador");
  if (tags.includes("nicho") || tags.includes("niche")) levels.push("nicho");
  return levels;
}

export function groupShopifyRows(rows: ShopifyCsvRow[]): ImportedProductDraft[] {
  const groups = new Map<string, ShopifyCsvRow[]>();

  for (const row of rows) {
    const handle = row.Handle?.trim();
    if (!handle) continue;
    if (!groups.has(handle)) groups.set(handle, []);
    groups.get(handle)!.push(row);
  }

  const drafts: ImportedProductDraft[] = [];

  for (const [handle, groupRows] of groups) {
    const titleRow = groupRows.find((r) => r.Title?.trim()) ?? groupRows[0];
    const name = titleRow.Title?.trim() ?? handle;
    const brand = titleRow.Vendor?.trim() ?? "Sin marca";
    const category = inferCategory(titleRow);
    const levels = inferLevels(titleRow);
    const description = stripHtml(titleRow["Body (HTML)"]);

    const prices = groupRows
      .map((r) => Number(r["Variant Price"]))
      .filter((n) => !Number.isNaN(n) && n > 0);
    const price = prices.length > 0 ? Math.min(...prices) : 0;

    const compareAtPrices = groupRows
      .map((r) => Number(r["Variant Compare At Price"]))
      .filter((n) => !Number.isNaN(n) && n > 0);
    const compareAtPrice = compareAtPrices.length > 0 ? Math.max(...compareAtPrices) : undefined;
    const onSale = !!compareAtPrice && compareAtPrice > price;

    const stock = groupRows.reduce((sum, r) => {
      const qty = Number(r["Variant Inventory Qty"]);
      return sum + (Number.isNaN(qty) ? 0 : qty);
    }, 0);

    const sizes = Array.from(
      new Set(
        groupRows
          .filter((r) => (r["Option1 Name"] ?? "").trim().toLowerCase() !== "title")
          .map((r) => r["Option1 Value"]?.trim())
          .filter((v): v is string => !!v)
      )
    );

    const imageUrls = Array.from(
      new Set(groupRows.map((r) => r["Image Src"]?.trim()).filter((v): v is string => !!v))
    );

    drafts.push({
      handle,
      name,
      description,
      brand,
      category,
      levels,
      price,
      compareAtPrice,
      onSale,
      stock,
      sizes,
      imageUrls,
      isPossibleDuplicate: false,
    });
  }

  return drafts;
}

export function markDuplicates(
  drafts: ImportedProductDraft[],
  existingNames: string[]
): ImportedProductDraft[] {
  const normalizedExisting = new Set(existingNames.map((n) => normalizeSearch(n)));
  return drafts.map((draft) => ({
    ...draft,
    isPossibleDuplicate: normalizedExisting.has(normalizeSearch(draft.name)),
  }));
}
