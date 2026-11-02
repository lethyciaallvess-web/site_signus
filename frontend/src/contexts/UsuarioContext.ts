import { createContext, useContext } from "react";
import type { Usuario } from "../services/autenticacao";

type UsuarioContextType = {
  usuario: Usuario | null;
  atualizarUsuario: (usuario: Usuario | null) => void;
  sair: () => void;
};

export const UsuarioContext = createContext<UsuarioContextType | null>(null);

export function useUsuario() {
  const contexto = useContext(UsuarioContext);
  if (!contexto) {
    throw new Error("useUsuario deve ser usado dentro de UsuarioProvider");
  }
  return contexto;
}