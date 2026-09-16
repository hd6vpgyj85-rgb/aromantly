import { useState } from "react";
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

  const slides = approvedReviews.slice(0, 2);
  if (slides.length === 0) return null;

  const current = slides[slide];

  return (
    <section className="testimonials">
      <div className="container">
        <h2>Lo que dicen nuestros clientes</h2>

        {/* key fuerza el remontaje para que el cross-fade se dispare en cada cambio */}
        <div className="testimonials-slide" key={slide}>
          {current.image && (
            <div className="testimonial-image">
              <img src={current.image} alt={current.name} loading="lazy" />
            </div>
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
    </section>
  );
}
