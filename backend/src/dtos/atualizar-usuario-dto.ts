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
  senha?: string;
  senhaAtual?: string;
}

function preenchido(valor: unknown): boolean {
  return typeof valor === "string" && valor.length > 0;
}

export function validarDadosAtualizarUsuario(corpo: unknown): DadosAtualizarUsuario {
  const bruto = lerCorpo(corpo);
  const erros: string[] = [];

  if ("email" in bruto) erros.push("O e-mail não pode ser alterado.");//se vier email no corpo: 400

  const dados: DadosAtualizarUsuario = {// trata os obrigatórios
    nome: validarNome(bruto.nome, erros),
    cpf: validarCpf(bruto.cpf, erros),
    cnpj: validarCnpjOpcional(bruto.cnpj, erros),
  };

  const querTrocarSenha =
    preenchido(bruto.senha) || preenchido(bruto.confirmacaoSenha) || preenchido(bruto.senhaAtual);

  if (querTrocarSenha) {
    dados.senha = validarSenha(bruto.senha, bruto.confirmacaoSenha, erros);
    if (!preenchido(bruto.senhaAtual)) {
      erros.push("Informe a senha atual para trocar a senha.");
    } else {
      dados.senhaAtual = bruto.senhaAtual as string;
    }
  }//

  if (erros.length > 0) {
    throw new RequisicaoInvalidaErro("Dados de edição inválidos.", erros);
  }
  return dados;
}