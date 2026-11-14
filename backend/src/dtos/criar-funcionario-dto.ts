import { PerfilUsuario } from "../entidades/usuario";
import { RequisicaoInvalidaErro } from "../erros/erros-http";
import {
  lerCorpo,
  validarCpf,
  validarEmail,
  validarNome,
  validarSenha,
} from "./campos-usuario";

export type PerfilEquipe = PerfilUsuario.ADMIN | PerfilUsuario.OPERADOR;

export interface DadosCriarFuncionario {
  nome: string;
  email: string;
  cpf: string;
  perfil: PerfilEquipe;
  senha: string;
}

const PERFIS_EQUIPE: readonly PerfilEquipe[] = [PerfilUsuario.ADMIN, PerfilUsuario.OPERADOR];

function ehPerfilEquipe(valor: unknown): valor is PerfilEquipe {
  return PERFIS_EQUIPE.some((perfil) => perfil === valor);
}

export function validarDadosCriarFuncionario(corpo: unknown): DadosCriarFuncionario {
  const bruto = lerCorpo(corpo);
  const erros: string[] = [];

  const perfil = bruto.perfil;
  if (!ehPerfilEquipe(perfil)) {
    erros.push("O perfil deve ser ADMIN ou OPERADOR.");
  }

  const dados = {
    nome: validarNome(bruto.nome, erros),
    email: validarEmail(bruto.email, erros),
    cpf: validarCpf(bruto.cpf, erros),
    senha: validarSenha(bruto.senha, bruto.confirmacaoSenha, erros),
  };

  if (erros.length > 0 || !ehPerfilEquipe(perfil)) {
    throw new RequisicaoInvalidaErro("Dados do funcionário inválidos.", erros);
  }
  return { ...dados, perfil };
}
