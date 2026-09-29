const CUSTOMER_TOKEN_KEY = "aromantly_customer_token";

/**
 * Guarda el token de la tarjeta de fidelidad en este dispositivo (no
 * expira). Con esto, el ícono de perfil del header puede llevar directo a
 * la tarjeta del cliente sin que tenga que volver a tocar su NFC.
 */
export function saveCustomerToken(token: string) {
  try {
    localStorage.setItem(CUSTOMER_TOKEN_KEY, token);
  } catch {
    // localStorage no disponible (modo privado, storage lleno, etc.)
  }
}

export function getStoredCustomerToken(): string | null {
  try {
    return localStorage.getItem(CUSTOMER_TOKEN_KEY);
  } catch {
    return null;
  }
}
