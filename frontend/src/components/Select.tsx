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
};

export function Select({ rotulo, value, onChange, opcoes, textoVazio, erro, disabled }: SelectProps) {
    return (
        <div className="form-field">
            <select aria-label={rotulo} value={value} onChange={onChange} disabled={disabled}>
                {textoVazio !== undefined && <option value="">{textoVazio}</option>}
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