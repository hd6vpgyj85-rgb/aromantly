import { useState, type ReactNode } from "react";
import "./Accordion.css";

interface AccordionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export default function Accordion({ title, children, defaultOpen = false }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`accordion ${isOpen ? "accordion-open" : ""}`}>
      <button
        type="button"
        className="accordion-trigger"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((v) => !v)}
      >
        <span>{title}</span>
        <span className={`accordion-chevron ${isOpen ? "accordion-chevron-open" : ""}`}>⌄</span>
      </button>
      <div className="accordion-panel" aria-hidden={!isOpen}>
        <div className="accordion-content">{children}</div>
      </div>
    </div>
  );
}
