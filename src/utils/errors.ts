/**
 * Saca el mensaje legible de un error para mostrarlo en la UI.
 *
 * Los errores de Supabase (`{ data, error } = await supabase.rpc(...)`) NO
 * son instancias de `Error` — son objetos planos `{ message, code, ... }` a
 * menos que se use `.throwOnError()` explícitamente. Un `err instanceof
 * Error` a secas los deja pasar por alto y siempre cae al mensaje
 * genérico, ocultando la causa real (por ejemplo, una función de SQL que
 * no existe todavía porque falta correr `schema.sql`, o una excepción de
 * Postgres con su propio texto). Esta función cubre ambos casos.
 */
export function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) return err.message;
  if (err && typeof err === "object" && "message" in err) {
    const message = (err as { message?: unknown }).message;
    if (typeof message === "string" && message) return message;
  }
  return fallback;
}
