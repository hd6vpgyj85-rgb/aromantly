import { useCallback, useEffect, useRef, useState } from "react";
import { getWhatsAppUrl } from "../data/store";
import "./WhatsAppFloatButton.css";

const STORAGE_KEY = "aromantly_wa_button_pos";
const SIZE = 60;
const MARGIN = 16;

interface Position {
  x: number;
  y: number;
}

function defaultPosition(): Position {
  return {
    x: window.innerWidth - SIZE - MARGIN,
    y: window.innerHeight - SIZE - MARGIN - 24,
  };
}

function clampPosition(pos: Position): Position {
  const maxX = window.innerWidth - SIZE - MARGIN;
  const maxY = window.innerHeight - SIZE - MARGIN;
  return {
    x: Math.min(Math.max(MARGIN, pos.x), Math.max(MARGIN, maxX)),
    y: Math.min(Math.max(MARGIN, pos.y), Math.max(MARGIN, maxY)),
  };
}

export default function WhatsAppFloatButton() {
  const [position, setPosition] = useState<Position>(defaultPosition);
  const [isDragging, setIsDragging] = useState(false);
  const dragMoved = useRef(false);
  const dragOffset = useRef<Position>({ x: 0, y: 0 });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Position;
        setPosition(clampPosition(parsed));
      }
    } catch {
      // ignora errores de storage (modo privado, etc.)
    }
  }, []);

  useEffect(() => {
    const handleResize = () => setPosition((prev) => clampPosition(prev));
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const persist = useCallback((pos: Position) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pos));
    } catch {
      // ignora errores de storage
    }
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      dragMoved.current = false;
      setIsDragging(true);
      dragOffset.current = { x: e.clientX - position.x, y: e.clientY - position.y };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [position]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (!isDragging) return;
      dragMoved.current = true;
      const next = clampPosition({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      });
      setPosition(next);
    },
    [isDragging]
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    persist(position);
  }, [persist, position]);

  const handleClick = useCallback(() => {
    if (dragMoved.current) return;
    window.open(
      getWhatsAppUrl("¡Hola! Quiero información sobre sus perfumes 🌿"),
      "_blank",
      "noopener,noreferrer"
    );
  }, []);

  return (
    <button
      type="button"
      className="wa-float-btn"
      style={{ left: position.x, top: position.y }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={handleClick}
      aria-label="Escríbenos por WhatsApp"
    >
      <svg viewBox="0 0 32 32" width="30" height="30" fill="currentColor" aria-hidden="true">
        <path d="M16 3C9 3 3.3 8.6 3.3 15.5c0 2.5.7 4.8 1.9 6.8L3 29l7-2.1c1.9 1 4 1.6 6 1.6 7 0 12.7-5.6 12.7-12.5S23 3 16 3zm0 22.7c-1.8 0-3.6-.5-5.2-1.4l-.4-.2-4.1 1.2 1.2-4-.2-.4c-1-1.6-1.6-3.5-1.6-5.4 0-5.6 4.6-10.2 10.3-10.2 5.7 0 10.3 4.6 10.3 10.2S21.7 25.7 16 25.7zm5.6-7.7c-.3-.2-1.8-.9-2.1-1-.3-.1-.5-.2-.7.1-.2.3-.8 1-1 1.2-.2.2-.4.3-.7.1-.3-.2-1.3-.5-2.5-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.7.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4-.1-.6-.1-.2-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.2-.9.9-.9 2.2s.9 2.5 1 2.7c.1.2 1.8 2.8 4.4 3.9 2.6 1.1 2.6.7 3.1.7.5-.1 1.6-.6 1.8-1.3.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.6-.4z" />
      </svg>
    </button>
  );
}
