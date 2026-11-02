import type { ReactNode } from "react";
import "./Tabela.css";

type Coluna<T> = {
  titulo: string;
  render: (item: T) => ReactNode;
};

type TabelaProps<T> = {
  colunas: Coluna<T>[];
  dados: T[];
  chave: (item: T) => string | number;
  mensagemVazia?: string;
};

export function Tabela<T>({
  colunas,
  dados,
  chave,
  mensagemVazia = "Nenhum registro encontrado.",
}: TabelaProps<T>) {
  if (dados.length === 0) {
    return <p className="tabela-vazia">{mensagemVazia}</p>;
  }

  return (
    <table className="tabela">
      <thead>
        <tr>
          {colunas.map((coluna) => (
            <th key={coluna.titulo}>{coluna.titulo}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {dados.map((item) => (
          <tr key={chave(item)}>
            {colunas.map((coluna) => (
              <td key={coluna.titulo}>{coluna.render(item)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}