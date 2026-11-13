import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Tabela } from "../../components/Tabela";
import { Paginacao } from "../../components/Paginacao";
import { Botao } from "../../components/Botao";
import { excluirFuncionario, listarEquipe } from "../../services/equipe";
import type { Funcionario } from "../../services/equipe";
import { ApiError } from "../../services/api";
import type { Pagina } from "../../types/pagina";
import { PERFIL_ADMIN } from "../../utils/perfis";

export function EquipeLista() {
    const [pagina, setPagina] = useState(1);
    const [atualizacao, setAtualizacao] = useState(0);
    const [resposta, setResposta] = useState<Pagina<Funcionario> | null>(null);
    const [erro, setErro] = useState("");
    const [erroExcluir, setErroExcluir] = useState("");

    useEffect(() => {
        let ativo = true;

        listarEquipe(pagina)
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

    async function handleExcluir(funcionario: Funcionario) {
        if (!window.confirm(`Excluir o funcionário "${funcionario.nome}"?`)) {
            return;
        }

        setErroExcluir("");

        try {
            await excluirFuncionario(funcionario.id);
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
                <h1>Equipe</h1>
                <Link to="/admin/equipe/novo" className="btn btn-primary">
                    Novo funcionário
                </Link>
            </div>

            {erroExcluir && (
                <p role="alert" className="form-alert">
                    {erroExcluir}
                </p>
            )}

            <Tabela
                dados={resposta.dados}
                chave={(funcionario) => funcionario.id}
                mensagemVazia="Nenhum funcionário cadastrado."
                colunas={[
                    { titulo: "Nome", render: (funcionario) => funcionario.nome },
                    { titulo: "E-mail", render: (funcionario) => funcionario.email },
                    {
                        titulo: "Perfil",
                        render: (funcionario) =>
                            funcionario.perfil === PERFIL_ADMIN ? "Administrador" : "Operador",
                    },
                    {
                        titulo: "Ações",
                        render: (funcionario) =>
                            funcionario.perfil === PERFIL_ADMIN ? (
                                "—"
                            ) : (
                                <div className="acoes">
                                    <Link to={`/admin/equipe/${funcionario.id}/editar`}>
                                        Editar
                                    </Link>
                                    <Botao
                                        type="button"
                                        variante="perigo"
                                        onClick={() => handleExcluir(funcionario)}
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