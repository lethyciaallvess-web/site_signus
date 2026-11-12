import type { ChangeEvent } from "react";
import "./Select.css";

type Opcao = {
    valor: string;
    texto: string;
};

type SelectProps = {
    rotulo: string;
    value: string;
    onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
    opcoes: Opcao[];
    textoVazio?: string;
    erro?: string;
    disabled?: boolean;
    obrigatorio?: boolean;
};

export function Select({
    rotulo,
    value,
    onChange,
    opcoes,
    textoVazio,
    erro,
    disabled,
    obrigatorio,
}: SelectProps) {
    return (
        <div className="form-field">
            <select
                aria-label={rotulo}
                aria-required={obrigatorio}
                aria-invalid={erro ? true : undefined}
                value={value}
                onChange={onChange}
                disabled={disabled}
            >
                {textoVazio !== undefined && (
                    <option value="">{obrigatorio ? `${textoVazio} *` : textoVazio}</option>
                )}
                {opcoes.map((opcao) => (
                    <option key={opcao.valor} value={opcao.valor}>
                        {opcao.texto}
                    </option>
                ))}
            </select>
            {erro && <span className="field-error">{erro}</span>}
        </div>
    );
}