import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { EntidadeBase } from "./entidade-base";
import { RequisicaoInvalidaErro } from "../erros/erros-http";
import { Cliente } from "./cliente";
import { Plano } from "./plano";
import { Usuario } from "./usuario";
import { transformadorDecimal } from "../utils/transformador-decimal";

export enum StatusEvento {
  ORCAMENTO = "ORCAMENTO",
  CONFIRMADO = "CONFIRMADO",
  EM_PREPARACAO = "EM_PREPARACAO",
  CONCLUIDO = "CONCLUIDO",
  CANCELADO = "CANCELADO",
}

@Entity({ name: "eventos" })
export class Evento extends EntidadeBase {
  private static readonly TRANSICOES: Record<StatusEvento, readonly StatusEvento[]> = {
    [StatusEvento.ORCAMENTO]: [StatusEvento.CONFIRMADO, StatusEvento.CANCELADO],
    [StatusEvento.CONFIRMADO]: [StatusEvento.EM_PREPARACAO, StatusEvento.CANCELADO],
    [StatusEvento.EM_PREPARACAO]: [StatusEvento.CONCLUIDO, StatusEvento.CANCELADO],
    [StatusEvento.CONCLUIDO]: [],
    [StatusEvento.CANCELADO]: [],
  };

  @Column({ name: "cliente_id", type: "bigint", unsigned: true })
  readonly clienteId!: number;

  @ManyToOne(() => Cliente, { onUpdate: "CASCADE" })
  @JoinColumn({ name: "cliente_id" })
  cliente!: Cliente;

  @Column({ name: "plano_id", type: "bigint", unsigned: true, nullable: true })
  readonly planoId: number | null = null;

  @ManyToOne(() => Plano, { nullable: true, onUpdate: "CASCADE" })
  @JoinColumn({ name: "plano_id" })
  plano: Plano | null = null;

  @Column({ name: "criado_por_usuario_id", type: "bigint", unsigned: true })
  readonly criadoPorUsuarioId!: number;

  @ManyToOne(() => Usuario, { onUpdate: "CASCADE" })
  @JoinColumn({ name: "criado_por_usuario_id" })
  criadoPor!: Usuario;

  @Column({ name: "nome", type: "varchar", length: 180 })
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

  @Column({ name: "data_inicio", type: "datetime" })
  private _dataInicio!: Date;

  @Column({ name: "data_fim", type: "datetime" })
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

  @Column({ name: "local_evento", type: "varchar", length: 255 })
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

  @Column({ name: "status", type: "enum", enum: StatusEvento, default: StatusEvento.ORCAMENTO })
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

  @Column({
    name: "valor_negociado",
    type: "decimal",
    precision: 12,
    scale: 2,
    nullable: true,
    transformer: transformadorDecimal,
  })
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

  @Column({ type: "text", nullable: true })
  observacoes: string | null = null;
}