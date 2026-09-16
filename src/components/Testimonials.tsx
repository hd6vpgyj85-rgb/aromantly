import { useEffect, useState } from "react";
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
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const slides = approvedReviews.slice(0, 2);

  useEffect(() => {
    if (!isPreviewOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsPreviewOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPreviewOpen]);

  if (slides.length === 0) return null;

  const current = slides[slide];

  return (
    <section className="testimonials">
      <div className="container">
        <h2>Lo que dicen nuestros clientes</h2>

        {/* key fuerza el remontaje para que el cross-fade se dispare en cada cambio */}
        <div className="testimonials-slide" key={slide}>
          {current.image && (
            <button
              type="button"
              className="testimonial-image"
              onClick={() => setIsPreviewOpen(true)}
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

        {slides.length > 1 && (
          <div className="testimonials-dots">
            {slides.map((_, index) => (
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

      {isPreviewOpen &&
        current.image &&
        createPortal(
          <div className="testimonial-preview" onClick={() => setIsPreviewOpen(false)}>
            <button
              type="button"
              className="testimonial-preview-close"
              aria-label="Cerrar"
              onClick={() => setIsPreviewOpen(false)}
            >
              ×
            </button>
            <img src={current.image} alt={current.name} onClick={(e) => e.stopPropagation()} />
          </div>,
          document.body
        )}
    </section>
  );
}
