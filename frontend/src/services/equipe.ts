import { api } from "../api/axios";
import type { Pagina } from "../types/pagina";

export type Funcionario = {
    id: number;
    nome: string;
    email: string;
    perfil: string;
};

export type DadosFuncionario = {
    nome: string;
    email: string;
    cpf: string;
    perfil: string;
    senha: string;
    confirmacaoSenha: string;
};

export async function listarEquipe(pagina: number, limite = 10) {
    const resposta = await api.get<Pagina<Funcionario>>("/usuarios/equipe", {
        params: { pagina, limite },
    });
    return resposta.data;
}

export async function criarFuncionario(dados: DadosFuncionario) {
    const resposta = await api.post<Funcionario>("/usuarios/equipe", dados);
    return resposta.data;
}