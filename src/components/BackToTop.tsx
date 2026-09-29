import { useEffect, useState } from "react";
import "./BackToTop.css";

/**
 * Botón para volver arriba. Va abajo a la izquierda porque el de WhatsApp
 * arranca abajo a la derecha (y el cliente puede arrastrarlo).
 */
export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const update = () => setIsVisible(window.scrollY > 700);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <button
      type="button"
      className={`back-to-top ${isVisible ? "back-to-top-visible" : ""}`}
      aria-label="Volver arriba"
      tabIndex={isVisible ? 0 : -1}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="m6 15 6-6 6 6" />
      </svg>
    </button>
  );
}
