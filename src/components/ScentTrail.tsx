import type { CSSProperties } from "react";
import "./ScentTrail.css";

/**
 * Estela de aroma: partículas que suben lento y se desvanecen, como el
 * rastro que deja una fragancia en el aire. Es puramente decorativa, así
 * que va oculta para lectores de pantalla y no intercepta clics.
 *
 * Cada partícula lleva su propio retraso, duración y deriva lateral para
 * que nunca se vean dos moviéndose igual.
 */
const PARTICLES = [
  { left: "6%", size: 5, delay: 0, duration: 11, drift: 18, opacity: 0.28 },
  { left: "14%", size: 3, delay: 3.4, duration: 9, drift: -12, opacity: 0.2 },
  { left: "23%", size: 6, delay: 1.6, duration: 13, drift: 24, opacity: 0.3 },
  { left: "31%", size: 4, delay: 6.2, duration: 10, drift: -20, opacity: 0.22 },
  { left: "44%", size: 3, delay: 2.5, duration: 12, drift: 14, opacity: 0.26 },
  { left: "52%", size: 7, delay: 8, duration: 14, drift: -26, opacity: 0.18 },
  { left: "61%", size: 4, delay: 4.8, duration: 10.5, drift: 20, opacity: 0.3 },
  { left: "70%", size: 5, delay: 0.9, duration: 12.5, drift: -16, opacity: 0.24 },
  { left: "79%", size: 3, delay: 7.1, duration: 9.5, drift: 22, opacity: 0.2 },
  { left: "88%", size: 6, delay: 5.3, duration: 13.5, drift: -18, opacity: 0.27 },
  { left: "95%", size: 4, delay: 2.1, duration: 11.5, drift: 12, opacity: 0.22 },
];

export default function ScentTrail() {
  return (
    <div className="scent-trail" aria-hidden="true">
      {PARTICLES.map((particle, index) => (
        <span
          key={index}
          className="scent-particle"
          style={
            {
              left: particle.left,
              width: particle.size,
              height: particle.size,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
              "--sillage-drift": `${particle.drift}px`,
              "--sillage-opacity": particle.opacity,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
