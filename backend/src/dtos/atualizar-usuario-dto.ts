import { RequisicaoInvalidaErro } from "../erros/erros-http";
import {
  lerCorpo,
  validarCpf,
  validarNome,
  validarSenha,
} from "./campos-usuario";

export interface DadosAtualizarUsuario {
  nome: string;
  cpf: string;
  senha: string;
}

export function validarDadosAtualizarUsuario(
  corpo: unknown,
): DadosAtualizarUsuario {
  const bruto = lerCorpo(corpo);
  const erros: string[] = [];

  if ("email" in bruto) {
    erros.push("O e-mail não pode ser alterado.");
  }

  const dados: DadosAtualizarUsuario = {
    nome: validarNome(bruto.nome, erros),
    cpf: validarCpf(bruto.cpf, erros),
    senha: validarSenha(bruto.senha, bruto.confirmacaoSenha, erros),
  };

  if (erros.length > 0) {
    throw new RequisicaoInvalidaErro("Dados de edição inválidos.", erros);
  }
  return dados;
}