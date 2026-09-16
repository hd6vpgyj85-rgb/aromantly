import { useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import QRCode from "qrcode";
import { useCart } from "../contexts/CartContext";
import { useOrders } from "../contexts/OrdersContext";
import { useReviews } from "../contexts/ReviewsContext";
import { useCoupons } from "../contexts/CouponsContext";
import { useLoyalty } from "../contexts/LoyaltyContext";
import { getWhatsAppUrl, formatLevels } from "../data/store";
import { formatPrice } from "../utils/product";
import { compressImage } from "../utils/image";
import { supabase, PRODUCT_IMAGES_BUCKET } from "../lib/supabase";
import type { OrderItem } from "../types";
import "./CheckoutPage.css";

interface FormState {
  nombre: string;
  apellido: string;
  telefono: string;
  correo: string;
  calle: string;
  colonia: string;
  ciudad: string;
  estado: string;
  codigoPostal: string;
  pais: string;
  referencias: string;
  paymentMethod: string;
  notes: string;
  couponCode: string;
}

const INITIAL_FORM: FormState = {
  nombre: "",
  apellido: "",
  telefono: "",
  correo: "",
  calle: "",
  colonia: "",
  ciudad: "Cd. Juárez",
  estado: "Chihuahua",
  codigoPostal: "",
  pais: "México",
  referencias: "",
  paymentMethod: "Efectivo contra entrega",
  notes: "",
  couponCode: "",
};

export default function CheckoutPage() {
  const { lines, subtotal, clearCart } = useCart();
  const { createOrder } = useOrders();
  const { createReview } = useReviews();
  const { redeemCoupon } = useCoupons();
  const { getOrCreateCustomerForCheckout } = useLoyalty();

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [includeReview, setIncludeReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewQuote, setReviewQuote] = useState("");
  const [reviewImageFile, setReviewImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ qrDataUrl: string; fidelidadUrl: string } | null>(null);
  const [copied, setCopied] = useState(false);

  if (lines.length === 0 && !success) {
    return <Navigate to="/carrito" replace />;
  }

  const update = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      let discount = 0;
      let appliedCoupon: { code: string; discountType: string; discountValue: number } | null = null;

      if (form.couponCode.trim()) {
        const result = await redeemCoupon(form.couponCode.trim());
        discount =
          result.discountType === "percentage"
            ? (subtotal * result.discountValue) / 100
            : result.discountValue;
        discount = Math.min(discount, subtotal);
        appliedCoupon = { code: form.couponCode.trim().toUpperCase(), ...result };
      }

      const total = Math.max(0, subtotal - discount);

      const items: OrderItem[] = lines.map((line) => ({
        productId: line.product.id,
        name: line.product.name,
        level: formatLevels(line.product.levels) || undefined,
        quantity: line.quantity,
        price: line.product.price,
      }));

      await createOrder({
        customer: {
          nombre: form.nombre,
          apellido: form.apellido,
          telefono: form.telefono,
          correo: form.correo,
        },
        address: {
          calle: form.calle,
          colonia: form.colonia,
          ciudad: form.ciudad,
          estado: form.estado,
          codigoPostal: form.codigoPostal,
          pais: form.pais,
          referencias: form.referencias || undefined,
        },
        paymentMethod: form.paymentMethod,
        notes: form.notes || undefined,
        items,
        total,
      });

      if (includeReview && reviewQuote.trim()) {
        let imageUrl: string | undefined;
        if (reviewImageFile) {
          const compressed = await compressImage(reviewImageFile);
          const path = `reviews/${Date.now()}-${compressed.name}`;
          const { error: uploadError } = await supabase.storage
            .from(PRODUCT_IMAGES_BUCKET)
            .upload(path, compressed);
          if (!uploadError) {
            const { data } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path);
            imageUrl = data.publicUrl;
          }
        }

        await createReview({
          name: `${form.nombre} ${form.apellido}`.trim(),
          rating: reviewRating,
          quote: reviewQuote.trim(),
          image: imageUrl,
        });
      }

      const { token } = await getOrCreateCustomerForCheckout(
        `${form.nombre} ${form.apellido}`.trim(),
        form.telefono
      );

      const fidelidadUrl = `${window.location.origin}/fidelidad/${token}`;
      const qrDataUrl = await QRCode.toDataURL(fidelidadUrl, {
        width: 320,
        margin: 1,
        color: { dark: "#0a0a0a", light: "#f5f5f3" },
      });

      const productLines = items
        .map(
          (item) =>
            `- ${item.name}${item.level ? ` (${item.level})` : ""} x${item.quantity} - ${formatPrice(
              item.price * item.quantity
            )}`
        )
        .join("\n");

      const messageParts = [
        `🧴 *Nuevo pedido - Aromantly*`,
        "",
        "*Productos:*",
        productLines,
        "",
        `*Subtotal:* ${formatPrice(subtotal)}`,
      ];

      if (appliedCoupon) {
        messageParts.push(`*Cupón:* ${appliedCoupon.code} (-${formatPrice(discount)})`);
      }

      messageParts.push(
        `*Total:* ${formatPrice(total)}`,
        "",
        `*Cliente:* ${form.nombre} ${form.apellido}`,
        `*Teléfono:* ${form.telefono}`,
        `*Correo:* ${form.correo || "-"}`,
        "",
        "*Dirección:*",
        `${form.calle}, ${form.colonia}, ${form.ciudad}, ${form.estado}, CP ${form.codigoPostal}, ${form.pais}`
      );

      if (form.referencias) messageParts.push(`Referencias: ${form.referencias}`);

      messageParts.push("", `*Método de pago:* ${form.paymentMethod}`);

      if (form.notes) messageParts.push(`*Notas:* ${form.notes}`);

      if (includeReview && reviewQuote.trim()) {
        messageParts.push("", "*Reseña:*", `${"⭐".repeat(reviewRating)} "${reviewQuote.trim()}"`);
      }

      window.open(getWhatsAppUrl(messageParts.join("\n")), "_blank", "noopener,noreferrer");

      clearCart();
      setSuccess({ qrDataUrl, fidelidadUrl });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error al procesar tu pedido.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(success.fidelidadUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // clipboard no disponible
      }
    };

    return (
      <div className="container checkout-success">
        <h1>¡Pedido enviado!</h1>
        <p>Abrimos WhatsApp con los detalles de tu pedido. Confirma ahí para coordinar tu entrega y pago.</p>

        <div className="loyalty-qr-card">
          <span className="loyalty-qr-label">Tu tarjeta de fidelidad</span>
          <img src={success.qrDataUrl} alt="Código QR de tu tarjeta de fidelidad" className="loyalty-qr-image" />
          <div className="loyalty-qr-actions">
            <button type="button" className="btn btn-secondary" onClick={handleCopy}>
              {copied ? "¡Copiado!" : "Copiar link"}
            </button>
            <Link to={success.fidelidadUrl.replace(window.location.origin, "")} className="btn btn-primary">
              Ver mi tarjeta
            </Link>
          </div>
        </div>

        <Link to="/" className="checkout-success-home">
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="container checkout-page">
      <h1>Checkout</h1>

      <form className="checkout-form" onSubmit={handleSubmit}>
        <section className="checkout-section">
          <h2>Datos personales</h2>
          <div className="checkout-row">
            <input required placeholder="Nombre" value={form.nombre} onChange={update("nombre")} />
            <input required placeholder="Apellido" value={form.apellido} onChange={update("apellido")} />
          </div>
          <div className="checkout-row">
            <input
              required
              type="tel"
              placeholder="Teléfono (WhatsApp)"
              value={form.telefono}
              onChange={update("telefono")}
            />
            <input type="email" placeholder="Correo (opcional)" value={form.correo} onChange={update("correo")} />
          </div>
        </section>

        <section className="checkout-section">
          <h2>Dirección de entrega</h2>
          <input required placeholder="Calle y número" value={form.calle} onChange={update("calle")} />
          <div className="checkout-row">
            <input required placeholder="Colonia" value={form.colonia} onChange={update("colonia")} />
            <input required placeholder="Código postal" value={form.codigoPostal} onChange={update("codigoPostal")} />
          </div>
          <div className="checkout-row">
            <input required placeholder="Ciudad" value={form.ciudad} onChange={update("ciudad")} />
            <input required placeholder="Estado" value={form.estado} onChange={update("estado")} />
          </div>
          <input placeholder="Referencias (opcional)" value={form.referencias} onChange={update("referencias")} />
        </section>

        <section className="checkout-section">
          <h2>Método de pago</h2>
          <select value={form.paymentMethod} onChange={update("paymentMethod")}>
            <option>Efectivo contra entrega</option>
            <option>Transferencia bancaria</option>
            <option>Depósito en tienda</option>
          </select>
        </section>

        <section className="checkout-section">
          <h2>Cupón</h2>
          <input placeholder="Código de cupón (opcional)" value={form.couponCode} onChange={update("couponCode")} />
        </section>

        <section className="checkout-section">
          <h2>Notas</h2>
          <textarea placeholder="Notas para tu pedido (opcional)" value={form.notes} onChange={update("notes")} rows={3} />
        </section>

        <section className="checkout-section">
          <label className="checkout-checkbox">
            <input
              type="checkbox"
              checked={includeReview}
              onChange={(e) => setIncludeReview(e.target.checked)}
            />
            Quiero dejar una reseña de mi experiencia
          </label>

          {includeReview && (
            <div className="checkout-review">
              <div className="checkout-stars">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={n <= reviewRating ? "star-filled" : "star-empty"}
                    onClick={() => setReviewRating(n)}
                  >
                    ★
                  </button>
                ))}
              </div>
              <textarea
                placeholder="Cuéntanos tu experiencia..."
                value={reviewQuote}
                onChange={(e) => setReviewQuote(e.target.value)}
                rows={3}
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setReviewImageFile(e.target.files?.[0] ?? null)}
              />
            </div>
          )}
        </section>

        <div className="checkout-summary">
          <div className="checkout-summary-row">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
        </div>

        {error && <p className="checkout-error">{error}</p>}

        <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting}>
          {isSubmitting ? "Enviando..." : "Enviar pedido por WhatsApp"}
        </button>
      </form>
    </div>
  );
}
