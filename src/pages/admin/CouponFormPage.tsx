import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useCoupons } from "../../contexts/CouponsContext";
import type { CouponScope, DiscountType } from "../../types";

export default function CouponFormPage() {
  const navigate = useNavigate();
  const { createCoupon } = useCoupons();

  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<DiscountType>("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [scope, setScope] = useState<CouponScope>("cart");
  const [usageLimit, setUsageLimit] = useState("1");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!code.trim() || !discountValue.trim()) {
      setError("Completa el código y el valor del descuento.");
      return;
    }

    setIsSaving(true);
    try {
      await createCoupon({
        code: code.trim(),
        discountType,
        discountValue: Number(discountValue),
        scope,
        usageLimit: Number(usageLimit) || 1,
      });
      navigate("/admin/cupones");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear el cupón.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>Nuevo cupón</h1>
      </div>

      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="admin-form-section">
          <h2>Código</h2>
          <input
            placeholder="Ej. VERANO10"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            required
          />
        </div>

        <div className="admin-form-section">
          <h2>Descuento</h2>
          <select value={discountType} onChange={(e) => setDiscountType(e.target.value as DiscountType)}>
            <option value="percentage">Porcentaje (%)</option>
            <option value="fixed">Monto fijo ($)</option>
          </select>
          <input
            placeholder={discountType === "percentage" ? "Ej. 10" : "Ej. 100"}
            type="number"
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            required
          />
        </div>

        <div className="admin-form-section">
          <h2>Alcance</h2>
          <select value={scope} onChange={(e) => setScope(e.target.value as CouponScope)}>
            <option value="cart">Carrito completo (aplica sin importar cuántos productos compre)</option>
            <option value="single_product">Un solo producto (solo aplica si compra un único artículo)</option>
          </select>
        </div>

        <div className="admin-form-section">
          <h2>Límite de usos</h2>
          <input type="number" min="1" value={usageLimit} onChange={(e) => setUsageLimit(e.target.value)} />
        </div>

        {error && <p className="admin-form-error">{error}</p>}

        <button type="submit" className="btn btn-primary btn-block" disabled={isSaving}>
          {isSaving ? "Guardando..." : "Crear cupón"}
        </button>
      </form>
    </div>
  );
}
