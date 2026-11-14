import { RequisicaoInvalidaErro } from "../erros/erros-http";
import {
  lerCorpo,
  validarCnpjOpcional,
  validarCpf,
  validarNome,
  validarSenha,
} from "./campos-usuario";

export interface DadosAtualizarUsuario {
  nome?: string;
  cpf?: string;
  cnpj?: string | null;
  senha?: string;
  senhaAtual?: string;
}

export function validarDadosAtualizarUsuario(corpo: unknown): DadosAtualizarUsuario {
  const bruto = lerCorpo(corpo);
  const erros: string[] = [];
  const dados: DadosAtualizarUsuario = {};

  if ("email" in bruto) erros.push("O e-mail não pode ser alterado.");

  if (bruto.nome !== undefined) dados.nome = validarNome(bruto.nome, erros);
  if (bruto.cpf !== undefined) dados.cpf = validarCpf(bruto.cpf, erros);
  if (bruto.cnpj !== undefined) dados.cnpj = validarCnpjOpcional(bruto.cnpj, erros);
  if (bruto.senha !== undefined) {
    dados.senha = validarSenha(bruto.senha, bruto.confirmacaoSenha, erros);
    if (typeof bruto.senhaAtual !== "string" || bruto.senhaAtual.length === 0) {
      erros.push("Informe a senha atual para trocar a senha.");
    } else {
      dados.senhaAtual = bruto.senhaAtual;
      if (bruto.senhaAtual === bruto.senha) {
        erros.push("A nova senha deve ser diferente da senha atual.");
      }
    }
  } else if (bruto.senhaAtual !== undefined || bruto.confirmacaoSenha !== undefined) {
    erros.push("Para trocar a senha, envie senhaAtual, senha e confirmacaoSenha.");
  }

  if (Object.keys(dados).length === 0 && erros.length === 0) {
    erros.push("Informe ao menos um campo para atualizar.");
  }

  if (erros.length > 0) {
    throw new RequisicaoInvalidaErro("Dados de edição inválidos.", erros);
  }
  return dados;
}