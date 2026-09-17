import { useEffect, useRef, useState } from "react";

interface CountUpProps {
  to: number;
  /** Duración de la cuenta en milisegundos. */
  duration?: number;
}

/**
 * Cuenta de 0 hasta el número dado con una curva que desacelera al final,
 * para que el dato se sienta vivo en vez de aparecer seco.
 */
export default function CountUp({ to, duration = 1400 }: CountUpProps) {
  const [value, setValue] = useState(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    // Si el cliente pidió menos movimiento, se muestra el número final directo.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(to);
      return;
    }

    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      // easeOutCubic: arranca rápido y frena suave al llegar.
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(to * eased));
      if (progress < 1) frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [to, duration]);

  return <>{value.toLocaleString("es-MX")}</>;
}
