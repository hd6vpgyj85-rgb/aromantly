import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useHomeBanner } from "../contexts/HomeBannerContext";
import "./PromoBanner.css";

const DEFAULT_IMAGE = "/images/promo-mandarin-sky.jpg";
const AUTO_ADVANCE_MS = 8000;

export default function PromoBanner() {
  const { images } = useHomeBanner();
  const navigate = useNavigate();
  const slides = images.length > 0 ? images : [DEFAULT_IMAGE];

  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  // Mientras un scroll programático (auto-avance o clic en un dot) está en
  // curso, el evento "scroll" que dispara igual no debe recalcular el
  // índice activo (mismo ajuste que en FeaturedCarousel).
  const suppressScrollDetectionRef = useRef(false);
  const suppressTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setActiveIndex(0);
  }, [slides.length]);

  const scrollToIndex = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const child = track.children[index] as HTMLElement | undefined;
    if (!child) return;

    if (suppressTimeoutRef.current) clearTimeout(suppressTimeoutRef.current);
    suppressScrollDetectionRef.current = true;
    setActiveIndex(index);
    // scrollIntoView revisa también los contenedores ancestros (incluida la
    // página): si el banner no está visible (por ejemplo, el cliente está
    // leyendo el footer cuando cambia la imagen sola), termina moviendo el
    // scroll de toda la página hasta el banner. Cada slide ocupa el 100%
    // del ancho, así que la posición exacta es simplemente índice × ancho,
    // y track.scrollTo solo mueve el carrusel, nunca la página.
    track.scrollTo({ left: index * track.clientWidth, behavior: "smooth" });
    suppressTimeoutRef.current = setTimeout(() => {
      suppressScrollDetectionRef.current = false;
    }, 600);
  };

  // Detecta el índice activo cuando el cliente desliza manualmente.
  useEffect(() => {
    const track = trackRef.current;
    if (!track || slides.length < 2) return;

    const handleScroll = () => {
      if (suppressScrollDetectionRef.current) return;
      const maxScroll = track.scrollWidth - track.clientWidth;

      if (track.scrollLeft <= 1) {
        setActiveIndex(0);
        return;
      }
      if (track.scrollLeft >= maxScroll - 1) {
        setActiveIndex(track.children.length - 1);
        return;
      }

      const children = Array.from(track.children) as HTMLElement[];
      const center = track.scrollLeft + track.clientWidth / 2;
      let closestIndex = 0;
      let closestDistance = Infinity;
      children.forEach((child, index) => {
        const childCenter = child.offsetLeft + child.offsetWidth / 2;
        const distance = Math.abs(childCenter - center);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });
      setActiveIndex(closestIndex);
    };

    track.addEventListener("scroll", handleScroll, { passive: true });
    return () => track.removeEventListener("scroll", handleScroll);
  }, [slides.length]);

  // Auto-avance cada 8s. Se reprograma cada vez que activeIndex cambia, sea
  // por el propio auto-avance o por una interacción manual del cliente, así
  // que un deslizamiento manual reinicia el conteo de 8 segundos.
  useEffect(() => {
    if (slides.length < 2) return;
    const timer = setTimeout(() => {
      scrollToIndex((activeIndex + 1) % slides.length);
    }, AUTO_ADVANCE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, slides.length]);

  const handlePointerDown = (e: ReactPointerEvent) => {
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: ReactPointerEvent) => {
    const start = dragStartRef.current;
    dragStartRef.current = null;
    if (!start) return;

    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    // Toque casi sin movimiento = clic real, no un intento de deslizar.
    if (Math.abs(dx) < 8 && Math.abs(dy) < 8) {
      navigate("/ofertas");
    }
  };

  if (slides.length <= 1) {
    return (
      <div className="container">
        <Link to="/ofertas" className="promo-banner" aria-label="Ver edición limitada en Ofertas">
          <img src={slides[0]} alt="Edición limitada" loading="lazy" />
        </Link>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="promo-banner promo-banner-carousel-wrapper">
        <div
          className="promo-banner-carousel"
          ref={trackRef}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          role="link"
          tabIndex={0}
          aria-label="Ver edición limitada en Ofertas"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              navigate("/ofertas");
            }
          }}
        >
          {slides.map((src, index) => (
            <img key={`${src}-${index}`} src={src} alt="Edición limitada" loading="lazy" draggable={false} />
          ))}
        </div>

        <div className="promo-banner-dots">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              className={`promo-banner-dot ${index === activeIndex ? "promo-banner-dot-active" : ""}`}
              aria-label={`Ver imagen ${index + 1}`}
              onClick={() => scrollToIndex(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
