import { useAuth } from "../contexts/AuthContext";
import { getStoredCustomerToken } from "../utils/customerToken";

/**
 * A dónde debe llevar el ícono de perfil del header:
 * - Con sesión de admin activa en este dispositivo → siempre "/admin"
 *   (comportamiento del dueño, sin cambios).
 * - Sin sesión de admin pero con una tarjeta de fidelidad guardada en este
 *   dispositivo (porque tocó su NFC antes) → directo a su tarjeta.
 * - Ninguno de los dos → "/admin" (comportamiento original para un
 *   visitante nuevo).
 */
export function useProfileLinkTarget(): string {
  const { session } = useAuth();
  if (session) return "/admin";
  const token = getStoredCustomerToken();
  return token ? `/fidelidad/${token}` : "/admin";
}
