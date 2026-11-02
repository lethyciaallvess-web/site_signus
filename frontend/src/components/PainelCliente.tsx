import { useEffect, useState } from "react";
import { api } from "../api/axios";
import "./Dashboard.css";
import "./PainelCliente.css";

interface Evento {
  id: number; nome: string; dataInicio: string; localEvento: string;
  status: string; valor: number | null; plano: string | null;
}
const moeda = (valor: number) => valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const status: Record<string, string> = {
  ORCAMENTO: "Orçamento", CONFIRMADO: "Confirmado", EM_PREPARACAO: "Em preparação",
  CONCLUIDO: "Concluído", CANCELADO: "Cancelado",
};
export function PainelCliente() {
  const [eventos, setEventos] = useState<Evento[] | null>(null);
  const [erro, setErro] = useState("");
  useEffect(() => {
    let ativo = true;
    api.get<{ eventos: Evento[] }>("/cliente/painel")
      .then(({ data }) => { if (ativo) setEventos(data.eventos); })
      .catch((e) => { if (ativo) setErro(e.message || "Não foi possível carregar seus eventos."); });
    return () => { ativo = false; };
  }, []);
  if (erro) return <p role="alert" className="form-alert">{erro}</p>;
  if (!eventos) return <p role="status">Carregando seus eventos...</p>;
  return <section className="dashboard" aria-label="Seus eventos e orçamentos">
    <h2>Meus eventos e orçamentos</h2>
    <div className="dash-resumo">
      <div><span>Meus eventos</span><strong>{eventos.length}</strong></div>
      <div><span>Orçamentos</span><strong>{eventos.filter(e => e.status === "ORCAMENTO").length}</strong></div>
      <div><span>Confirmados ou em preparação</span><strong>{eventos.filter(e => ["CONFIRMADO", "EM_PREPARACAO"].includes(e.status)).length}</strong></div>
    </div>
    {eventos.length === 0 ? <p>Você ainda não tem eventos ou orçamentos cadastrados.</p> :
      <div className="cliente-eventos">{eventos.map(e => <article className="dash-card" key={e.id}>
        <h3>{e.nome}</h3><p>{status[e.status] ?? e.status}</p>
        <dl><dt>Data</dt><dd>{new Date(e.dataInicio).toLocaleString("pt-BR")}</dd>
          <dt>Local</dt><dd>{e.localEvento}</dd>
          <dt>Plano</dt><dd>{e.plano ?? "A definir"}</dd>
          <dt>Valor</dt><dd>{e.valor === null ? "A definir" : moeda(e.valor)}</dd></dl>
      </article>)}</div>}
  </section>;
}
