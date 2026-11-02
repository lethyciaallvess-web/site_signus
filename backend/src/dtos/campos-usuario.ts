import {
  cpfValido,
  emailValido,
  senhaForte,
  somenteNumeros,
} from "../utils/validacoes";

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
  const cpf = typeof valor === "string" ? somenteNumeros(valor) : "";
  if (cpf.length === 0) {
    erros.push("O CPF é obrigatório.");
  } else if (cpf.length !== 11) {
    erros.push("O CPF deve possuir 11 números.");
  } else if (!cpfValido(cpf)) {
    erros.push("Informe um CPF válido.");
  }
  return cpf;
}

export function validarSenha(
  senha: unknown,
  confirmacao: unknown,
  erros: string[],
): string {
  const texto = typeof senha === "string" ? senha : "";
  if (texto.length === 0) {
    erros.push("A senha é obrigatória.");
  } else if (texto.length < 8) {
    erros.push("A senha deve ter pelo menos 8 caracteres.");
  } else if (texto.length > 72) {
    erros.push("A senha deve ter no máximo 72 caracteres.");
  } else if (!senhaForte(texto)) {
    erros.push(
      "A senha deve possuir letra maiúscula, minúscula, número e caractere especial.",
    );
  }

  if (confirmacao !== senha) {
    erros.push("A confirmação de senha deve ser igual à senha.");
  }
  return texto;
}