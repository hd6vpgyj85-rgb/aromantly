import { useEffect } from "react";

/** Bloquea el scroll del body mientras `isLocked` es true (ej. menú a pantalla completa abierto). */
export function useBodyScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isLocked]);
}
