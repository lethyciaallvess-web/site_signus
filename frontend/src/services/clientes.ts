import { api } from "../api/axios";
import type { Pagina } from "../types/pagina";

export type TipoPessoa = "FISICA" | "JURIDICA";

export type Cliente = {
    id: number;
    tipoPessoa?: TipoPessoa;
    nome: string;
    documento: string;
    email: string;
    telefone: string;
    observacoes: string | null;
};

export type DadosCliente = {
    tipoPessoa: TipoPessoa;
    nome: string;
    documento: string;
    email: string;
    telefone: string;
    observacoes: string;
};

export async function listarClientes(pagina: number, limite = 10, busca = "") {
    const resposta = await api.get<Pagina<Cliente>>("/clientes", {
        params: { pagina, limite, busca: busca || undefined },
    });
    return resposta.data;
}

export async function buscarCliente(id: number) {
    const resposta = await api.get<Cliente>(`/clientes/${id}`);
    return resposta.data;
}

export async function criarCliente(dados: DadosCliente) {
    const resposta = await api.post<Cliente>("/clientes", dados);
    return resposta.data;
}

export async function atualizarCliente(id: number, dados: DadosCliente) {
    const resposta = await api.put<Cliente>(`/clientes/${id}`, dados);
    return resposta.data;
}

export async function excluirCliente(id: number) {
    await api.delete(`/clientes/${id}`);
}