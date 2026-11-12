export function validarEmail(email: string) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return regex.test(email);
}

export function somenteNumeros(valor: string) {
  return valor.replace(/\D/g, "");
}

function calcularDigito(base: string, pesoInicial: number) {
  let soma = 0;

  for (let i = 0; i < base.length; i++) {
    soma += Number(base[i]) * (pesoInicial - i);
  }

  const resto = (soma * 10) % 11;

  return resto === 10 ? 0 : resto;
}

export function validarCpf(cpf: string) {
  const numeros = somenteNumeros(cpf);

  if (numeros.length !== 11) {
    return false;
  }

  if (/^(\d)\1{10}$/.test(numeros)) {
    return false;
  }

  const digito1 = calcularDigito(numeros.slice(0, 9), 10);
  const digito2 = calcularDigito(numeros.slice(0, 10), 11);

  return digito1 === Number(numeros[9]) && digito2 === Number(numeros[10]);
}

export const REGEX_SENHA = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/;

export const REGEX_NOME = /^[A-Za-zÀ-ÖØ-öø-ÿ]+(?:[ '-][A-Za-zÀ-ÖØ-öø-ÿ]+)*$/;

export const REGEX_TEXTO = /^[A-Za-zÀ-ÖØ-öø-ÿ0-9][A-Za-zÀ-ÖØ-öø-ÿ0-9 .,-]*$/;

export const REGEX_CODIGO = /^[A-Za-z0-9_-]+$/;

export function validarNome(nome: string) {
  return REGEX_NOME.test(nome.trim());
}

export function validarCodigo(codigo: string) {
  return REGEX_CODIGO.test(codigo.trim());
}

export function validarTexto(texto: string) {
  return REGEX_TEXTO.test(texto.trim());
}

function calcularDigitoCnpj(base: string, pesos: number[]) {
  let soma = 0;

  for (let i = 0; i < pesos.length; i++) {
    soma += Number(base[i]) * pesos[i];
  }

  const resto = soma % 11;

  return resto < 2 ? 0 : 11 - resto;
}

export function validarCnpj(cnpj: string) {
  const numeros = somenteNumeros(cnpj);

  if (numeros.length !== 14) {
    return false;
  }

  if (/^(\d)\1{13}$/.test(numeros)) {
    return false;
  }

  const digito1 = calcularDigitoCnpj(numeros.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const digito2 = calcularDigitoCnpj(numeros.slice(0, 13), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);

  return digito1 === Number(numeros[12]) && digito2 === Number(numeros[13]);
}