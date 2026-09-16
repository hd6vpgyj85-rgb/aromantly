export type ProductCategory =
  | "perfume"
  | "eau de parfum"
  | "eau de toilette"
  | "eau de cologne"
  | "eau fraiche";

export type ProductLevel = "arabe" | "disenador" | "nicho";

export type HomeImageFit = "cover" | "contain";

export interface Product {
  id: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  onSale?: boolean;
  levels?: ProductLevel[];
  category: ProductCategory;
  brand: string;
  stock: number;
  vendor?: string;
  sizes?: string[];
  description?: string;
  images?: string[];
  homeImageFit?: HomeImageFit;
  createdAt?: string;
}

export interface ProductStats {
  productId: string;
  views: number;
  cartAdds: number;
  purchases: number;
}

export type OrderStatus = "pendiente" | "en proceso" | "completado" | "cancelado";

export interface OrderCustomer {
  nombre: string;
  apellido: string;
  telefono: string;
  correo: string;
}

export interface OrderAddress {
  calle: string;
  colonia: string;
  ciudad: string;
  estado: string;
  codigoPostal: string;
  pais: string;
  referencias?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  level?: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  createdAt: string;
  status: OrderStatus;
  customer: OrderCustomer;
  address: OrderAddress;
  paymentMethod: string;
  notes?: string;
  items: OrderItem[];
  total: number;
  archivedAt?: string | null;
}

export type ReviewStatus = "pendiente" | "aprobada" | "rechazada";

export interface Review {
  id: string;
  name: string;
  level?: string;
  rating: number;
  quote: string;
  image?: string;
  status: ReviewStatus;
  createdAt: string;
}

export type DiscountType = "percentage" | "fixed";

export interface Coupon {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  usageLimit: number;
  timesUsed: number;
  active: boolean;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  token: string;
  purchasesCount: number;
  notes?: string;
  createdAt: string;
}

export interface LoyaltyTier {
  id: string;
  purchasesRequired: number;
  rewardDescription: string;
  discountPercent?: number;
  createdAt: string;
}

export interface LoyaltyClaim {
  tierId: string;
  requestedAt: string;
  claimed: boolean;
  claimedAt?: string | null;
  couponCode?: string | null;
}

export interface CartLine {
  product: Product;
  quantity: number;
}

export type ActiveFilter =
  | { type: "nivel"; value: ProductLevel }
  | { type: "marca"; value: string }
  | null;
