import { Column, Entity } from "typeorm";
import { EntidadeBase } from "./entidade-base";
import { RequisicaoInvalidaErro } from "../erros/erros-http";
import { Cpf } from "../dominio/cpf";
import { emailValido } from "../utils/validacoes";
import bcrypt from "bcrypt";

export enum PerfilUsuario {
  ADMIN = "ADMIN",
  OPERADOR = "OPERADOR",
  CLIENTE = "CLIENTE",
}

@Entity({ name: "usuarios" })
export class Usuario extends EntidadeBase {
  @Column({ name: "nome", type: "varchar", length: 150 })
  private _nome!: string;

  @Column({ name: "email", type: "varchar", length: 255, unique: true })
  private _email!: string;

  @Column({ name: "cpf", type: "char", length: 11, unique: true })
  private _cpf!: string;

  @Column({ name: "senha_hash", type: "varchar", length: 255, select: false })
  private _senhaHash!: string;

  @Column({
    name: "perfil",
    type: "enum",
    enum: PerfilUsuario,
    default: PerfilUsuario.CLIENTE,
  })
  private _perfil!: PerfilUsuario;

  @Column({
    name: "cliente_id",
    type: "bigint",
    unsigned: true,
    nullable: true,
    unique: true,
  })
  private _clienteId: number | null = null;

  get clienteId(): number | null {
    return this._clienteId;
  }

  vincularCliente(clienteId: number): void {
    if (!Number.isSafeInteger(clienteId) || clienteId <= 0) {
      throw new RequisicaoInvalidaErro(
        "O identificador do cliente deve ser um número inteiro positivo.",
      );
    }

    this._clienteId = clienteId;
    this._perfil = PerfilUsuario.CLIENTE;
  }

  constructor() {
    super();
    this._perfil = PerfilUsuario.CLIENTE;
  }

  static criar(
    nome: string,
    email: string,
    cpf: string,
    senhaHash: string,
  ): Usuario {
    const usuario = new Usuario();
    usuario.nome = nome;
    usuario.email = email;
    usuario.cpf = cpf;
    usuario.definirSenhaHash(senhaHash);
    return usuario;
  }

  get nome(): string {
    return this._nome;
  }

  set nome(valor: string) {
    const limpo = valor.trim();

    if (limpo.length < 3 || limpo.length > 150) {
      throw new RequisicaoInvalidaErro(
        "O nome deve ter entre 3 e 150 caracteres.",
      );
    }

    this._nome = limpo;
  }

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

  get cpf(): string {
    return this._cpf;
  }

  set cpf(valor: string) {
    this._cpf = new Cpf(valor).numeros;
  }

  get perfil(): PerfilUsuario {
    return this._perfil;
  }

  async senhaConfere(texto: string): Promise<boolean> {
    return bcrypt.compare(texto, this._senhaHash);
  }
  
  definirSenhaHash(hash: string): void {
    if (typeof hash !== "string" || hash.trim().length === 0) {
      throw new RequisicaoInvalidaErro("O hash da senha é inválido.");
    }
    this._senhaHash = hash;
  }
}
