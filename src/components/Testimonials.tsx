import { useEffect, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { useReviews } from "../contexts/ReviewsContext";
import "./Testimonials.css";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="testimonial-stars" aria-label={`${rating} de 5 estrellas`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={i < rating ? "star-filled" : "star-empty"}
          style={{ animationDelay: `${i * 70}ms` }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function Testimonials() {
  const { approvedReviews } = useReviews();
  const [slide, setSlide] = useState(0);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

  // Móvil: sigue viéndose una reseña a la vez, con dots (así ya se veía bien).
  const mobileSlides = approvedReviews.slice(0, 2);

  useEffect(() => {
    if (!previewSrc) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPreviewSrc(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewSrc]);

  if (approvedReviews.length === 0) return null;

  const current = mobileSlides[slide];

  return (
    <section className="testimonials">
      <div className="container">
        <h2>Lo que dicen nuestros clientes</h2>

        {/* Móvil: una reseña grande a la vez. En escritorio se veía enorme
            (la foto no tenía una altura fija y se estiraba a su tamaño
            original), así que ahí se usa el grid compacto de abajo. */}
        <div className="testimonials-mobile-only">
          {/* key fuerza el remontaje para que el cross-fade se dispare en cada cambio */}
          <div className="testimonials-slide" key={slide}>
            {current.image && (
              <button
                type="button"
                className="testimonial-image"
                onClick={() => setPreviewSrc(current.image!)}
                aria-label="Ver foto de la reseña en grande"
              >
                <img src={current.image} alt={current.name} loading="lazy" />
              </button>
            )}
            <div className="testimonial-body">
              <Stars rating={current.rating} />
              <p className="testimonial-quote">&ldquo;{current.quote}&rdquo;</p>
              <span className="testimonial-name">{current.name}</span>
              {current.level && <span className="testimonial-level">{current.level}</span>}
            </div>
          </div>

          {mobileSlides.length > 1 && (
            <div className="testimonials-dots">
              {mobileSlides.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  className={`carousel-dot ${index === slide ? "carousel-dot-active" : ""}`}
                  aria-label={`Ver testimonio ${index + 1}`}
                  onClick={() => setSlide(index)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Escritorio: varias reseñas compactas lado a lado. */}
        <div className="testimonials-grid">
          {approvedReviews.map((review, index) => (
            <div
              key={review.id}
              className="testimonial-card"
              style={{ "--card-delay": `${index * 0.08}s` } as CSSProperties}
            >
              {review.image && (
                <button
                  type="button"
                  className="testimonial-card-image"
                  onClick={() => setPreviewSrc(review.image!)}
                  aria-label="Ver foto de la reseña en grande"
                >
                  <img src={review.image} alt={review.name} loading="lazy" />
                </button>
              )}
              <Stars rating={review.rating} />
              <p className="testimonial-card-quote">&ldquo;{review.quote}&rdquo;</p>
              <span className="testimonial-card-name">{review.name}</span>
              {review.level && <span className="testimonial-card-level">{review.level}</span>}
            </div>
          ))}
        </div>
      </div>

      {previewSrc &&
        createPortal(
          <div className="testimonial-preview" onClick={() => setPreviewSrc(null)}>
            <button
              type="button"
              className="testimonial-preview-close"
              aria-label="Cerrar"
              onClick={() => setPreviewSrc(null)}
            >
              ×
            </button>
            <img src={previewSrc} alt="" onClick={(e) => e.stopPropagation()} />
          </div>,
          document.body
        )}
    </section>
  );
}
