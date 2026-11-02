import { Botao } from "./Botao";
import "./Paginacao.css";

type PaginacaoProps = {
  paginaAtual: number;
  totalPaginas: number;
  aoMudar: (pagina: number) => void;
};

export function Paginacao({ paginaAtual, totalPaginas, aoMudar }: PaginacaoProps) {
  if (totalPaginas <= 1) {
    return null;
  }

  return (
    <nav className="paginacao">
      <Botao
        type="button"
        disabled={paginaAtual === 1}
        onClick={() => aoMudar(paginaAtual - 1)}
      >
        Anterior
      </Botao>

      <span>
        Página {paginaAtual} de {totalPaginas}
      </span>

      <Botao
        type="button"
        disabled={paginaAtual === totalPaginas}
        onClick={() => aoMudar(paginaAtual + 1)}
      >
        Próxima
      </Botao>
    </nav>
  );
}