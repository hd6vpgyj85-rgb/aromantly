import { useEffect } from "react";

const AWAY_TITLE = "Tu aroma te está esperando…";

/**
 * Cambia el título de la pestaña cuando el cliente se va a otra y lo
 * regresa al volver. Un guiño chiquito para que la tienda no se olvide
 * entre veinte pestañas abiertas.
 */
export default function useTabTitleTease() {
  useEffect(() => {
    const originalTitle = document.title;

    const handleVisibilityChange = () => {
      document.title = document.hidden ? AWAY_TITLE : originalTitle;
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.title = originalTitle;
    };
  }, []);
}
