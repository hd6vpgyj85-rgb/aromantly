import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useLoyalty } from "../../contexts/LoyaltyContext";
import "./LoginPage.css";

export default function LoginPage() {
  const { session, isLoading, signIn } = useAuth();
  const { loginCustomer } = useLoyalty();
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading) return null;
  if (session) {
    const from = (location.state as { from?: string } | null)?.from ?? "/admin";
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      // Si el correo/número y la contraseña/código coinciden con un cliente,
      // entra directo a su tarjeta de fidelidad sin tocar la sesión de
      // Supabase Auth del admin. Si no coincide con ningún cliente, se
      // intenta el login normal del admin (correo y contraseña reales).
      const customerToken = await loginCustomer(email, password);
      if (customerToken) {
        navigate(`/fidelidad/${customerToken}`);
        return;
      }
      await signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar sesión.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-login">
      <form className="admin-login-form" onSubmit={handleSubmit}>
        <span className="admin-login-logo">Aromantly</span>
        <h1>Panel de administración</h1>
        <p className="admin-login-hint">
          ¿Eres cliente? Entra con tu número de WhatsApp y tu código de acceso.
        </p>
        <input
          type="text"
          placeholder="Correo o número de WhatsApp"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Contraseña o código de acceso"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="admin-login-error">{error}</p>}
        <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting}>
          {isSubmitting ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
