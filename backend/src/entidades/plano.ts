import { normalizarTextoOpcional } from "../utils/validacoes";
import { EntidadeBase, type EstadoBase } from "./entidade-base";
import { RequisicaoInvalidaErro } from "../erros/erros-http";

export interface EstadoPlano {
  nome: string;
  descricao: string | null;
  valorBase: number | null;
  ativo: boolean;
}

export class Plano extends EntidadeBase {
  private _nome!: string;

  get nome(): string {
    return this._nome;
  }

  set nome(valor: string) {
    if (typeof valor !== "string") {
      throw new RequisicaoInvalidaErro("O nome deve ser um texto.");
    }
    const limpo = valor.trim();
    if (limpo.length < 3 || limpo.length > 80) {
      throw new RequisicaoInvalidaErro("O nome deve ter entre 3 e 80 caracteres.");
    }
    this._nome = limpo;
  }

  private _descricao: string | null = null;

  get descricao(): string | null {
    return this._descricao;
  }

  set descricao(valor: string | null) {
    this._descricao = normalizarTextoOpcional(valor, "A descrição", 2000);
  }

  private _valorBase: number | null = null;

  get valorBase(): number | null {
    return this._valorBase;
  }

  set valorBase(valor: number | null) {
    if (valor !== null && (!Number.isFinite(valor) || valor < 0)) {
      throw new RequisicaoInvalidaErro("O valor base deve ser um número não negativo ou nulo.");
    }
    this._valorBase = valor;
  }

  private _ativo: boolean = true;

  get ativo(): boolean {
    return this._ativo;
  }

  ativar(): void {
    this._ativo = true;
  }

  desativar(): void {
    this._ativo = false;
  }

  constructor(dados?: {
    nome: string;
    descricao?: string | null;
    valorBase?: number | null;
  }) {
    super();
    if (dados !== undefined) {
      this.nome = dados.nome;
      this.descricao = dados.descricao ?? null;
      this.valorBase = dados.valorBase ?? null;
    }
  }

  static restaurar(estado: EstadoPlano & EstadoBase): Plano {
    const plano = new Plano();
    plano.restaurarBase(estado);
    plano._nome = estado.nome;
    plano._descricao = estado.descricao;
    plano._valorBase = estado.valorBase;
    plano._ativo = estado.ativo;
    return plano;
  }

  paraPersistencia(): EstadoPlano {
    return {
      nome: this._nome,
      descricao: this._descricao,
      valorBase: this._valorBase,
      ativo: this._ativo,
    };
  }
}
