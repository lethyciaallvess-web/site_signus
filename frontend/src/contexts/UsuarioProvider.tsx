import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { UsuarioContext } from "./UsuarioContext";
import { api } from "../api/axios";
import { logout } from "../services/autenticacao";
import type { Usuario } from "../services/autenticacao";

type UsuarioProviderProps = { children: ReactNode };
export function UsuarioProvider({ children }: UsuarioProviderProps) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(() => !!localStorage.getItem("token"));
  useEffect(() => {
    let ativo = true;
    let ultimaConsulta = 0;
    async function verificarSessao() {
      const token = localStorage.getItem("token");
      const consulta = ++ultimaConsulta;
      if (!token) { setUsuario(null); setCarregando(false); return; }
      setCarregando(true);
      try {
        const { data } = await api.get<Usuario>("/usuarios/me");
        if (!ativo || consulta !== ultimaConsulta || localStorage.getItem("token") !== token) return;
        setUsuario(data);
        localStorage.setItem("usuario", JSON.stringify(data));
      } catch {
        if (ativo && consulta === ultimaConsulta && localStorage.getItem("token") === token) {
          setUsuario(null);
        }
      } finally {
        if (ativo && consulta === ultimaConsulta && localStorage.getItem("token") === token) setCarregando(false);
      }
    }
    function aoMudarArmazenamento(evento: StorageEvent) {
      if (evento.key === "token" || evento.key === null) void verificarSessao();
    }
    void verificarSessao();
    window.addEventListener("focus", verificarSessao);
    window.addEventListener("storage", aoMudarArmazenamento);
    return () => {
      ativo = false;
      window.removeEventListener("focus", verificarSessao);
      window.removeEventListener("storage", aoMudarArmazenamento);
    };
  }, []);
  function atualizarUsuario(novoUsuario: Usuario | null) {
    setUsuario(novoUsuario);
    setCarregando(false);
    if (novoUsuario) localStorage.setItem("usuario", JSON.stringify(novoUsuario));
    else localStorage.removeItem("usuario");
  }
  function sair() { logout(); setUsuario(null); setCarregando(false); }
  return <UsuarioContext.Provider value={{ usuario, carregando, atualizarUsuario, sair }}>{children}</UsuarioContext.Provider>;
}
