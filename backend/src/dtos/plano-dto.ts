import { RequisicaoInvalidaErro } from "../erros/erros-http";
import { lerCorpo } from "./campos-usuario";

export interface ItemDoPlano {
  itemId: number;
  quantidade: number;
}

export interface DadosPlano {
  nome: string;
  descricao: string | null;
  valorBase: number | null;
  ativo: boolean;
  itens: ItemDoPlano[];
}

function lerItens(valor: unknown, erros: string[]): ItemDoPlano[] {
  if (valor === undefined) return [];
  if (!Array.isArray(valor)) {
    erros.push("Os itens devem ser uma lista.");
    return [];
  }
  const vistos = new Set<number>();
  const itens: ItemDoPlano[] = [];
  for (const bruto of valor) {
    const itemId = Number((bruto as Record<string, unknown>)?.itemId);
    const quantidade = Number((bruto as Record<string, unknown>)?.quantidade);
    if (!Number.isSafeInteger(itemId) || itemId < 1) {
      erros.push("Cada item precisa de um itemId válido.");
      continue;
    }
    if (!Number.isSafeInteger(quantidade) || quantidade < 1) {
      erros.push("A quantidade de cada item deve ser um inteiro maior que zero.");
      continue;
    }
    if (vistos.has(itemId)) {
      erros.push("Um mesmo item não pode aparecer duas vezes no plano.");
      continue;
    }
    vistos.add(itemId);
    itens.push({ itemId, quantidade });
  }
  return itens;
}

export function validarDadosPlano(corpo: unknown): DadosPlano {
  const bruto = lerCorpo(corpo);
  const erros: string[] = [];

  const nome = typeof bruto.nome === "string" ? bruto.nome.trim() : "";
  if (nome.length === 0) erros.push("O nome é obrigatório.");

  let valorBase: number | null = null;
  if (bruto.valorBase !== undefined && bruto.valorBase !== null && bruto.valorBase !== "") {
    valorBase = Number(bruto.valorBase);
    if (!Number.isFinite(valorBase) || valorBase < 0) {
      erros.push("O valor base deve ser um número não negativo.");
    }
  }

  if (bruto.ativo !== undefined && typeof bruto.ativo !== "boolean") {
    erros.push("O campo ativo deve ser verdadeiro ou falso.");
  }

  const dados: DadosPlano = {
    nome,
    descricao: typeof bruto.descricao === "string" ? bruto.descricao : null,
    valorBase,
    ativo: bruto.ativo === undefined ? true : bruto.ativo === true,
    itens: lerItens(bruto.itens, erros),
  };

  if (erros.length > 0) {
    throw new RequisicaoInvalidaErro("Dados do plano inválidos.", erros);
  }
  return dados;
}
