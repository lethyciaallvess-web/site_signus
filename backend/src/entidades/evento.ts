import { normalizarTextoOpcional } from "../utils/validacoes";
import { EntidadeBase, type EstadoBase } from "./entidade-base";
import { RequisicaoInvalidaErro } from "../erros/erros-http";
import { Cliente } from "./cliente";
import { Plano } from "./plano";
import { Usuario } from "./usuario";

export enum StatusEvento {
  ORCAMENTO = "ORCAMENTO",
  CONFIRMADO = "CONFIRMADO",
  EM_PREPARACAO = "EM_PREPARACAO",
  CONCLUIDO = "CONCLUIDO",
  CANCELADO = "CANCELADO",
}

export interface EstadoEvento {
  clienteId: number;
  planoId: number | null;
  criadoPorUsuarioId: number;
  nome: string;
  dataInicio: Date;
  dataFim: Date;
  localEvento: string;
  status: StatusEvento;
  valorNegociado: number | null;
  observacoes: string | null;
}

export class Evento extends EntidadeBase {
  private static readonly TRANSICOES: Record<StatusEvento, readonly StatusEvento[]> = {
    [StatusEvento.ORCAMENTO]: [StatusEvento.CONFIRMADO, StatusEvento.CANCELADO],
    [StatusEvento.CONFIRMADO]: [StatusEvento.EM_PREPARACAO, StatusEvento.CANCELADO],
    [StatusEvento.EM_PREPARACAO]: [StatusEvento.CONCLUIDO, StatusEvento.CANCELADO],
    [StatusEvento.CONCLUIDO]: [],
    [StatusEvento.CANCELADO]: [],
  };

  private _clienteId!: number;

  get clienteId(): number {
    return Number(this._clienteId);
  }

  private _cliente: Cliente | null = null;

  get cliente(): Cliente | null {
    return this._cliente;
  }

  private _planoId: number | null = null;

  get planoId(): number | null {
    return this._planoId === null ? null : Number(this._planoId);
  }

  /** Troca o cliente e o plano mantendo a chave estrangeira e a relação sincronizadas. */
  vincular(cliente: Cliente, plano: Plano | null): void {
    this._cliente = cliente;
    this._clienteId = cliente.id;
    this._plano = plano;
    this._planoId = plano?.id ?? null;
  }

  private _plano: Plano | null = null;

  get plano(): Plano | null {
    return this._plano;
  }

  private _criadoPorUsuarioId!: number;

  get criadoPorUsuarioId(): number {
    return this._criadoPorUsuarioId;
  }

  private _criadoPor: Usuario | null = null;

  get criadoPor(): Usuario | null {
    return this._criadoPor;
  }

  private _nome!: string;

  get nome(): string {
    return this._nome;
  }

  set nome(valor: string) {
    if (typeof valor !== "string") {
      throw new RequisicaoInvalidaErro("O nome deve ser um texto.");
    }
    const limpo = valor.trim();
    if (limpo.length < 3 || limpo.length > 180) {
      throw new RequisicaoInvalidaErro("O nome deve ter entre 3 e 180 caracteres.");
    }
    this._nome = limpo;
  }

  private _dataInicio!: Date;

  private _dataFim!: Date;

  get dataInicio(): Date {
    return this._dataInicio ? new Date(this._dataInicio.getTime()) : this._dataInicio;
  }

  get dataFim(): Date {
    return this._dataFim ? new Date(this._dataFim.getTime()) : this._dataFim;
  }

  definirPeriodo(inicio: Date, fim: Date): void {
    if (!(inicio instanceof Date) || !(fim instanceof Date) ||
        !Number.isFinite(inicio.getTime()) || !Number.isFinite(fim.getTime()) ||
        fim.getTime() < inicio.getTime()) {
      throw new RequisicaoInvalidaErro("Informe datas válidas, com o fim igual ou posterior ao início.");
    }
    this._dataInicio = new Date(inicio.getTime());
    this._dataFim = new Date(fim.getTime());
  }

  private _localEvento!: string;

  get localEvento(): string {
    return this._localEvento;
  }

  set localEvento(valor: string) {
    if (typeof valor !== "string") {
      throw new RequisicaoInvalidaErro("O local do evento deve ser um texto.");
    }
    const limpo = valor.trim();
    if (limpo.length < 3 || limpo.length > 255) {
      throw new RequisicaoInvalidaErro("O local do evento deve ter entre 3 e 255 caracteres.");
    }
    this._localEvento = limpo;
  }

  private _status: StatusEvento = StatusEvento.ORCAMENTO;

  get status(): StatusEvento {
    return this._status;
  }

  set status(valor: StatusEvento) {
    if (!Object.values(StatusEvento).includes(valor)) {
      throw new RequisicaoInvalidaErro("Status de evento inválido.");
    }
    if (valor !== this._status && !Evento.TRANSICOES[this._status].includes(valor)) {
      throw new RequisicaoInvalidaErro(`Não é possível mudar de ${this._status} para ${valor}.`);
    }
    this._status = valor;
  }

  private _valorNegociado: number | null = null;

  get valorNegociado(): number | null {
    return this._valorNegociado;
  }

  set valorNegociado(valor: number | null) {
    if (valor !== null && (!Number.isFinite(valor) || valor < 0)) {
      throw new RequisicaoInvalidaErro("O valor negociado deve ser um número não negativo ou nulo.");
    }
    this._valorNegociado = valor;
  }

  private _observacoes: string | null = null;

  get observacoes(): string | null {
    return this._observacoes;
  }

  set observacoes(valor: string | null) {
    this._observacoes = normalizarTextoOpcional(valor, "As observações", 2000);
  }

  constructor(dados?: {
    cliente: Cliente;
    criadoPor: Usuario;
    nome: string;
    inicio: Date;
    fim: Date;
    localEvento: string;
    plano?: Plano | null;
  }) {
    super();
    if (dados !== undefined) {
      this.vincular(dados.cliente, dados.plano ?? null);
      this._criadoPor = dados.criadoPor;
      this._criadoPorUsuarioId = dados.criadoPor.id;
      this.nome = dados.nome;
      this.definirPeriodo(dados.inicio, dados.fim);
      this.localEvento = dados.localEvento;
    }
  }

  static restaurar(
    estado: EstadoEvento & EstadoBase,
    vinculos: { cliente?: Cliente; plano?: Plano | null } = {},
  ): Evento {
    const evento = new Evento();
    evento.restaurarBase(estado);
    evento._criadoPorUsuarioId = estado.criadoPorUsuarioId;
    evento._clienteId = estado.clienteId;
    evento._planoId = estado.planoId;
    evento._cliente = vinculos.cliente ?? null;
    evento._plano = vinculos.plano ?? null;
    evento._nome = estado.nome;
    evento._dataInicio = estado.dataInicio;
    evento._dataFim = estado.dataFim;
    evento._localEvento = estado.localEvento;
    evento._status = estado.status;
    evento._valorNegociado = estado.valorNegociado;
    evento._observacoes = estado.observacoes;
    return evento;
  }

  paraPersistencia(): EstadoEvento {
    return {
      clienteId: this._clienteId,
      planoId: this._planoId,
      criadoPorUsuarioId: this._criadoPorUsuarioId,
      nome: this._nome,
      dataInicio: this._dataInicio,
      dataFim: this._dataFim,
      localEvento: this._localEvento,
      status: this._status,
      valorNegociado: this._valorNegociado,
      observacoes: this._observacoes,
    };
  }
}
