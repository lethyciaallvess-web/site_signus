import { useState } from "react";
import type { ReactNode } from "react";
import { UsuarioContext } from "./UsuarioContext";
import { logout, obterUsuario } from "../services/autenticacao";
import type { Usuario } from "../services/autenticacao";

type UsuarioProviderProps = {
  children: ReactNode;
};

export function UsuarioProvider({ children }: UsuarioProviderProps) {
  const [usuario, setUsuario] = useState<Usuario | null>(obterUsuario());

  function atualizarUsuario(novoUsuario: Usuario | null) {
    setUsuario(novoUsuario);
    if (novoUsuario) {
      localStorage.setItem("usuario", JSON.stringify(novoUsuario));
    }
  }

  function sair() {
    logout();
    setUsuario(null);
  }

  return (
    <UsuarioContext.Provider value={{ usuario, atualizarUsuario, sair }}>
      {children}
    </UsuarioContext.Provider>
  );
}