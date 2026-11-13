import { RequisicaoInvalidaErro } from "../erros/erros-http";

export interface Pagina<T> {
  dados: T[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

export interface ParametrosPaginacao {
  pagina: number;
  limite: number;
  busca?: string;
}

const LIMITE_PADRAO = 10;
const LIMITE_MAXIMO = 50;

function lerInteiro(valor: unknown, padrao: number, rotulo: string): number {
  if (valor === undefined || valor === "") return padrao;
  const numero = Number(valor);
  if (!Number.isSafeInteger(numero) || numero < 1) {
    throw new RequisicaoInvalidaErro(`${rotulo} deve ser um número inteiro positivo.`);
  }
  return numero;
}

export function lerPaginacao(query: Record<string, unknown>): ParametrosPaginacao {
  const pagina = lerInteiro(query.pagina, 1, "A página");
  const limite = Math.min(lerInteiro(query.limite, LIMITE_PADRAO, "O limite"), LIMITE_MAXIMO);
  const busca = typeof query.busca === "string" ? query.busca.trim() : "";
  return { pagina, limite, busca: busca || undefined };
}

export function montarPagina<T>(
  dados: T[],
  total: number,
  { pagina, limite }: ParametrosPaginacao,
): Pagina<T> {
  return { dados, total, pagina, limite, totalPaginas: Math.max(1, Math.ceil(total / limite)) };
}

export function lerId(valor: unknown): number {
  const id = Number(valor);
  if (!Number.isSafeInteger(id) || id < 1) {
    throw new RequisicaoInvalidaErro("O identificador deve ser um número inteiro positivo.");
  }
  return id;
}
