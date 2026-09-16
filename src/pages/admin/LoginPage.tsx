import { useState, type FormEvent } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./LoginPage.css";

export default function LoginPage() {
  const { session, isLoading, signIn } = useAuth();
  const location = useLocation();
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
        <input
          type="email"
          placeholder="Correo"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Contraseña"
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
