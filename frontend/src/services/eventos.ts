import { api } from "../api/axios";
import type { Pagina } from "../types/pagina";
import type { ItemPlano } from "./planos";

export type StatusEvento =
    | "ORCAMENTO"
    | "CONFIRMADO"
    | "EM_PREPARACAO"
    | "CONCLUIDO"
    | "CANCELADO";

export type ItemEvento = ItemPlano;

export type Evento = {
    id: number;
    nome: string;
    dataInicio: string;
    dataFim: string;
    localEvento: string;
    status: StatusEvento;
    valorNegociado: number | null;
    observacoes: string | null;
    clienteId: number;
    planoId: number | null;
    cliente: { id: number; nome: string } | null;
    plano: { id: number; nome: string } | null;
    itensExtras: ItemEvento[];
};

export type DadosEvento = {
    nome: string;
    localEvento: string;
    clienteId: number;
    planoId: number | null;
    dataInicio: string;
    dataFim: string;
    valorNegociado: number | null;
    observacoes: string;
    status?: StatusEvento;
    itensExtras: { itemId: number; quantidade: number }[];
};

export async function listarEventos(pagina: number, limite = 10, busca = "") {
    const resposta = await api.get<Pagina<Evento>>("/eventos", {
        params: { pagina, limite, busca: busca || undefined },
    });
    return resposta.data;
}

export async function buscarEvento(id: number) {
    const resposta = await api.get<Evento>(`/eventos/${id}`);
    return resposta.data;
}

export async function criarEvento(dados: DadosEvento) {
    const resposta = await api.post<Evento>("/eventos", dados);
    return resposta.data;
}

export async function atualizarEvento(id: number, dados: DadosEvento) {
    const resposta = await api.put<Evento>(`/eventos/${id}`, dados);
    return resposta.data;
}

export async function excluirEvento(id: number) {
    await api.delete(`/eventos/${id}`);
}