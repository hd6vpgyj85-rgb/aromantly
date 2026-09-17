import type { CSSProperties } from "react";
import "./SpritzBurst.css";

/**
 * Rociada: gotitas que salen en abanico desde el centro, como cuando se
 * aprieta el atomizador de un perfume. Se monta con una key distinta en
 * cada uso para que la animación vuelva a correr.
 */
const DROPS = [
  { x: -34, y: -22, size: 5, delay: 0.04 },
  { x: -20, y: -38, size: 4, delay: 0 },
  { x: -6, y: -44, size: 6, delay: 0.07 },
  { x: 10, y: -42, size: 4, delay: 0.02 },
  { x: 24, y: -34, size: 5, delay: 0.06 },
  { x: 36, y: -20, size: 3, delay: 0.09 },
  { x: -12, y: -28, size: 3, delay: 0.12 },
  { x: 16, y: -26, size: 4, delay: 0.1 },
];

export default function SpritzBurst() {
  return (
    <span className="spritz" aria-hidden="true">
      {DROPS.map((drop, index) => (
        <span
          key={index}
          className="spritz-drop"
          style={
            {
              width: drop.size,
              height: drop.size,
              animationDelay: `${drop.delay}s`,
              "--spritz-x": `${drop.x}px`,
              "--spritz-y": `${drop.y}px`,
            } as CSSProperties
          }
        />
      ))}
    </span>
  );
}
