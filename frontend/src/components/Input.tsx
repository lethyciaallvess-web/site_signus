import { useState } from "react";
import type { ChangeEvent } from "react";
import "./Input.css";

interface InputProps {
  type: string;
  placeholder: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  erro?: string;
  disabled?: boolean;
  obrigatorio?: boolean;
  maxLength?: number;
  inputMode?: "text" | "numeric" | "tel" | "email";
}

export function Input({
  type,
  placeholder,
  value,
  onChange,
  erro,
  disabled,
  obrigatorio,
  maxLength,
  inputMode,
}: InputProps) {
  const [visivel, setVisivel] = useState(false);
  const ehSenha = type === "password";
  const tipoAtual = ehSenha && visivel ? "text" : type;

  return (
    <div className="form-field">
      <div className="form-field-controle">
        <input
          type={tipoAtual}
          placeholder={obrigatorio ? `${placeholder} *` : placeholder}
          aria-label={placeholder}
          aria-required={obrigatorio}
          aria-invalid={erro ? true : undefined}
          value={value}
          onChange={onChange}
          disabled={disabled}
          maxLength={maxLength}
          inputMode={inputMode}
        />
        {ehSenha && (
          <button
            type="button"
            className="form-field-olho"
            onClick={() => setVisivel(!visivel)}
            aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}
            aria-pressed={visivel}
            disabled={disabled}
          >
            {visivel ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
      </div>
      {erro && <span className="field-error">{erro}</span>}
    </div>
  );
}