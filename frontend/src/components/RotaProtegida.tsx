import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { estaLogado } from "../services/autenticacao";
import { useUsuario } from "../contexts/UsuarioContext";
export function RotaProtegida({ children }: { children: ReactNode }) {
  const { usuario, carregando } = useUsuario();
  if (carregando) return <p role="status">Carregando seu acesso...</p>;
  if (!estaLogado() || !usuario) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}
