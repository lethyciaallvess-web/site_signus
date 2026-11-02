import bcrypt from "bcrypt";
import { RequisicaoInvalidaErro } from "../erros/erros-http";

export class Senha {
    private static readonly REGEX_FORTE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/;
    private static readonly RODADAS_BCRYPT = 12;

    private readonly texto: string;

    constructor(texto: string) {
        const erros = Senha.validar(texto);

        if (erros.length > 0) {
            throw new RequisicaoInvalidaErro("Senha inválida.", erros);
        }

        this.texto = texto;
    }

    public static validar = (texto: unknown): string[] => {
        if (typeof texto !== "string") {
            return ["A senha deve ser um texto."];
        }

        const erros: string[] = [];

        if (texto.length < 8) {
            erros.push("A senha deve possuir pelo menos 8 caracteres.");
        }

        if (texto.length > 72) {
            erros.push("A senha deve possuir no máximo 72 caracteres.");
        }

        if (!Senha.REGEX_FORTE.test(texto)) {
            erros.push(
                "A senha deve possuir letra maiúscula, minúscula, número e caractere especial."
            );
        }

        return erros;
    };

    public gerarHash = (): Promise<string> => {
        return bcrypt.hash(this.texto, Senha.RODADAS_BCRYPT);
    };
}
