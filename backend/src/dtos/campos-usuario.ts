import { Cnpj } from "../dominio/cnpj";
import { Cpf } from "../dominio/cpf";
import { Senha } from "../dominio/senha";
import { emailValido } from "../utils/validacoes";

export function lerCorpo(corpo: unknown): Record<string, unknown> {
  return typeof corpo === "object" && corpo !== null
    ? (corpo as Record<string, unknown>)
    : {};
}

export function validarNome(valor: unknown, erros: string[]): string {
  const nome = typeof valor === "string" ? valor.trim() : "";
  if (nome.length === 0) {
    erros.push("O nome é obrigatório.");
  } else if (nome.length < 3) {
    erros.push("O nome deve ter pelo menos 3 caracteres.");
  } else if (nome.length > 150) {
    erros.push("O nome deve ter no máximo 150 caracteres.");
  }
  return nome;
}

export function validarEmail(valor: unknown, erros: string[]): string {
  const email = typeof valor === "string" ? valor.trim().toLowerCase() : "";
  if (!emailValido(email)) {
    erros.push("Informe um e-mail válido.");
  }
  return email;
}

export function validarCpf(valor: unknown, erros: string[]): string {
  const cpf = typeof valor === "string" ? Cpf.somenteNumeros(valor) : "";
  if (cpf.length === 0) {
    erros.push("O CPF é obrigatório.");
  } else if (cpf.length !== 11) {
    erros.push("O CPF deve possuir 11 números.");
  } else if (!Cpf.ehValido(cpf)) {
    erros.push("Informe um CPF válido.");
  }
  return cpf;
}

export function validarCnpj(valor: unknown, erros: string[]): string {
  const cnpj = typeof valor === "string" ? Cnpj.somenteNumeros(valor) : "";
  if (cnpj.length === 0) {
    erros.push("O CNPJ é obrigatório.");
  } else if (cnpj.length !== 14) {
    erros.push("O CNPJ deve possuir 14 números.");
  } else if (!Cnpj.ehValido(cnpj)) {
    erros.push("Informe um CNPJ válido.");
  }
  return cnpj;
}

export function validarCnpjOpcional(valor: unknown, erros: string[]): string | null {
  if (valor === undefined || valor === null || valor === "") return null;
  return validarCnpj(valor, erros);
}

export function validarDocumento(valor: unknown, erros: string[]): string {
  const numeros = typeof valor === "string" ? Cnpj.somenteNumeros(valor) : "";
  if (numeros.length === 14) return validarCnpj(numeros, erros);
  if (numeros.length === 0) {
    erros.push("O CPF ou CNPJ é obrigatório.");
    return numeros;
  }
  return validarCpf(numeros, erros);
}

export function validarSenha(
  senha: unknown,
  confirmacao: unknown,
  erros: string[],
): string {
  const texto = typeof senha === "string" ? senha : "";
  if (texto.length === 0) {
    erros.push("A senha é obrigatória.");
  } else {
    erros.push(...Senha.validar(texto));
  }

  if (confirmacao !== senha) {
    erros.push("A confirmação de senha deve ser igual à senha.");
  }
  return texto;
}
