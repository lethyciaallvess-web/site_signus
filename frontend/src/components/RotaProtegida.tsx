import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { estaLogado, obterUsuario } from "../services/autenticacao";
import { PERFIL_CLIENTE, rotaInicial } from "../utils/perfis";

type RotaProtegidaProps = {
    children: ReactNode;
    area?: "cliente" | "equipe";
};

export function RotaProtegida({ children, area }: RotaProtegidaProps) {
    if (!estaLogado()) {
        return <Navigate to="/login" replace />;
    }

    const usuario = obterUsuario();

    if (area && usuario) {
        const ehCliente = usuario.perfil === PERFIL_CLIENTE;

        if ((area === "cliente") !== ehCliente) {
            return <Navigate to={rotaInicial(usuario.perfil)} replace />;
        }
    }

    return <>{children}</>;
}