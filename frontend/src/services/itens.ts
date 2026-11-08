import { api } from "../api/axios";
import type { Pagina } from "../types/pagina";

export type Item = {
    id: number;
    codigo: string;
    nome: string;
    categoria: string;
    descricao: string | null;
    ativo: boolean;
    imagem: string | null;
};

export type DadosItem = {
    codigo: string;
    nome: string;
    categoria: string;
    descricao: string;
    ativo: boolean;
};

export async function listarItens(pagina: number, limite = 10) {
    const resposta = await api.get<Pagina<Item>>("/itens", {
        params: { pagina, limite },
    });
    return resposta.data;
}

export async function buscarItem(id: number) {
    const resposta = await api.get<Item>(`/itens/${id}`);
    return resposta.data;
}

export async function criarItem(dados: DadosItem) {
    const resposta = await api.post<Item>("/itens", dados);
    return resposta.data;
}

export async function atualizarItem(id: number, dados: DadosItem) {
    const resposta = await api.put<Item>(`/itens/${id}`, dados);
    return resposta.data;
}

export async function excluirItem(id: number) {
    await api.delete(`/itens/${id}`);
}