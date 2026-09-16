import { useState } from "react";
import { useReviews } from "../../contexts/ReviewsContext";
import type { ReviewStatus } from "../../types";

const FILTERS: { key: ReviewStatus; label: string }[] = [
  { key: "pendiente", label: "Pendientes" },
  { key: "aprobada", label: "Aprobadas" },
  { key: "rechazada", label: "Rechazadas" },
];

export default function ReviewsPage() {
  const { reviews, updateStatus, deleteReview } = useReviews();
  const [filter, setFilter] = useState<ReviewStatus>("pendiente");

  const filtered = reviews.filter((r) => r.status === filter);

  return (
    <div>
      <div className="admin-page-header">
        <h1>Reseñas</h1>
      </div>

      <div className="admin-chip-row">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            className={`admin-chip ${filter === f.key ? "admin-chip-active" : ""}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="admin-empty">No hay reseñas {filter}s.</p>
      ) : (
        <div className="admin-list">
          {filtered.map((review) => (
            <div key={review.id} className="admin-row-card" style={{ alignItems: "flex-start" }}>
              {review.image && (
                <div className="admin-row-card-thumb">
                  <img src={review.image} alt={review.name} />
                </div>
              )}
              <div className="admin-row-card-info">
                <div className="admin-row-card-title">
                  {review.name} · {"★".repeat(review.rating)}
                </div>
                <div className="admin-row-card-subtitle">{review.quote}</div>
                <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {review.status !== "aprobada" && (
                    <button
                      type="button"
                      className="btn btn-primary admin-btn-sm"
                      onClick={() => updateStatus(review.id, "aprobada")}
                    >
                      Aprobar
                    </button>
                  )}
                  {review.status !== "rechazada" && (
                    <button
                      type="button"
                      className="btn btn-secondary admin-btn-sm"
                      onClick={() => updateStatus(review.id, "rechazada")}
                    >
                      Rechazar
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-secondary admin-btn-sm admin-btn-danger"
                    onClick={() => {
                      if (confirm("¿Eliminar esta reseña?")) deleteReview(review.id);
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
