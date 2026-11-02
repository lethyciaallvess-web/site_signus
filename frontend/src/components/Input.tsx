import type { ChangeEvent } from "react";
import "./Input.css";

interface InputProps {
  type: string;
  placeholder: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  erro?: string;
  disabled?: boolean;
}

export function Input({ type, placeholder, value, onChange, erro, disabled }: InputProps) {
  return (
    <div className="form-field">
      <input
        type={type}
        placeholder={placeholder}
        aria-label={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
      {erro && <span className="field-error">{erro}</span>}
    </div>
  );
}