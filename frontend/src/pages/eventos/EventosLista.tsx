import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Tabela } from "../../components/Tabela";
import { Paginacao } from "../../components/Paginacao";
import { Botao } from "../../components/Botao";
import { excluirEvento, listarEventos } from "../../services/eventos";
import type { Evento } from "../../services/eventos";
import { ApiError } from "../../services/api";
import type { Pagina } from "../../types/pagina";
import { formatarDataHora, rotulosStatus } from "../../utils/formatacoes";

export function EventosLista() {
    const [pagina, setPagina] = useState(1);
    const [atualizacao, setAtualizacao] = useState(0);
    const [resposta, setResposta] = useState<Pagina<Evento> | null>(null);
    const [erro, setErro] = useState("");
    const [erroExcluir, setErroExcluir] = useState("");

    useEffect(() => {
        let ativo = true;

        listarEventos(pagina)
            .then((dados) => {
                if (ativo) {
                    setResposta(dados);
                    setErro("");
                }
            })
            .catch((erroApi) => {
                if (ativo) {
                    setErro(
                        erroApi instanceof ApiError
                            ? erroApi.message
                            : "Erro inesperado. Tente novamente."
                    );
                }
            });

        return () => {
            ativo = false;
        };
    }, [pagina, atualizacao]);

    async function handleExcluir(evento: Evento) {
        if (!window.confirm(`Excluir o evento "${evento.nome}"?`)) {
            return;
        }

        setErroExcluir("");

        try {
            await excluirEvento(evento.id);
            if (resposta && resposta.dados.length === 1 && pagina > 1) {
                setPagina(pagina - 1);
            } else {
                setAtualizacao(atualizacao + 1);
            }
        } catch (erroApi) {
            setErroExcluir(
                erroApi instanceof ApiError
                    ? erroApi.message
                    : "Erro inesperado. Tente novamente."
            );
            setAtualizacao(atualizacao + 1);
        }
    }

    if (erro) {
        return (
            <p role="alert" className="form-alert">
                {erro}
            </p>
        );
    }

    if (!resposta) {
        return <p role="status">Carregando...</p>;
    }

    return (
        <div>
            <div className="pagina-cabecalho">
                <h1>Eventos</h1>
                <Link to="/admin/eventos/novo" className="btn btn-primary">
                    Novo evento
                </Link>
            </div>

            {erroExcluir && (
                <p role="alert" className="form-alert">
                    {erroExcluir}
                </p>
            )}

            <Tabela
                dados={resposta.dados}
                chave={(evento) => evento.id}
                mensagemVazia="Nenhum evento cadastrado."
                colunas={[
                    { titulo: "Evento", render: (evento) => evento.nome },
                    { titulo: "Cliente", render: (evento) => evento.cliente?.nome ?? "—" },
                    { titulo: "Plano", render: (evento) => evento.plano?.nome ?? "—" },
                    { titulo: "Início", render: (evento) => formatarDataHora(evento.dataInicio) },
                    { titulo: "Status", render: (evento) => rotulosStatus[evento.status] },
                    {
                        titulo: "Valor",
                        render: (evento) =>
                            evento.valorNegociado === null
                                ? "—"
                                : evento.valorNegociado.toLocaleString("pt-BR", {
                                      style: "currency",
                                      currency: "BRL",
                                  }),
                    },
                    {
                        titulo: "Ações",
                        render: (evento) => (
                            <div className="acoes">
                                <Link to={`/admin/eventos/${evento.id}`}>Ver ficha</Link>
                                <Link to={`/admin/eventos/${evento.id}/editar`}>Editar</Link>
                                <Botao
                                    type="button"
                                    variante="perigo"
                                    onClick={() => handleExcluir(evento)}
                                >
                                    Excluir
                                </Botao>
                            </div>
                        ),
                    },
                ]}
            />

            <Paginacao
                paginaAtual={resposta.pagina}
                totalPaginas={resposta.totalPaginas}
                aoMudar={setPagina}
            />
        </div>
    );
}