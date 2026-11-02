import { RequisicaoInvalidaErro } from "../erros/erros-http";

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function emailValido(email: string): boolean {
  return email.length <= 255 && REGEX_EMAIL.test(email);
}
export function normalizarTextoOpcional(
  valor: string | null,
  rotulo: string,
  limite: number,
): string | null {
  if (valor === null) return null;
  if (typeof valor !== "string") {
    throw new RequisicaoInvalidaErro(`${rotulo} deve ser um texto ou nulo.`);
  }
  const limpo = valor.trim();
  if (limpo.length === 0) return null;
  if (limpo.length > limite) {
    throw new RequisicaoInvalidaErro(`${rotulo} deve ter no máximo ${limite} caracteres.`);
  }
  return limpo;
}
