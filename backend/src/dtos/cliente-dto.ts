import { TipoPessoa } from "../entidades/cliente";
import { RequisicaoInvalidaErro } from "../erros/erros-http";
import { lerCorpo, validarDocumento, validarEmail } from "./campos-usuario";

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
    documento: validarDocumento(bruto.documento, erros),
    email: validarEmail(bruto.email, erros),
    telefone,
    observacoes: typeof bruto.observacoes === "string" ? bruto.observacoes : null,
  };

  if (bruto.tipoPessoa !== undefined) {
    const esperado = dados.documento.length === 14 ? TipoPessoa.JURIDICA : TipoPessoa.FISICA;
    if (!Object.values(TipoPessoa).includes(bruto.tipoPessoa as TipoPessoa)) {
      erros.push("Tipo de pessoa inválido.");
    } else if (bruto.tipoPessoa !== esperado) {
      erros.push("Pessoa física usa CPF e pessoa jurídica usa CNPJ.");
    }
  }

  if (erros.length > 0) {
    throw new RequisicaoInvalidaErro("Dados do cliente inválidos.", erros);
  }
  return dados;
}
