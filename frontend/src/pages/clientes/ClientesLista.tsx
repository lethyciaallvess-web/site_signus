import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Tabela } from "../../components/Tabela";
import { Paginacao } from "../../components/Paginacao";
import { Botao } from "../../components/Botao";
import { CampoBusca } from "../../components/CampoBusca";
import { excluirCliente, listarClientes } from "../../services/clientes";
import type { Cliente } from "../../services/clientes";
import { ApiError } from "../../services/api";
import type { Pagina } from "../../types/pagina";
import { mascararDocumento } from "../../utils/mascaras";

export function ClientesLista() {
    const [pagina, setPagina] = useState(1);
    const [busca, setBusca] = useState("");
    const [termo, setTermo] = useState("");
    const temporizador = useRef<number | undefined>(undefined);
    const [atualizacao, setAtualizacao] = useState(0);
    const [resposta, setResposta] = useState<Pagina<Cliente> | null>(null);
    const [erro, setErro] = useState("");
    const [erroExcluir, setErroExcluir] = useState("");

    useEffect(() => {
        let ativo = true;

        listarClientes(pagina, 10, termo)
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
    }, [pagina, termo, atualizacao]);

    useEffect(() => {
        return () => window.clearTimeout(temporizador.current);
    }, []);

    function handleBusca(valor: string) {
        setBusca(valor);
        window.clearTimeout(temporizador.current);
        temporizador.current = window.setTimeout(() => {
            setTermo(valor.trim());
            setPagina(1);
        }, 400);
    }

    async function handleExcluir(cliente: Cliente) {
        if (!window.confirm(`Excluir o cliente "${cliente.nome}"?`)) {
            return;
        }

        setErroExcluir("");

        try {
            await excluirCliente(cliente.id);
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
                <h1>Clientes</h1>
                <Link to="/admin/clientes/novo" className="btn btn-primary">
                    Novo cliente
                </Link>
            </div>

            {erroExcluir && (
                <p role="alert" className="form-alert">
                    {erroExcluir}
                </p>
            )}

            <CampoBusca
                valor={busca}
                placeholder="Buscar por nome, CPF/CNPJ ou e-mail"
                aoMudar={handleBusca}
            />

            <Tabela
                dados={resposta.dados}
                chave={(cliente) => cliente.id}
                mensagemVazia={termo ? "Nenhum cliente encontrado para essa busca." : "Nenhum cliente cadastrado."}
                colunas={[
                    { titulo: "Nome", render: (cliente) => cliente.nome },
                    {
                        titulo: "Documento",
                        render: (cliente) =>
                            mascararDocumento(cliente.documento, cliente.tipoPessoa ?? "FISICA"),
                    },
                    { titulo: "E-mail", render: (cliente) => cliente.email },
                    { titulo: "Telefone", render: (cliente) => cliente.telefone || "—" },
                    {
                        titulo: "Ações",
                        render: (cliente) => (
                            <div className="acoes">
                                <Link to={`/admin/clientes/${cliente.id}/editar`}>Editar</Link>
                                <Botao
                                    type="button"
                                    variante="perigo"
                                    onClick={() => handleExcluir(cliente)}
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