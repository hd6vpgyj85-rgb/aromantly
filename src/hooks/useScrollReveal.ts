import { useEffect, useRef, useState } from "react";

interface ScrollRevealOptions {
  /** Porcentaje del elemento visible para disparar la animación. */
  threshold?: number;
  /** Margen extra para adelantar/atrasar el disparo. */
  rootMargin?: string;
  /** Si es false, la animación se repite cada vez que entra en pantalla. */
  once?: boolean;
}

/**
 * Detecta cuándo un elemento entra en pantalla para animar su aparición.
 * Si el navegador no soporta IntersectionObserver, o el usuario pidió
 * reducir movimiento, el elemento se marca como visible de inmediato.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: ScrollRevealOptions = {}
) {
  const { threshold = 0.15, rootMargin = "0px 0px -60px 0px", once = true } = options;
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion || typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setIsVisible(false);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, isVisible };
}
