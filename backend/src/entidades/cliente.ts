import { EntidadeBase, type EstadoBase } from "./entidade-base";
import { RequisicaoInvalidaErro } from "../erros/erros-http";
import { emailValido, normalizarTextoOpcional } from "../utils/validacoes";
import { Cpf } from "../dominio/cpf";
import { Cnpj } from "../dominio/cnpj";

export enum TipoPessoa {
  FISICA = "FISICA",
  JURIDICA = "JURIDICA",
}

export interface EstadoCliente {
  tipoPessoa: TipoPessoa;
  nome: string;
  documento: string;
  email: string;
  telefone: string;
  observacoes: string | null;
}

export class Cliente extends EntidadeBase {
  private _tipoPessoa: TipoPessoa = TipoPessoa.FISICA;

  get tipoPessoa(): TipoPessoa {
    return this._tipoPessoa;
  }


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

  private _documento!: string;

  get documento(): string {
    return this._documento;
  }

  set documento(valor: string) {
    if (typeof valor !== "string") {
      throw new RequisicaoInvalidaErro("O documento deve ser um texto.");
    }
    if (Cnpj.somenteNumeros(valor).length === 14) {
      this._documento = new Cnpj(valor).numeros;
      this._tipoPessoa = TipoPessoa.JURIDICA;
      return;
    }
    this._documento = new Cpf(valor).numeros;
    this._tipoPessoa = TipoPessoa.FISICA;
  }

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

  private _observacoes: string | null = null;

  get observacoes(): string | null {
    return this._observacoes;
  }

  set observacoes(valor: string | null) {
    this._observacoes = normalizarTextoOpcional(valor, "As observações", 2000);
  }

  constructor(dados?: { nome: string; email: string; documento: string }) {
    super();
    if (dados !== undefined) {
      this.nome = dados.nome;
      this.email = dados.email;
      this.documento = dados.documento;
    }
  }

  static restaurar(estado: EstadoCliente & EstadoBase): Cliente {
    const cliente = new Cliente();
    cliente.restaurarBase(estado);
    cliente._tipoPessoa = estado.tipoPessoa;
    cliente._nome = estado.nome;
    cliente._documento = estado.documento;
    cliente._email = estado.email;
    cliente._telefone = estado.telefone;
    cliente._observacoes = estado.observacoes;
    return cliente;
  }

  paraPersistencia(): EstadoCliente {
    return {
      tipoPessoa: this._tipoPessoa,
      nome: this._nome,
      documento: this._documento,
      email: this._email,
      telefone: this._telefone,
      observacoes: this._observacoes,
    };
  }
}
