import { RequisicaoInvalidaErro } from "../erros/erros-http";
import {
  lerCorpo,
  validarCnpjOpcional,
  validarCpf,
  validarEmail,
  validarNome,
  validarSenha,
} from "./campos-usuario";

export interface DadosCriarUsuario {
  nome: string;
  email: string;
  cpf: string;
  cnpj: string | null;
  senha: string;
}

export function validarDadosCriarUsuario(corpo: unknown): DadosCriarUsuario {
  const bruto = lerCorpo(corpo);
  const erros: string[] = [];

  const dados: DadosCriarUsuario = {
    nome: validarNome(bruto.nome, erros),
    email: validarEmail(bruto.email, erros),
    cpf: validarCpf(bruto.cpf, erros),
    cnpj: validarCnpjOpcional(bruto.cnpj, erros),
    senha: validarSenha(bruto.senha, bruto.confirmacaoSenha, erros),
  };

  if (erros.length > 0) {
    throw new RequisicaoInvalidaErro("Dados de cadastro inválidos.", erros);
  }
  return dados;
}