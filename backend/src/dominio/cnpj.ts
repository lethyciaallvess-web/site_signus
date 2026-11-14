import { RequisicaoInvalidaErro } from "../erros/erros-http";

export class Cnpj {
    private static readonly PESOS_PRIMEIRO = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    private static readonly PESOS_SEGUNDO = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    private readonly digitos: string;

    constructor(entrada: string) {
        if (!Cnpj.ehValido(entrada)) {
            throw new RequisicaoInvalidaErro("Informe um CNPJ válido.");
        }

        this.digitos = Cnpj.somenteNumeros(entrada);
    }

    public get numeros(): string {
        return this.digitos;
    }

    public get formatado(): string {
        return this.digitos.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
    }

    public static somenteNumeros = (entrada: string): string => {
        return entrada.replace(/\D/g, "");
    };

    public static ehValido = (entrada: unknown): boolean => {
        if (typeof entrada !== "string") {
            return false;
        }

        const numeros = Cnpj.somenteNumeros(entrada);

        if (numeros.length !== 14) {
            return false;
        }

        if (/^(\d)\1{13}$/.test(numeros)) {
            return false;
        }

        const digito1 = Cnpj.calcularDigito(numeros.slice(0, 12), Cnpj.PESOS_PRIMEIRO);
        const digito2 = Cnpj.calcularDigito(numeros.slice(0, 13), Cnpj.PESOS_SEGUNDO);

        return digito1 === Number(numeros[12]) && digito2 === Number(numeros[13]);
    };

    protected static calcularDigito = (base: string, pesos: readonly number[]): number => {
        let soma = 0;

        for (let i = 0; i < base.length; i++) {
            soma += Number(base[i]) * pesos[i];
        }

        const resto = soma % 11;
        return resto < 2 ? 0 : 11 - resto;
    };
}
