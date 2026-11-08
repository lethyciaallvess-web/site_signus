import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Tabela } from "../../components/Tabela";
import { Paginacao } from "../../components/Paginacao";
import { Botao } from "../../components/Botao";
import { excluirItem, listarItens } from "../../services/itens";
import type { Item } from "../../services/itens";
import { ApiError } from "../../services/api";
import type { Pagina } from "../../types/pagina";

export function ItensLista() {
    const [pagina, setPagina] = useState(1);
    const [atualizacao, setAtualizacao] = useState(0);
    const [resposta, setResposta] = useState<Pagina<Item> | null>(null);
    const [erro, setErro] = useState("");
    const [erroExcluir, setErroExcluir] = useState("");

    useEffect(() => {
        let ativo = true;

        listarItens(pagina)
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

    async function handleExcluir(item: Item) {
        if (!window.confirm(`Excluir o item "${item.nome}"?`)) {
            return;
        }

        setErroExcluir("");

        try {
            await excluirItem(item.id);
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
                <h1>Itens</h1>
                <Link to="/admin/itens/novo" className="btn btn-primary">
                    Novo item
                </Link>
            </div>

            {erroExcluir && (
                <p role="alert" className="form-alert">
                    {erroExcluir}
                </p>
            )}

            <Tabela
                dados={resposta.dados}
                chave={(item) => item.id}
                mensagemVazia="Nenhum item cadastrado."
                colunas={[
                    { titulo: "Código", render: (item) => item.codigo },
                    { titulo: "Nome", render: (item) => item.nome },
                    { titulo: "Categoria", render: (item) => item.categoria },
                    { titulo: "Ativo", render: (item) => (item.ativo ? "Sim" : "Não") },
                    {
                        titulo: "Ações",
                        render: (item) => (
                            <div className="acoes">
                                <Link to={`/admin/itens/${item.id}/editar`}>Editar</Link>
                                <Botao
                                    type="button"
                                    variante="perigo"
                                    onClick={() => handleExcluir(item)}
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