import type { StatusEvento } from "../services/eventos";

export const rotulosStatus: Record<StatusEvento, string> = {
    ORCAMENTO: "Orçamento",
    CONFIRMADO: "Confirmado",
    EM_PREPARACAO: "Em preparação",
    CONCLUIDO: "Concluído",
    CANCELADO: "Cancelado",
};

export const rotulosPerfil: Record<string, string> = {
    ADMIN: "Administrador",
    OPERADOR: "Operador",
    CLIENTE: "Cliente",
};

export function formatarDataHora(texto: string) {
    const partes = texto.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);

    if (!partes) {
        return texto;
    }

    const [, ano, mes, dia, hora, minuto] = partes;
    return `${dia}/${mes}/${ano} ${hora}:${minuto}`;
}

export function formatarIniciais(nome: string) {
    const partes = nome.trim().split(/\s+/).filter(Boolean);

    if (partes.length === 0) {
        return "?";
    }

    if (partes.length === 1) {
        return partes[0][0].toUpperCase();
    }

    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

export const proximosStatus: Record<StatusEvento, StatusEvento[]> = {
    ORCAMENTO: ["CONFIRMADO", "CANCELADO"],
    CONFIRMADO: ["EM_PREPARACAO", "CANCELADO"],
    EM_PREPARACAO: ["CONCLUIDO", "CANCELADO"],
    CONCLUIDO: [],
    CANCELADO: [],
};