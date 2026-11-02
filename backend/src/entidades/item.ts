import { Column, Entity } from "typeorm";
import { EntidadeBase } from "./entidade-base";
import { RequisicaoInvalidaErro } from "../erros/erros-http";

@Entity({ name: "itens" })
export class Item extends EntidadeBase {
  @Column({ name: "codigo", type: "varchar", length: 50, unique: true })
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

  @Column({ name: "nome", type: "varchar", length: 150 })
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

  @Column({ name: "categoria", type: "varchar", length: 80 })
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

  @Column({ name: "quantidade_total", type: "int", unsigned: true, default: 0 })
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

  @Column({ type: "text", nullable: true })
  descricao: string | null = null;

  @Column({ type: "boolean", default: true })
  ativo: boolean = true;

  @Column({ type: "varchar", length: 255, nullable: true })
  imagem: string | null = null;
}