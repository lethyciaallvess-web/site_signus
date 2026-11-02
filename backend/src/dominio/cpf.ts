import { RequisicaoInvalidaErro } from "../erros/erros-http";

export class Cpf {
    private readonly digitos: string;

    constructor(entrada: string) {
        if (!Cpf.ehValido(entrada)) {
            throw new RequisicaoInvalidaErro("Informe um CPF válido.");
        }

        this.digitos = Cpf.somenteNumeros(entrada);
    }

    public get numeros(): string {
        return this.digitos;
    }

    public get formatado(): string {
        return this.digitos.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
    }

    public static somenteNumeros = (entrada: string): string => {
        return entrada.replace(/\D/g, "");
    };

    public static ehValido = (entrada: unknown): boolean => {
        if (typeof entrada !== "string") {
            return false;
        }

        const numeros = Cpf.somenteNumeros(entrada);

        if (numeros.length !== 11) {
            return false;
        }

        if (/^(\d)\1{10}$/.test(numeros)) {
            return false;
        }

        const digito1 = Cpf.calcularDigito(numeros.slice(0, 9), 10);
        const digito2 = Cpf.calcularDigito(numeros.slice(0, 10), 11);

        return digito1 === Number(numeros[9]) && digito2 === Number(numeros[10]);
    };

    protected static calcularDigito = (base: string, pesoInicial: number): number => {
        let soma = 0;

        for (let i = 0; i < base.length; i++) {
            soma += Number(base[i]) * (pesoInicial - i);
        }

        const resto = (soma * 10) % 11;
        return resto === 10 ? 0 : resto;
    };
}
