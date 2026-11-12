import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Tabela } from "../../components/Tabela";
import { Paginacao } from "../../components/Paginacao";
import { Botao } from "../../components/Botao";
import { excluirPlano, listarPlanos } from "../../services/planos";
import type { Plano } from "../../services/planos";
import { ApiError } from "../../services/api";
import type { Pagina } from "../../types/pagina";

export function PlanosLista() {
    const [pagina, setPagina] = useState(1);
    const [atualizacao, setAtualizacao] = useState(0);
    const [resposta, setResposta] = useState<Pagina<Plano> | null>(null);
    const [erro, setErro] = useState("");
    const [erroExcluir, setErroExcluir] = useState("");

    useEffect(() => {
        let ativo = true;

        listarPlanos(pagina)
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

    async function handleExcluir(plano: Plano) {
        if (!window.confirm(`Excluir o plano "${plano.nome}"?`)) {
            return;
        }

        setErroExcluir("");

        try {
            await excluirPlano(plano.id);
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
                <h1>Planos</h1>
                <Link to="/admin/planos/novo" className="btn btn-primary">
                    Novo plano
                </Link>
            </div>

            {erroExcluir && (
                <p role="alert" className="form-alert">
                    {erroExcluir}
                </p>
            )}

            <Tabela
                dados={resposta.dados}
                chave={(plano) => plano.id}
                mensagemVazia="Nenhum plano cadastrado."
                colunas={[
                    { titulo: "Nome", render: (plano) => plano.nome },
                    {
                        titulo: "Valor base",
                        render: (plano) =>
                            plano.valorBase === null
                                ? "—"
                                : plano.valorBase.toLocaleString("pt-BR", {
                                      style: "currency",
                                      currency: "BRL",
                                  }),
                    },
                    { titulo: "Ativo", render: (plano) => (plano.ativo ? "Sim" : "Não") },
                    {
                        titulo: "Ações",
                        render: (plano) => (
                            <div className="acoes">
                                <Link to={`/admin/planos/${plano.id}/editar`}>Editar</Link>
                                <Botao
                                    type="button"
                                    variante="perigo"
                                    onClick={() => handleExcluir(plano)}
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