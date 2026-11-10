import { RequisicaoInvalidaErro } from "../erros/erros-http";
import { lerCorpo, validarCpf, validarEmail } from "./campos-usuario";

export interface DadosCliente {
  nome: string;
  documento: string;
  email: string;
  telefone: string;
  observacoes: string | null;
}

export function validarDadosCliente(corpo: unknown): DadosCliente {
  const bruto = lerCorpo(corpo);
  const erros: string[] = [];

  const nome = typeof bruto.nome === "string" ? bruto.nome.trim() : "";
  if (nome.length === 0) erros.push("O nome é obrigatório.");

  const telefone = typeof bruto.telefone === "string" ? bruto.telefone.trim() : "";

  const dados: DadosCliente = {
    nome,
    documento: validarCpf(bruto.documento, erros),
    email: validarEmail(bruto.email, erros),
    telefone,
    observacoes: typeof bruto.observacoes === "string" ? bruto.observacoes : null,
  };

  if (erros.length > 0) {
    throw new RequisicaoInvalidaErro("Dados do cliente inválidos.", erros);
  }
  return dados;
}
