import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useUsuario } from "../contexts/UsuarioContext";
import { Tabela } from "../components/Tabela";
import { listarClientes } from "../services/clientes";
import { listarItens } from "../services/itens";
import { listarPlanos } from "../services/planos";
import { listarEventos } from "../services/eventos";
import type { Evento, StatusEvento } from "../services/eventos";
import { formatarDataHora, rotulosStatus } from "../utils/formatacoes";
import "./Home.css";

type Totais = {
    clientes: number;
    itens: number;
    planos: number;
    eventos: number;
};

const listaStatus: StatusEvento[] = [
    "ORCAMENTO",
    "CONFIRMADO",
    "EM_PREPARACAO",
    "CONCLUIDO",
    "CANCELADO",
];

function agoraTexto() {
    const d = new Date();
    const p = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

type CartaoResumoProps = {
    titulo: string;
    valor: number;
    destino: string;
};

function CartaoResumo({ titulo, valor, destino }: CartaoResumoProps) {
    return (
        <Link to={destino} className="cartao-resumo">
            <span className="cartao-resumo-valor">{valor}</span>
            <span className="cartao-resumo-titulo">{titulo}</span>
        </Link>
    );
}

type BarraStatusProps = {
    status: StatusEvento;
    quantidade: number;
    total: number;
};

function BarraStatus({ status, quantidade, total }: BarraStatusProps) {
    const porcentagem = total > 0 ? (quantidade / total) * 100 : 0;

    return (
        <div className="barra-status">
            <span className="barra-status-rotulo">{rotulosStatus[status]}</span>
            <div className="barra-status-trilho">
                <div
                    className={`barra-status-preenchimento barra-${status}`}
                    style={{ width: `${porcentagem}%` }}
                />
            </div>
            <span className="barra-status-quantidade">{quantidade}</span>
        </div>
    );
}

export function Home() {
    const { usuario } = useUsuario();
    const [totais, setTotais] = useState<Totais>({
        clientes: 0,
        itens: 0,
        planos: 0,
        eventos: 0,
    });
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [proximos, setProximos] = useState<Evento[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    useEffect(() => {
        let ativo = true;

        async function carregar() {
            try {
                const [clientes, itens, planos, listaEventos] = await Promise.all([
                    listarClientes(1, 1),
                    listarItens(1, 1),
                    listarPlanos(1, 1),
                    listarEventos(1, 100),
                ]);

                if (!ativo) return;

                const agora = agoraTexto();

                setTotais({
                    clientes: clientes.total,
                    itens: itens.total,
                    planos: planos.total,
                    eventos: listaEventos.total,
                });
                setEventos(listaEventos.dados);
                setProximos(
                    listaEventos.dados
                        .filter(
                            (e) =>
                                e.status !== "CANCELADO" &&
                                e.status !== "CONCLUIDO" &&
                                e.dataInicio >= agora
                        )
                        .sort((a, b) => a.dataInicio.localeCompare(b.dataInicio))
                        .slice(0, 5)
                );
            } catch {
                if (ativo) setErro("Não foi possível carregar o painel.");
            } finally {
                if (ativo) setCarregando(false);
            }
        }

        carregar();

        return () => {
            ativo = false;
        };
    }, []);

    if (carregando) return <p>Carregando...</p>;

    return (
        <div className="painel-pagina">
            <h1>Painel</h1>
            <p>Olá, {usuario?.nome}</p>

            {erro && <p className="erro">{erro}</p>}

            <div className="resumo-grade">
                <CartaoResumo titulo="Eventos" valor={totais.eventos} destino="/admin/eventos" />
                <CartaoResumo titulo="Clientes" valor={totais.clientes} destino="/admin/clientes" />
                <CartaoResumo titulo="Planos" valor={totais.planos} destino="/admin/planos" />
                <CartaoResumo titulo="Itens" valor={totais.itens} destino="/admin/itens" />
            </div>

            <div className="painel-colunas">
                <section className="painel-bloco">
                    <h2>Eventos por status</h2>
                    {listaStatus.map((status) => (
                        <BarraStatus
                            key={status}
                            status={status}
                            quantidade={eventos.filter((e) => e.status === status).length}
                            total={eventos.length}
                        />
                    ))}
                </section>

                <section className="painel-bloco">
                    <h2>Próximos eventos</h2>
                    <Tabela
                        colunas={[
                            {
                                titulo: "Evento",
                                render: (e: Evento) => (
                                    <Link to={`/admin/eventos/${e.id}`}>{e.nome}</Link>
                                ),
                            },
                            { titulo: "Cliente", render: (e: Evento) => e.cliente?.nome ?? "-" },
                            { titulo: "Início", render: (e: Evento) => formatarDataHora(e.dataInicio) },
                            { titulo: "Status", render: (e: Evento) => rotulosStatus[e.status] },
                            {
                                titulo: "Equipamentos",
                                render: (e: Evento) => (
                                    <Link to={`/admin/eventos/${e.id}`}>Ver equipamentos</Link>
                                ),
                            },
                        ]}
                        dados={proximos}
                        chave={(e: Evento) => e.id}
                        mensagemVazia="Nenhum evento futuro."
                    />
                </section>
            </div>
        </div>
    );
}