import { Column, Entity } from "typeorm";
import { EntidadeBase } from "./entidade-base";
import { RequisicaoInvalidaErro } from "../erros/erros-http";
import { transformadorDecimal } from "../utils/transformador-decimal";

@Entity({ name: "planos" })
export class Plano extends EntidadeBase {
  @Column({ name: "nome", type: "varchar", length: 80, unique: true })
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

  @Column({ type: "text", nullable: true })
  descricao: string | null = null;

  @Column({
    name: "valor_base",
    type: "decimal",
    precision: 12,
    scale: 2,
    nullable: true,
    transformer: transformadorDecimal,
  })
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

  @Column({ type: "boolean", default: true })
  ativo: boolean = true;
}