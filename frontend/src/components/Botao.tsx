import type { ButtonHTMLAttributes } from "react";

type BotaoProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: "primario" | "perigo";
};

export function Botao({ variante = "primario", className = "", ...resto }: BotaoProps) {
  const classeVariante = variante === "perigo" ? "btn-danger" : "btn-primary";
  return <button className={`btn ${classeVariante} ${className}`} {...resto} />;
}