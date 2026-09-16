import type { ElementType, ReactNode } from "react";
import { useScrollReveal } from "../hooks/useScrollReveal";
import "./Reveal.css";

type RevealDirection = "up" | "down" | "left" | "right" | "fade" | "zoom";

interface RevealProps {
  children: ReactNode;
  /** Dirección desde la que entra el contenido. */
  direction?: RevealDirection;
  /** Retraso en milisegundos, para escalonar varios elementos. */
  delay?: number;
  /** Etiqueta HTML a renderizar (section, div, li...). */
  as?: ElementType;
  className?: string;
  id?: string;
}

export default function Reveal({
  children,
  direction = "up",
  delay = 0,
  as: Tag = "div",
  className = "",
  id,
}: RevealProps) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();

  return (
    <Tag
      ref={ref}
      id={id}
      className={`reveal reveal-${direction} ${isVisible ? "reveal-visible" : ""} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
