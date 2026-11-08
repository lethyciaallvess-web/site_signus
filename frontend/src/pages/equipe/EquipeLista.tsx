import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Tabela } from "../../components/Tabela";
import { Paginacao } from "../../components/Paginacao";
import { listarEquipe } from "../../services/equipe";
import type { Funcionario } from "../../services/equipe";
import { ApiError } from "../../services/api";
import type { Pagina } from "../../types/pagina";

export function EquipeLista() {
    const [pagina, setPagina] = useState(1);
    const [resposta, setResposta] = useState<Pagina<Funcionario> | null>(null);
    const [erro, setErro] = useState("");

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
    }, [pagina]);

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
                            funcionario.perfil === "ADMIN" ? "Administrador" : "Operador",
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