import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Dashboard from "@/components/Dashboard";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Vellum — Finanzas minimalistas";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "App minimalista de finanzas personales: registra transacciones, visualiza tus gastos por método de pago.");
    if (!loading && !user) navigate("/auth", { replace: true });
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center text-muted-foreground text-sm">
        Cargando...
      </div>
    );
  }

  if (!user) return null;
  return <Dashboard />;
};

export default Index;
