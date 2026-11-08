import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Tabela } from "../../components/Tabela";
import { Botao } from "../../components/Botao";
import { buscarEvento } from "../../services/eventos";
import type { Evento, ItemEvento } from "../../services/eventos";
import { buscarPlano } from "../../services/planos";
import type { ItemPlano } from "../../services/planos";
import { ApiError } from "../../services/api";
import { formatarDataHora, rotulosStatus } from "../../utils/formatacoes";
import "./EventoFicha.css";

type DadoProps = {
    rotulo: string;
    valor: string;
};

function Dado({ rotulo, valor }: DadoProps) {
    return (
        <div className="ficha-dado">
            <span className="ficha-dado-rotulo">{rotulo}</span>
            <span>{valor}</span>
        </div>
    );
}

type TabelaItensProps = {
    itens: ItemPlano[];
    mensagemVazia: string;
};

function TabelaItens({ itens, mensagemVazia }: TabelaItensProps) {
    return (
        <Tabela
            colunas={[
                { titulo: "Qtd", render: (i: ItemPlano) => `${i.quantidade}x` },
                { titulo: "Código", render: (i: ItemPlano) => i.codigo },
                { titulo: "Item", render: (i: ItemPlano) => i.nome },
                { titulo: "Categoria", render: (i: ItemPlano) => i.categoria },
            ]}
            dados={itens}
            chave={(i: ItemPlano) => i.itemId}
            mensagemVazia={mensagemVazia}
        />
    );
}

function somarItens(plano: ItemPlano[], extras: ItemEvento[]) {
    const mapa = new Map<number, ItemPlano>();

    [...plano, ...extras].forEach((item) => {
        const existente = mapa.get(item.itemId);
        mapa.set(
            item.itemId,
            existente
                ? { ...existente, quantidade: existente.quantidade + item.quantidade }
                : item
        );
    });

    return Array.from(mapa.values());
}

export function EventoFicha() {
    const { id } = useParams();
    const [evento, setEvento] = useState<Evento | null>(null);
    const [nomePlano, setNomePlano] = useState("");
    const [itensPlano, setItensPlano] = useState<ItemPlano[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    useEffect(() => {
        let ativo = true;

        async function carregar() {
            try {
                const dadosEvento = await buscarEvento(Number(id));
                const plano =
                    dadosEvento.planoId === null ? null : await buscarPlano(dadosEvento.planoId);

                if (!ativo) return;

                setEvento(dadosEvento);
                setNomePlano(plano ? plano.nome : "");
                setItensPlano(plano ? plano.itens : []);
            } catch (erroApi) {
                if (ativo) {
                    setErro(
                        erroApi instanceof ApiError
                            ? erroApi.message
                            : "Erro inesperado. Tente novamente."
                    );
                }
            } finally {
                if (ativo) setCarregando(false);
            }
        }

        carregar();

        return () => {
            ativo = false;
        };
    }, [id]);

    if (carregando) {
        return <p role="status">Carregando...</p>;
    }

    if (erro || evento === null) {
        return (
            <div>
                <p role="alert" className="form-alert">
                    {erro || "Evento não encontrado."}
                </p>
                <Link to="/admin/eventos">Voltar</Link>
            </div>
        );
    }

    return (
        <div className="ficha">
            <div className="pagina-cabecalho">
                <h1>Ficha de montagem</h1>
                <div className="acoes sem-impressao">
                    <Botao type="button" onClick={() => window.print()}>
                        Imprimir
                    </Botao>
                    <Link to={`/admin/eventos/${evento.id}/editar`}>Editar evento</Link>
                    <Link to="/admin/eventos">Voltar</Link>
                </div>
            </div>

            <section className="painel-bloco">
                <h2>{evento.nome}</h2>
                <div className="ficha-dados">
                    <Dado rotulo="Cliente" valor={evento.cliente?.nome ?? "-"} />
                    <Dado rotulo="Local" valor={evento.localEvento} />
                    <Dado rotulo="Início" valor={formatarDataHora(evento.dataInicio)} />
                    <Dado rotulo="Fim" valor={formatarDataHora(evento.dataFim)} />
                    <Dado rotulo="Status" valor={rotulosStatus[evento.status]} />
                    <Dado rotulo="Observações" valor={evento.observacoes ?? "-"} />
                </div>
            </section>

            <section className="painel-bloco">
                <h2>{nomePlano ? `Plano ${nomePlano}` : "Sem plano"}</h2>
                <TabelaItens itens={itensPlano} mensagemVazia="Nenhum item no plano." />
            </section>

            <section className="painel-bloco">
                <h2>Itens extras</h2>
                <TabelaItens itens={evento.itensExtras} mensagemVazia="Nenhum item extra." />
            </section>

            <section className="painel-bloco">
                <h2>Total para montagem</h2>
                <TabelaItens
                    itens={somarItens(itensPlano, evento.itensExtras)}
                    mensagemVazia="Nada para montar neste evento."
                />
            </section>
        </div>
    );
}