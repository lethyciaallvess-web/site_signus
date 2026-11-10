import { StatusEvento } from "../entidades/evento";
import { RequisicaoInvalidaErro } from "../erros/erros-http";
import { lerCorpo } from "./campos-usuario";

export interface DadosEvento {
  nome: string;
  localEvento: string;
  clienteId: number;
  planoId: number | null;
  dataInicio: Date;
  dataFim: Date;
  valorNegociado: number | null;
  observacoes: string | null;
  status?: StatusEvento;
  itensExtras: { itemId: number; quantidade: number }[];
}

function lerData(valor: unknown, rotulo: string, erros: string[]): Date {
  const data = typeof valor === "string" && valor !== "" ? new Date(valor) : new Date(NaN);
  if (Number.isNaN(data.getTime())) erros.push(`${rotulo} é obrigatória e deve ser válida.`);
  return data;
}

function lerItens(valor: unknown, erros: string[]): DadosEvento["itensExtras"] {
  if (valor === undefined || valor === null) return [];
  if (!Array.isArray(valor)) {
    erros.push("Os itens extras devem ser uma lista.");
    return [];
  }
  const vistos = new Set<number>();
  const itens: DadosEvento["itensExtras"] = [];
  for (const bruto of valor) {
    const itemId = Number((bruto as Record<string, unknown>)?.itemId);
    const quantidade = Number((bruto as Record<string, unknown>)?.quantidade);
    if (!Number.isSafeInteger(itemId) || itemId < 1) {
      erros.push("Cada item extra precisa de um itemId válido.");
    } else if (!Number.isSafeInteger(quantidade) || quantidade < 1) {
      erros.push("A quantidade de cada item extra deve ser um inteiro maior que zero.");
    } else if (vistos.has(itemId)) {
      erros.push("Um mesmo item não pode aparecer duas vezes no evento.");
    } else {
      vistos.add(itemId);
      itens.push({ itemId, quantidade });
    }
  }
  return itens;
}

export function validarDadosEvento(corpo: unknown): DadosEvento {
  const bruto = lerCorpo(corpo);
  const erros: string[] = [];

  const nome = typeof bruto.nome === "string" ? bruto.nome.trim() : "";
  if (nome.length === 0) erros.push("O nome é obrigatório.");

  const localEvento = typeof bruto.localEvento === "string" ? bruto.localEvento.trim() : "";
  if (localEvento.length === 0) erros.push("O local do evento é obrigatório.");

  const clienteId = Number(bruto.clienteId);
  if (!Number.isSafeInteger(clienteId) || clienteId < 1) erros.push("Selecione um cliente.");

  let planoId: number | null = null;
  if (bruto.planoId !== undefined && bruto.planoId !== null && bruto.planoId !== "") {
    planoId = Number(bruto.planoId);
    if (!Number.isSafeInteger(planoId) || planoId < 1) erros.push("Plano inválido.");
  }

  let valorNegociado: number | null = null;
  if (bruto.valorNegociado !== undefined && bruto.valorNegociado !== null && bruto.valorNegociado !== "") {
    valorNegociado = Number(bruto.valorNegociado);
    if (!Number.isFinite(valorNegociado) || valorNegociado < 0) {
      erros.push("O valor negociado deve ser um número não negativo.");
    }
  }

  let status: StatusEvento | undefined;
  if (bruto.status !== undefined) {
    if (!Object.values(StatusEvento).includes(bruto.status as StatusEvento)) {
      erros.push("Status de evento inválido.");
    } else {
      status = bruto.status as StatusEvento;
    }
  }

  const dados: DadosEvento = {
    nome,
    localEvento,
    clienteId,
    planoId,
    dataInicio: lerData(bruto.dataInicio, "A data de início", erros),
    dataFim: lerData(bruto.dataFim, "A data de fim", erros),
    valorNegociado,
    observacoes: typeof bruto.observacoes === "string" ? bruto.observacoes : null,
    status,
    itensExtras: lerItens(bruto.itensExtras, erros),
  };

  if (erros.length > 0) {
    throw new RequisicaoInvalidaErro("Dados do evento inválidos.", erros);
  }
  return dados;
}
