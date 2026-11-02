import { Column, Entity } from "typeorm";
import { EntidadeBase } from "./entidade-base";
import { RequisicaoInvalidaErro } from "../erros/erros-http";
import { emailValido, normalizarTextoOpcional } from "../utils/validacoes";
import { Cpf } from "../dominio/cpf";

export enum TipoPessoa {
  FISICA = "FISICA",
}

@Entity({ name: "clientes" })
export class Cliente extends EntidadeBase {
  @Column({
    name: "tipo_pessoa",
    type: "enum",
    enum: TipoPessoa,
    default: TipoPessoa.FISICA,
  })
  private _tipoPessoa: TipoPessoa = TipoPessoa.FISICA;

  get tipoPessoa(): TipoPessoa {
    return this._tipoPessoa;
  }


  @Column({ name: "nome", type: "varchar", length: 180 })
  private _nome!: string;

  get nome(): string {
    return this._nome;
  }

  set nome(valor: string) {
    const limpo = valor.trim();

    if (limpo.length < 3 || limpo.length > 180) {
      throw new RequisicaoInvalidaErro(
        "O nome do cliente deve ter entre 3 e 180 caracteres.",
      );
    }

    this._nome = limpo;
  }

  @Column({ name: "documento", type: "varchar", length: 14, unique: true })
  private _documento!: string;

  get documento(): string {
    return this._documento;
  }

  set documento(valor: string) {
    this._documento = new Cpf(valor).numeros;
  }

  @Column({ name: "email", type: "varchar", length: 255 })
  private _email!: string;

  get email(): string {
    return this._email;
  }

  set email(valor: string) {
    const limpo = valor.trim().toLowerCase();

    if (!emailValido(limpo)) {
      throw new RequisicaoInvalidaErro("Informe um e-mail válido.");
    }

    this._email = limpo;
  }

  @Column({ name: "telefone", type: "varchar", length: 20 })
  private _telefone: string = "";

  get telefone(): string {
    return this._telefone;
  }

  set telefone(valor: string) {
    const limpo = valor.trim();

    if (limpo.length > 20) {
      throw new RequisicaoInvalidaErro(
        "O telefone deve ter no máximo 20 caracteres.",
      );
    }

    this._telefone = limpo;
  }

  @Column({ name: "observacoes", type: "text", nullable: true })
  private _observacoes: string | null = null;

  get observacoes(): string | null {
    return this._observacoes;
  }

  set observacoes(valor: string | null) {
    this._observacoes = normalizarTextoOpcional(valor, "As observações", 2000);
  }

  constructor(dados?: { nome: string; email: string; cpf: string }) {
    super();
    if (dados !== undefined) {
      this.nome = dados.nome;
      this.email = dados.email;
      this.documento = dados.cpf;
    }
  }
}
