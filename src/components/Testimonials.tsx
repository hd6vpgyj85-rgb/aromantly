import { useState } from "react";
import { useReviews } from "../contexts/ReviewsContext";
import "./Testimonials.css";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="testimonial-stars" aria-label={`${rating} de 5 estrellas`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < rating ? "star-filled" : "star-empty"}>
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

  return (
    <section className="testimonials">
      <div className="container">
        <h2>Lo que dicen nuestros clientes</h2>

        <div className="testimonials-slide">
          {slides[slide].image && (
            <div className="testimonial-image">
              <img src={slides[slide].image} alt={slides[slide].name} loading="lazy" />
            </div>
          )}
          <div className="testimonial-body">
            <Stars rating={slides[slide].rating} />
            <p className="testimonial-quote">&ldquo;{slides[slide].quote}&rdquo;</p>
            <span className="testimonial-name">{slides[slide].name}</span>
            {slides[slide].level && <span className="testimonial-level">{slides[slide].level}</span>}
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
