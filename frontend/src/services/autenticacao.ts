import { api } from "../api/axios";

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: string;
}

interface RespostaLogin {
  accessToken: string;
  usuario: Usuario;
}

export async function cadastrar(dados: {
  nome: string;
  email: string;
  cpf: string;
  senha: string;
  confirmacaoSenha: string;
}) {
  const resposta = await api.post<Usuario>("/usuarios", dados);
  return resposta.data;
}

export async function login(email: string, senha: string) {
  const resposta = await api.post<RespostaLogin>("/autenticacao/login", {
    email,
    senha,
  });

  localStorage.setItem("token", resposta.data.accessToken);
  localStorage.setItem("usuario", JSON.stringify(resposta.data.usuario));
  return resposta.data.usuario;
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
}

export function estaLogado() {
  return localStorage.getItem("token") !== null;
}

export function obterUsuario(): Usuario | null {
  try {
    const texto = localStorage.getItem("usuario");
    return texto ? (JSON.parse(texto) as Usuario) : null;
  } catch {
    return null;
  }
}

export type DadosEdicao = {
  nome: string;
  cpf: string;
  senha: string;
  confirmacaoSenha: string;
};

export async function atualizarPerfil(dados: DadosEdicao): Promise<Usuario> {
  const resposta = await api.put<Usuario>("/usuarios/me", dados);
  return resposta.data;
}