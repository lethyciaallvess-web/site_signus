import type { DadosEvento } from "../dtos/evento-dto";
import type { Cliente } from "../entidades/cliente";
import { Evento, type StatusEvento } from "../entidades/evento";
import type { Plano } from "../entidades/plano";
import { NaoAutenticadoErro, RecursoNaoEncontradoErro } from "../erros/erros-http";
import type { ClienteRepositorio } from "../repositorios/cliente-repositorio";
import type { EventoRepositorio, LinhaItemEvento } from "../repositorios/evento-repositorio";
import type { PlanoRepositorio } from "../repositorios/plano-repositorio";
import { montarPagina, type Pagina, type ParametrosPaginacao } from "../utils/paginacao";

export interface EventoPublico {
  id: number;
  nome: string;
  dataInicio: Date;
  dataFim: Date;
  localEvento: string;
  status: StatusEvento;
  valorNegociado: number | null;
  observacoes: string | null;
  clienteId: number;
  planoId: number | null;
  cliente: { id: number; nome: string } | null;
  plano: { id: number; nome: string } | null;
  itensExtras: Omit<LinhaItemEvento, "eventoId">[];
}

function paraPublico(evento: Evento, linhas: LinhaItemEvento[]): EventoPublico {
  const id = Number(evento.id);
  return {
    id,
    nome: evento.nome,
    dataInicio: evento.dataInicio,
    dataFim: evento.dataFim,
    localEvento: evento.localEvento,
    status: evento.status,
    valorNegociado: evento.valorNegociado,
    observacoes: evento.observacoes,
    clienteId: evento.clienteId,
    planoId: evento.planoId,
    cliente: evento.cliente ? { id: Number(evento.cliente.id), nome: evento.cliente.nome } : null,
    plano: evento.plano ? { id: Number(evento.plano.id), nome: evento.plano.nome } : null,
    itensExtras: linhas
      .filter((l) => l.eventoId === id)
      .map(({ itemId, codigo, nome, categoria, quantidade }) => ({
        itemId, codigo, nome, categoria, quantidade,
      })),
  };
}

export class EventoServico {
  constructor(
    private readonly eventos: EventoRepositorio,
    private readonly clientes: ClienteRepositorio,
    private readonly planos: PlanoRepositorio,
  ) {}

  async listar(paginacao: ParametrosPaginacao): Promise<Pagina<EventoPublico>> {
    const [eventos, total] = await this.eventos.listarPaginado(paginacao);
    const linhas = await this.eventos.listarItensExtras(eventos.map((e) => Number(e.id)));
    return montarPagina(eventos.map((e) => paraPublico(e, linhas)), total, paginacao);
  }

  async obter(id: number): Promise<EventoPublico> {
    return this.montar(Number((await this.buscarOuFalhar(id)).id));
  }

  async criar(dados: DadosEvento, usuarioId: number): Promise<EventoPublico> {
    const criadoPor = await this.eventos.buscarUsuario(usuarioId);
    if (!criadoPor) throw new NaoAutenticadoErro("Conta não encontrada. Entre novamente.");
    const { cliente, plano } = await this.carregarVinculos(dados);

    const evento = new Evento({
      cliente,
      plano,
      criadoPor,
      nome: dados.nome,
      inicio: dados.dataInicio,
      fim: dados.dataFim,
      localEvento: dados.localEvento,
    });
    evento.valorNegociado = dados.valorNegociado;
    evento.observacoes = dados.observacoes;

    const salvo = await this.eventos.salvarComItens(evento, dados.itensExtras);
    return this.montar(Number(salvo.id));
  }

  async atualizar(id: number, dados: DadosEvento): Promise<EventoPublico> {
    const evento = await this.buscarOuFalhar(id);
    const { cliente, plano } = await this.carregarVinculos(dados);

    evento.vincular(cliente, plano);
    evento.nome = dados.nome;
    evento.definirPeriodo(dados.dataInicio, dados.dataFim);
    evento.localEvento = dados.localEvento;
    evento.valorNegociado = dados.valorNegociado;
    evento.observacoes = dados.observacoes;
    if (dados.status !== undefined) evento.status = dados.status;

    await this.eventos.salvarComItens(evento, dados.itensExtras);
    return this.montar(id);
  }

  async excluir(id: number): Promise<void> {
    await this.eventos.excluir(await this.buscarOuFalhar(id));
  }

  private async carregarVinculos(dados: DadosEvento): Promise<{ cliente: Cliente; plano: Plano | null }> {
    const cliente = await this.clientes.buscarPorId(dados.clienteId);
    if (!cliente) throw new RecursoNaoEncontradoErro("Cliente não encontrado.");

    let plano: Plano | null = null;
    if (dados.planoId !== null) {
      plano = await this.planos.buscarPorId(dados.planoId);
      if (!plano) throw new RecursoNaoEncontradoErro("Plano não encontrado.");
    }

    const ids = dados.itensExtras.map((i) => i.itemId);
    if ((await this.eventos.contarItensExistentes(ids)) !== ids.length) {
      throw new RecursoNaoEncontradoErro("Um ou mais itens extras não existem.");
    }
    return { cliente, plano };
  }

  private async montar(id: number): Promise<EventoPublico> {
    const evento = await this.buscarOuFalhar(id);
    return paraPublico(evento, await this.eventos.listarItensExtras([id]));
  }

  private async buscarOuFalhar(id: number): Promise<Evento> {
    const evento = await this.eventos.buscarPorId(id);
    if (!evento) throw new RecursoNaoEncontradoErro("Evento não encontrado.");
    return evento;
  }
}
