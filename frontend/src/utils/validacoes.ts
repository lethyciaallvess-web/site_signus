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

  // rejeita 111.111.111-11, 000.000.000-00 etc.
  if (/^(\d)\1{10}$/.test(numeros)) {
    return false;
  }

  const digito1 = calcularDigito(numeros.slice(0, 9), 10);
  const digito2 = calcularDigito(numeros.slice(0, 10), 11);

  return digito1 === Number(numeros[9]) && digito2 === Number(numeros[10]);
}

export const REGEX_SENHA = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/;