import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import QRCode from "qrcode";
import { useCustomers } from "../../contexts/CustomersContext";
import { useLoyalty } from "../../contexts/LoyaltyContext";
import type { Customer } from "../../types";
import "./CustomersPage.css";

export default function CustomersPage() {
  const { customers, searchCustomers, createCustomer, updateCustomer, deleteCustomer, incrementPurchases, decrementPurchases } =
    useCustomers();
  const { tiers, claims, createTier, updateTier, deleteTier, confirmClaim, revertClaim } = useLoyalty();

  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [qrCustomer, setQrCustomer] = useState<Customer | null>(null);
  const [rewardsCustomer, setRewardsCustomer] = useState<Customer | null>(null);
  const [showTiers, setShowTiers] = useState(false);

  const list = query.trim() ? searchCustomers(query) : customers;

  const hasPendingClaim = (customerId: string) => claims.some((c) => c.customerId === customerId && !c.claimed);

  const openCreate = () => {
    setEditingCustomer(null);
    setShowForm(true);
  };

  const openEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowForm(true);
  };

  const handleDelete = async (customer: Customer) => {
    if (!confirm(`¿Eliminar a ${customer.name}?`)) return;
    try {
      await deleteCustomer(customer.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "No se pudo eliminar.");
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>Clientes</h1>
        <button type="button" className="btn btn-primary admin-btn-sm" onClick={openCreate}>
          + Nuevo
        </button>
      </div>

      <input
        className="admin-search"
        placeholder="Buscar por nombre o WhatsApp..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {list.length === 0 ? (
        <p className="admin-empty">No hay clientes que coincidan.</p>
      ) : (
        <div className="admin-list">
          {list.map((customer) => (
            <div
              key={customer.id}
              className={`admin-row-card customer-row ${hasPendingClaim(customer.id) ? "customer-row-pending" : ""}`}
            >
              <div className="admin-row-card-info">
                <div className="admin-row-card-title">
                  {customer.name}
                  {hasPendingClaim(customer.id) && (
                    <span className="admin-badge admin-badge-orange" style={{ marginLeft: 8 }}>
                      Reclamo pendiente
                    </span>
                  )}
                </div>
                <div className="admin-row-card-subtitle">{customer.phone}</div>
                {customer.notes && <div className="admin-row-card-subtitle">{customer.notes}</div>}

                <div className="customer-purchases">
                  <button type="button" className="admin-btn-icon" onClick={() => decrementPurchases(customer.id)}>
                    −
                  </button>
                  <span>{customer.purchasesCount} compras</span>
                  <button type="button" className="admin-btn-icon" onClick={() => incrementPurchases(customer.id)}>
                    +
                  </button>
                </div>

                <div className="customer-actions">
                  <button type="button" className="btn btn-secondary admin-btn-sm" onClick={() => setQrCustomer(customer)}>
                    Ver QR
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary admin-btn-sm"
                    onClick={() => setRewardsCustomer(customer)}
                  >
                    Recompensas
                  </button>
                  <button type="button" className="btn btn-secondary admin-btn-sm" onClick={() => openEdit(customer)}>
                    Editar
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary admin-btn-sm admin-btn-danger"
                    onClick={() => handleDelete(customer)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <button type="button" className="admin-section-toggle" onClick={() => setShowTiers((v) => !v)}>
        <span>Niveles del programa de fidelidad</span>
        <span>{showTiers ? "▲" : "▼"}</span>
      </button>

      {showTiers && (
        <LoyaltyTiersEditor
          tiers={tiers}
          onCreate={createTier}
          onUpdate={updateTier}
          onDelete={deleteTier}
        />
      )}

      {showForm && (
        <CustomerFormModal
          customer={editingCustomer}
          onClose={() => setShowForm(false)}
          onCreate={async (input) => {
            const created = await createCustomer(input);
            setShowForm(false);
            setQrCustomer(created);
          }}
          onUpdate={async (id, input) => {
            await updateCustomer(id, input);
            setShowForm(false);
          }}
        />
      )}

      {qrCustomer && <CustomerQrModal customer={qrCustomer} onClose={() => setQrCustomer(null)} />}

      {rewardsCustomer && (
        <CustomerRewardsModal
          customer={rewardsCustomer}
          tiers={tiers}
          claims={claims.filter((c) => c.customerId === rewardsCustomer.id)}
          onClose={() => setRewardsCustomer(null)}
          onConfirm={confirmClaim}
          onRevert={revertClaim}
        />
      )}
    </div>
  );
}

interface CustomerFormModalProps {
  customer: Customer | null;
  onClose: () => void;
  onCreate: (input: { name: string; phone: string; notes?: string }) => Promise<void>;
  onUpdate: (id: string, input: { name: string; phone: string; notes?: string }) => Promise<void>;
}

function CustomerFormModal({ customer, onClose, onCreate, onUpdate }: CustomerFormModalProps) {
  const [name, setName] = useState(customer?.name ?? "");
  const [phone, setPhone] = useState(customer?.phone ?? "");
  const [notes, setNotes] = useState(customer?.notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError("Nombre y WhatsApp son obligatorios.");
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const input = { name: name.trim(), phone: phone.trim(), notes: notes.trim() || undefined };
      if (customer) await onUpdate(customer.id, input);
      else await onCreate(input);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar.");
    } finally {
      setIsSaving(false);
    }
  };

  return createPortal(
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h2>{customer ? "Editar cliente" : "Nuevo cliente"}</h2>
          <button type="button" className="admin-modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <form className="admin-form" onSubmit={handleSubmit}>
          <input placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} required />
          <input placeholder="WhatsApp" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          <textarea placeholder="Notas (opcional)" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
          {error && <p className="admin-form-error">{error}</p>}
          <button type="submit" className="btn btn-primary btn-block" disabled={isSaving}>
            {isSaving ? "Guardando..." : "Guardar"}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}

function CustomerQrModal({ customer, onClose }: { customer: Customer; onClose: () => void }) {
  const fidelidadUrl = `${window.location.origin}/fidelidad/${customer.token}`;
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    QRCode.toDataURL(fidelidadUrl, { width: 320, margin: 1, color: { dark: "#0a0a0a", light: "#f5f5f3" } }).then(
      setQrDataUrl
    );
  }, [fidelidadUrl]);

  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fidelidadUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard no disponible
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(customer.accessCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // clipboard no disponible
    }
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `qr-${customer.name.replace(/\s+/g, "-").toLowerCase()}.png`;
    a.click();
  };

  return createPortal(
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h2>Tarjeta de {customer.name}</h2>
          <button type="button" className="admin-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="customer-qr-info">
          <span>
            <strong>WhatsApp:</strong> {customer.phone}
          </span>
          <span>
            <strong>Código de acceso:</strong> {customer.accessCode}
          </span>
          {customer.notes && (
            <span>
              <strong>Notas:</strong> {customer.notes}
            </span>
          )}
        </div>

        {qrDataUrl && <img src={qrDataUrl} alt="Código QR" style={{ width: "100%", borderRadius: 12 }} />}
        <div className="admin-inline-actions">
          <button type="button" className="btn btn-secondary" onClick={handleCopyCode}>
            {copiedCode ? "¡Copiado!" : "Copiar código"}
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleCopy}>
            {copied ? "¡Copiado!" : "Copiar link"}
          </button>
          <button type="button" className="btn btn-primary" onClick={handleDownload}>
            Descargar PNG
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

interface CustomerRewardsModalProps {
  customer: Customer;
  tiers: import("../../types").LoyaltyTier[];
  claims: import("../../contexts/LoyaltyContext").AdminClaim[];
  onClose: () => void;
  onConfirm: (claimId: string) => Promise<void>;
  onRevert: (claimId: string) => Promise<void>;
}

function CustomerRewardsModal({ customer, tiers, claims, onClose, onConfirm, onRevert }: CustomerRewardsModalProps) {
  const [busyClaimId, setBusyClaimId] = useState<string | null>(null);
  const sortedTiers = [...tiers].sort((a, b) => a.purchasesRequired - b.purchasesRequired);

  const runAction = async (claimId: string, action: (id: string) => Promise<void>) => {
    setBusyClaimId(claimId);
    try {
      await action(claimId);
    } finally {
      setBusyClaimId(null);
    }
  };

  return createPortal(
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h2>Recompensas de {customer.name}</h2>
          <button type="button" className="admin-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="admin-list">
          {sortedTiers.map((tier) => {
            const unlocked = customer.purchasesCount >= tier.purchasesRequired;
            const claim = claims.find((c) => c.tierId === tier.id);

            return (
              <div key={tier.id} className="admin-row-card" style={{ opacity: unlocked ? 1 : 0.5 }}>
                <div className="admin-row-card-info">
                  <div className="admin-row-card-title">{tier.purchasesRequired} compras</div>
                  <div className="admin-row-card-subtitle">{tier.rewardDescription}</div>
                  {!unlocked && <span className="admin-badge admin-badge-gray">Bloqueado</span>}
                  {unlocked && !claim && <span className="admin-badge admin-badge-gray">Sin reclamar</span>}
                  {unlocked && claim && !claim.claimed && (
                    <span className="admin-badge admin-badge-orange">
                      Pendiente · {new Date(claim.requestedAt).toLocaleDateString("es-MX")}
                    </span>
                  )}
                  {unlocked && claim && claim.claimed && (
                    <span className="admin-badge admin-badge-green">
                      Reclamado{claim.couponCode ? ` · ${claim.couponCode}` : ""} ·{" "}
                      {claim.claimedAt && new Date(claim.claimedAt).toLocaleDateString("es-MX")}
                    </span>
                  )}
                </div>
                {unlocked && claim && !claim.claimed && (
                  <button
                    type="button"
                    className="btn btn-primary admin-btn-sm"
                    disabled={busyClaimId === claim.id}
                    onClick={() => runAction(claim.id, onConfirm)}
                  >
                    Confirmar
                  </button>
                )}
                {unlocked && claim && claim.claimed && (
                  <button
                    type="button"
                    className="btn btn-secondary admin-btn-sm"
                    disabled={busyClaimId === claim.id}
                    onClick={() => runAction(claim.id, onRevert)}
                  >
                    Revertir
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>,
    document.body
  );
}

interface LoyaltyTiersEditorProps {
  tiers: import("../../types").LoyaltyTier[];
  onCreate: (input: {
    purchasesRequired: number;
    rewardDescription: string;
    discountPercent?: number;
    couponScope?: import("../../types").CouponScope;
  }) => Promise<unknown>;
  onUpdate: (
    id: string,
    input: {
      purchasesRequired: number;
      rewardDescription: string;
      discountPercent?: number;
      couponScope?: import("../../types").CouponScope;
    }
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

function LoyaltyTiersEditor({ tiers, onCreate, onUpdate, onDelete }: LoyaltyTiersEditorProps) {
  const [purchasesRequired, setPurchasesRequired] = useState("");
  const [rewardDescription, setRewardDescription] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [couponScope, setCouponScope] = useState<import("../../types").CouponScope>("cart");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setPurchasesRequired("");
    setRewardDescription("");
    setDiscountPercent("");
    setCouponScope("cart");
    setEditingId(null);
  };

  const startEdit = (tier: import("../../types").LoyaltyTier) => {
    setEditingId(tier.id);
    setPurchasesRequired(String(tier.purchasesRequired));
    setRewardDescription(tier.rewardDescription);
    setDiscountPercent(tier.discountPercent ? String(tier.discountPercent) : "");
    setCouponScope(tier.couponScope ?? "cart");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const required = Number(purchasesRequired);
    if (!required || !rewardDescription.trim()) {
      setError("Completa las compras requeridas y la recompensa.");
      return;
    }

    const input = {
      purchasesRequired: required,
      rewardDescription: rewardDescription.trim(),
      discountPercent: discountPercent.trim() ? Number(discountPercent) : undefined,
      couponScope,
    };

    try {
      if (editingId) await onUpdate(editingId, input);
      else await onCreate(input);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el nivel.");
    }
  };

  return (
    <div className="loyalty-tiers-editor">
      <div className="admin-list">
        {[...tiers]
          .sort((a, b) => a.purchasesRequired - b.purchasesRequired)
          .map((tier) => (
            <div key={tier.id} className="admin-row-card">
              <div className="admin-row-card-info">
                <div className="admin-row-card-title">{tier.purchasesRequired} compras</div>
                <div className="admin-row-card-subtitle">
                  {tier.rewardDescription}
                  {tier.discountPercent
                    ? ` · ${tier.discountPercent}% de descuento (${
                        tier.couponScope === "single_product" ? "un solo producto" : "carrito completo"
                      })`
                    : ""}
                </div>
              </div>
              <div className="admin-row-card-actions">
                <button type="button" className="admin-btn-icon" onClick={() => startEdit(tier)}>
                  ✎
                </button>
                <button
                  type="button"
                  className="admin-btn-icon admin-btn-danger"
                  onClick={() => {
                    if (confirm("¿Eliminar este nivel?")) onDelete(tier.id);
                  }}
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
      </div>

      <form className="admin-form" style={{ marginTop: 16 }} onSubmit={handleSubmit}>
        <div className="admin-form-row">
          <input
            placeholder="Compras requeridas"
            type="number"
            value={purchasesRequired}
            onChange={(e) => setPurchasesRequired(e.target.value)}
          />
          <input
            placeholder="% descuento (opcional)"
            type="number"
            value={discountPercent}
            onChange={(e) => setDiscountPercent(e.target.value)}
          />
        </div>
        <input
          placeholder="Descripción de la recompensa"
          value={rewardDescription}
          onChange={(e) => setRewardDescription(e.target.value)}
        />
        {discountPercent.trim() && (
          <select value={couponScope} onChange={(e) => setCouponScope(e.target.value as import("../../types").CouponScope)}>
            <option value="cart">Cupón válido en carrito completo (cualquier cantidad)</option>
            <option value="single_product">Cupón válido solo para un producto</option>
          </select>
        )}
        {error && <p className="admin-form-error">{error}</p>}
        <div className="admin-inline-actions">
          {editingId && (
            <button type="button" className="btn btn-secondary" onClick={resetForm}>
              Cancelar
            </button>
          )}
          <button type="submit" className="btn btn-primary">
            {editingId ? "Actualizar nivel" : "Agregar nivel"}
          </button>
        </div>
      </form>
    </div>
  );
}
