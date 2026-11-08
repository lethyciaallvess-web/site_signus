import { RequisicaoInvalidaErro } from "../erros/erros-http";
import { lerCorpo, validarCpf, validarNome, validarSenha } from "./campos-usuario";

export interface DadosAtualizarUsuario {
  nome?: string;
  cpf?: string;
  senha?: string;
}

export function validarDadosAtualizarUsuario(corpo: unknown): DadosAtualizarUsuario {
  const bruto = lerCorpo(corpo);
  const erros: string[] = [];
  const dados: DadosAtualizarUsuario = {};

  if ("email" in bruto) erros.push("O e-mail não pode ser alterado.");

  if (bruto.nome !== undefined) dados.nome = validarNome(bruto.nome, erros);
  if (bruto.cpf !== undefined) dados.cpf = validarCpf(bruto.cpf, erros);
  if (bruto.senha !== undefined) {
    dados.senha = validarSenha(bruto.senha, bruto.confirmacaoSenha, erros);
  }

  if (Object.keys(dados).length === 0 && erros.length === 0) {
    erros.push("Informe ao menos um campo para atualizar.");
  }

  if (erros.length > 0) {
    throw new RequisicaoInvalidaErro("Dados de edição inválidos.", erros);
  }
  return dados;
}