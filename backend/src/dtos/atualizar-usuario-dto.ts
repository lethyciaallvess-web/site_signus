import { RequisicaoInvalidaErro } from "../erros/erros-http";
import {
  lerCorpo,
  validarCnpjOpcional,
  validarCpf,
  validarNome,
  validarSenha,
} from "./campos-usuario";

export interface DadosAtualizarUsuario {
  nome: string;
  cpf: string;
  cnpj: string | null;
  senha: string;
  senhaAtual: string;
}

export function validarDadosAtualizarUsuario(corpo: unknown): DadosAtualizarUsuario {
  const bruto = lerCorpo(corpo);
  const erros: string[] = [];

  if ("email" in bruto) erros.push("O e-mail não pode ser alterado.");

  const senhaAtual = typeof bruto.senhaAtual === "string" ? bruto.senhaAtual : "";
  if (senhaAtual.length === 0) erros.push("Informe a senha atual.");

  const dados: DadosAtualizarUsuario = {
    nome: validarNome(bruto.nome, erros),
    cpf: validarCpf(bruto.cpf, erros),
    cnpj: validarCnpjOpcional(bruto.cnpj, erros),
    senha: validarSenha(bruto.senha, bruto.confirmacaoSenha, erros),
    senhaAtual,
  };

  if (erros.length > 0) {
    throw new RequisicaoInvalidaErro("Dados de edição inválidos.", erros);
  }
  return dados;
}