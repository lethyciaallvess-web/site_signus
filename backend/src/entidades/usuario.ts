import { EntidadeBase, type EstadoBase } from "./entidade-base";
import { RequisicaoInvalidaErro } from "../erros/erros-http";
import { Cpf } from "../dominio/cpf";
import { Cnpj } from "../dominio/cnpj";
import { emailValido } from "../utils/validacoes";
import bcrypt from "bcrypt";

export enum PerfilUsuario {
  ADMIN = "ADMIN",
  OPERADOR = "OPERADOR",
  CLIENTE = "CLIENTE",
}

export interface EstadoUsuario {
  nome: string;
  email: string;
  cpf: string;
  cnpj: string | null;
  senhaHash?: string;
  perfil: PerfilUsuario;
  clienteId: number | null;
}

export class Usuario extends EntidadeBase {
  private _nome!: string;

  private _email!: string;

  private _cpf!: string;

  private _cnpj: string | null = null;

  private _senhaHash!: string;

  private _perfil!: PerfilUsuario;

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
    cnpj: string | null = null,
  ): Usuario {
    const usuario = new Usuario();
    usuario.nome = nome;
    usuario.email = email;
    usuario.cpf = cpf;
    usuario.cnpj = cnpj;
    usuario.definirSenhaHash(senhaHash);
    return usuario;
  }

  static criarFuncionario(
    nome: string,
    email: string,
    cpf: string,
    senhaHash: string,
    perfil: PerfilUsuario.ADMIN | PerfilUsuario.OPERADOR,
  ): Usuario {
    const usuario = Usuario.criar(nome, email, cpf, senhaHash);
    usuario._perfil = perfil;
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

  get cnpj(): string | null {
    return this._cnpj;
  }

  set cnpj(valor: string | null) {
    this._cnpj = valor === null ? null : new Cnpj(valor).numeros;
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

  static restaurar(estado: EstadoUsuario & EstadoBase): Usuario {
    const usuario = new Usuario();
    usuario.restaurarBase(estado);
    usuario._nome = estado.nome;
    usuario._email = estado.email;
    usuario._cpf = estado.cpf;
    usuario._cnpj = estado.cnpj;
    if (estado.senhaHash !== undefined) usuario._senhaHash = estado.senhaHash;
    usuario._perfil = estado.perfil;
    usuario._clienteId = estado.clienteId;
    return usuario;
  }

  paraPersistencia(): EstadoUsuario {
    const estado: EstadoUsuario = {
      nome: this._nome,
      email: this._email,
      cpf: this._cpf,
      cnpj: this._cnpj,
      perfil: this._perfil,
      clienteId: this._clienteId,
    };
    if (this._senhaHash !== undefined) estado.senhaHash = this._senhaHash;
    return estado;
  }
}
