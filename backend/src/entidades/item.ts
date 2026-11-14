import { normalizarTextoOpcional } from "../utils/validacoes";
import { EntidadeBase, type EstadoBase } from "./entidade-base";
import { RequisicaoInvalidaErro } from "../erros/erros-http";

export interface EstadoItem {
  codigo: string;
  nome: string;
  categoria: string;
  quantidadeTotal: number;
  descricao: string | null;
  ativo: boolean;
  imagem: string | null;
}

export class Item extends EntidadeBase {
  private _codigo!: string;

  get codigo(): string {
    return this._codigo;
  }

  set codigo(valor: string) {
    if (typeof valor !== "string") {
      throw new RequisicaoInvalidaErro("O código deve ser um texto.");
    }
    const limpo = valor.trim();
    if (limpo.length < 1 || limpo.length > 50) {
      throw new RequisicaoInvalidaErro("O código deve ter entre 1 e 50 caracteres.");
    }
    this._codigo = limpo;
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
    if (limpo.length < 3 || limpo.length > 150) {
      throw new RequisicaoInvalidaErro("O nome deve ter entre 3 e 150 caracteres.");
    }
    this._nome = limpo;
  }

  private _categoria!: string;

  get categoria(): string {
    return this._categoria;
  }

  set categoria(valor: string) {
    if (typeof valor !== "string") {
      throw new RequisicaoInvalidaErro("A categoria deve ser um texto.");
    }
    const limpo = valor.trim();
    if (limpo.length < 3 || limpo.length > 80) {
      throw new RequisicaoInvalidaErro("A categoria deve ter entre 3 e 80 caracteres.");
    }
    this._categoria = limpo;
  }

  private _quantidadeTotal: number = 0;

  get quantidadeTotal(): number {
    return this._quantidadeTotal;
  }

  set quantidadeTotal(valor: number) {
    if (!Number.isSafeInteger(valor) || valor < 0) {
      throw new RequisicaoInvalidaErro("A quantidade deve ser um número inteiro não negativo.");
    }
    this._quantidadeTotal = valor;
  }

  private _descricao: string | null = null;

  get descricao(): string | null {
    return this._descricao;
  }

  set descricao(valor: string | null) {
    this._descricao = normalizarTextoOpcional(valor, "A descrição", 2000);
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

  private _imagem: string | null = null;

  get imagem(): string | null {
    return this._imagem;
  }

  set imagem(valor: string | null) {
    this._imagem = normalizarTextoOpcional(valor, "O caminho da imagem", 255);
  }

  constructor(dados?: {
    codigo: string;
    nome: string;
    categoria: string;
    quantidadeTotal?: number;
  }) {
    super();
    if (dados !== undefined) {
      this.codigo = dados.codigo;
      this.nome = dados.nome;
      this.categoria = dados.categoria;
      this.quantidadeTotal = dados.quantidadeTotal ?? 0;
    }
  }

  static restaurar(estado: EstadoItem & EstadoBase): Item {
    const item = new Item();
    item.restaurarBase(estado);
    item._codigo = estado.codigo;
    item._nome = estado.nome;
    item._categoria = estado.categoria;
    item._quantidadeTotal = estado.quantidadeTotal;
    item._descricao = estado.descricao;
    item._ativo = estado.ativo;
    item._imagem = estado.imagem;
    return item;
  }

  paraPersistencia(): EstadoItem {
    return {
      codigo: this._codigo,
      nome: this._nome,
      categoria: this._categoria,
      quantidadeTotal: this._quantidadeTotal,
      descricao: this._descricao,
      ativo: this._ativo,
      imagem: this._imagem,
    };
  }
}
