import { RequisicaoInvalidaErro } from "../erros/erros-http";
import { lerCorpo } from "./campos-usuario";

export interface DadosItem {
  codigo: string;
  nome: string;
  categoria: string;
  descricao: string | null;
  ativo: boolean;
  quantidadeTotal?: number;
}

function textoObrigatorio(valor: unknown, rotulo: string, erros: string[]): string {
  const texto = typeof valor === "string" ? valor.trim() : "";
  if (texto.length === 0) erros.push(`${rotulo} é obrigatório.`);
  return texto;
}

export function validarDadosItem(corpo: unknown): DadosItem {
  const bruto = lerCorpo(corpo);
  const erros: string[] = [];

  const dados: DadosItem = {
    codigo: textoObrigatorio(bruto.codigo, "O código", erros).toUpperCase(),
    nome: textoObrigatorio(bruto.nome, "O nome", erros),
    categoria: textoObrigatorio(bruto.categoria, "A categoria", erros),
    descricao: typeof bruto.descricao === "string" ? bruto.descricao : null,
    ativo: bruto.ativo === undefined ? true : bruto.ativo === true,
    quantidadeTotal: bruto.quantidadeTotal === undefined ? undefined : Number(bruto.quantidadeTotal),
  };

  if (bruto.ativo !== undefined && typeof bruto.ativo !== "boolean") {
    erros.push("O campo ativo deve ser verdadeiro ou falso.");
  }

  if (erros.length > 0) {
    throw new RequisicaoInvalidaErro("Dados do item inválidos.", erros);
  }
  return dados;
}
