import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { useParams } from "react-router-dom";
import QRCode from "qrcode";
import { useLoyalty } from "../contexts/LoyaltyContext";
import { getWhatsAppUrl } from "../data/store";
import "./FidelidadPage.css";

interface CustomerData {
  id: string;
  name: string;
  purchasesCount: number;
  accessCode: string;
}

interface ClaimData {
  tierId: string;
  claimed: boolean;
  couponCode?: string | null;
  requestedAt: string;
}

export default function FidelidadPage() {
  const { token } = useParams<{ token: string }>();
  const { tiers, isLoading: tiersLoading, getCustomerByToken, getClaimsByToken, requestClaim } = useLoyalty();

  const [customer, setCustomer] = useState<CustomerData | null | undefined>(undefined);
  const [claims, setClaims] = useState<ClaimData[]>([]);
  const [isRequesting, setIsRequesting] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const flipStartRef = useRef<{ x: number; y: number } | null>(null);

  const loadClaims = useCallback(async () => {
    if (!token) return;
    const data = await getClaimsByToken(token);
    setClaims(data.map((c) => ({ tierId: c.tierId, claimed: c.claimed, couponCode: c.couponCode, requestedAt: c.requestedAt })));
  }, [token, getClaimsByToken]);

  useEffect(() => {
    if (!token) return;
    getCustomerByToken(token).then((result) => setCustomer(result));
    loadClaims();
  }, [token, getCustomerByToken, loadClaims]);

  useEffect(() => {
    if (!token) return;
    const fidelidadUrl = `${window.location.origin}/fidelidad/${token}`;
    QRCode.toDataURL(fidelidadUrl, { width: 260, margin: 1, color: { dark: "#0a0a0a", light: "#f5f5f3" } }).then(
      setQrDataUrl
    );
  }, [token]);

  const handleCardPointerDown = (e: ReactPointerEvent) => {
    flipStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleCardPointerUp = (e: ReactPointerEvent) => {
    const start = flipStartRef.current;
    flipStartRef.current = null;
    if (!start) return;

    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    // Toque casi sin movimiento (clic/tap) o deslizamiento horizontal claro
    // voltean la tarjeta; un movimiento sobre todo vertical es scroll de la
    // página, no un intento de voltear.
    const isTap = absDx < 8 && absDy < 8;
    const isHorizontalSwipe = absDx > 30 && absDx > absDy * 1.5;
    if (isTap || isHorizontalSwipe) {
      setIsFlipped((v) => !v);
    }
  };

  if (customer === undefined || tiersLoading) {
    return <div className="container fidelidad-page fidelidad-loading">Cargando tarjeta…</div>;
  }

  if (customer === null) {
    return (
      <div className="container fidelidad-page fidelidad-loading">
        <p>No encontramos esta tarjeta de fidelidad.</p>
      </div>
    );
  }

  const sortedTiers = [...tiers].sort((a, b) => a.purchasesRequired - b.purchasesRequired);
  const currentTierIndex = sortedTiers.reduce(
    (acc, tier, index) => (customer.purchasesCount >= tier.purchasesRequired ? index + 1 : acc),
    0
  );
  const nextTier = sortedTiers.find((t) => t.purchasesRequired > customer.purchasesCount);
  const prevRequired = currentTierIndex > 0 ? sortedTiers[currentTierIndex - 1].purchasesRequired : 0;
  const progressPercent = nextTier
    ? Math.min(
        100,
        ((customer.purchasesCount - prevRequired) / (nextTier.purchasesRequired - prevRequired)) * 100
      )
    : 100;

  const handleClaim = async (tierId: string) => {
    if (!token) return;
    setIsRequesting(tierId);
    try {
      await requestClaim(token, tierId);
      await loadClaims();
      window.open(
        getWhatsAppUrl(
          `🧴 ¡Hola! Soy ${customer.name} y quiero reclamar mi recompensa de fidelidad en Aromantly.`
        ),
        "_blank",
        "noopener,noreferrer"
      );
    } finally {
      setIsRequesting(null);
    }
  };

  return (
    <div className="fidelidad-page">
      <div className="container">
        <div
          className="loyalty-card-scene"
          onPointerDown={handleCardPointerDown}
          onPointerUp={handleCardPointerUp}
          role="button"
          tabIndex={0}
          aria-label="Voltear tarjeta para ver tu código de acceso"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsFlipped((v) => !v);
            }
          }}
        >
          <div className={`loyalty-card-flipper ${isFlipped ? "is-flipped" : ""}`}>
            <div className="loyalty-card loyalty-card-front">
              <div className="loyalty-card-crown">♛</div>
              <span className="loyalty-card-name">{customer.name}</span>
              <span className="loyalty-card-tier">
                Nivel {currentTierIndex} · {customer.purchasesCount} compras
              </span>

              <div className="loyalty-progress-bar">
                <div className="loyalty-progress-fill" style={{ width: `${progressPercent}%` }} />
              </div>
              {nextTier ? (
                <span className="loyalty-progress-label">
                  {nextTier.purchasesRequired - customer.purchasesCount} compras para tu siguiente nivel
                </span>
              ) : (
                <span className="loyalty-progress-label">¡Alcanzaste el nivel máximo!</span>
              )}

              <div className="loyalty-tracker">
                {sortedTiers.map((tier, index) => {
                  const reached = customer.purchasesCount >= tier.purchasesRequired;
                  return (
                    <div
                      key={tier.id}
                      className="loyalty-tracker-step"
                      style={{ "--step-delay": `${0.45 + index * 0.12}s` } as CSSProperties}
                    >
                      {index > 0 && (
                        <span className={`loyalty-tracker-line ${reached ? "loyalty-tracker-line-active" : ""}`} />
                      )}
                      <span className={`loyalty-tracker-circle ${reached ? "loyalty-tracker-circle-active" : ""}`}>
                        {reached ? "✓" : index + 1}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="loyalty-card loyalty-card-back">
              <span className="loyalty-card-back-title">Tu código de acceso</span>
              {qrDataUrl && (
                <img
                  src={qrDataUrl}
                  alt="Código QR de tu tarjeta"
                  className="loyalty-card-qr"
                  draggable={false}
                />
              )}
              <span className="loyalty-card-access-code">{customer.accessCode}</span>
              <p className="loyalty-card-back-hint">
                Entra con tu WhatsApp y este código desde el acceso de la tienda si pierdes este link.
              </p>
            </div>
          </div>
        </div>
        <span className="loyalty-card-flip-tip">Toca o desliza la tarjeta para ver tu código →</span>

        <div className="loyalty-rewards">
          <h2>Recompensas</h2>
          {sortedTiers.map((tier, index) => {
            const unlocked = customer.purchasesCount >= tier.purchasesRequired;
            const claim = claims.find((c) => c.tierId === tier.id);

            return (
              <div
                key={tier.id}
                className={`loyalty-reward-row ${unlocked ? "" : "loyalty-reward-locked"}`}
                style={{ "--row-delay": `${0.1 + index * 0.08}s` } as CSSProperties}
              >
                <div>
                  <span className="loyalty-reward-requirement">{tier.purchasesRequired} compras</span>
                  <p className="loyalty-reward-description">{tier.rewardDescription}</p>
                </div>

                {!unlocked && <span className="loyalty-reward-status">Bloqueado</span>}
                {unlocked && !claim && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={isRequesting === tier.id}
                    onClick={() => handleClaim(tier.id)}
                  >
                    {isRequesting === tier.id ? "Enviando..." : "Reclamar recompensa"}
                  </button>
                )}
                {unlocked && claim && !claim.claimed && (
                  <span className="loyalty-reward-status loyalty-reward-pending">Pendiente de confirmar</span>
                )}
                {unlocked && claim && claim.claimed && (
                  <span className="loyalty-reward-status loyalty-reward-claimed">
                    ¡Reclamado!{claim.couponCode ? ` Cupón: ${claim.couponCode}` : ""}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
