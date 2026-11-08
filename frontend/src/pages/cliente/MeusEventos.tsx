import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useUsuario } from "../../contexts/UsuarioContext";
import { buscarMeusEventos } from "../../services/cliente";
import type { EventoCliente } from "../../services/cliente";
import { ApiError } from "../../services/api";
import { formatarDataHora, rotulosStatus } from "../../utils/formatacoes";
import "./MeusEventos.css";

type LinhaProps = {
    rotulo: string;
    valor: string;
};

function Linha({ rotulo, valor }: LinhaProps) {
    return (
        <div className="meus-evento-linha">
            <dt>{rotulo}</dt>
            <dd>{valor}</dd>
        </div>
    );
}

type CartaoEventoProps = {
    evento: EventoCliente;
};

function CartaoEvento({ evento }: CartaoEventoProps) {
    return (
        <article className="meus-evento">
            <div className="meus-evento-topo">
                <h3>{evento.nome}</h3>
                <span className={`meus-status status-${evento.status}`}>
                    {rotulosStatus[evento.status]}
                </span>
            </div>

            <dl>
                <Linha rotulo="Início" valor={formatarDataHora(evento.dataInicio)} />
                <Linha rotulo="Fim" valor={formatarDataHora(evento.dataFim)} />
                <Linha rotulo="Local" valor={evento.localEvento} />
                <Linha rotulo="Plano" valor={evento.plano ?? "—"} />
                <Linha
                    rotulo="Valor"
                    valor={
                        evento.valor === null
                            ? "—"
                            : evento.valor.toLocaleString("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                              })
                    }
                />
            </dl>
        </article>
    );
}

export function MeusEventos() {
    const { usuario } = useUsuario();
    const [eventos, setEventos] = useState<EventoCliente[] | null>(null);
    const [erro, setErro] = useState("");

    useEffect(() => {
        let ativo = true;

        buscarMeusEventos()
            .then((dados) => {
                if (ativo) {
                    setEventos(dados);
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
    }, []);

    return (
        <section className="meus-eventos">
            <h1>Meus eventos</h1>
            <p className="meus-eventos-intro">
                Olá, {usuario?.nome}. Acompanhe aqui os seus eventos com a Signus.{" "}
                <Link to="/admin/perfil">Meus dados</Link>
            </p>

            {erro && (
                <p role="alert" className="form-alert">
                    {erro}
                </p>
            )}

            {!erro && eventos === null && <p role="status">Carregando...</p>}

            {eventos !== null && eventos.length === 0 && (
                <p>
                    Você ainda não tem eventos. Assim que a nossa equipe cadastrar o seu
                    evento, ele aparece aqui.
                </p>
            )}

            <div className="meus-eventos-lista">
                {eventos?.map((evento) => (
                    <CartaoEvento key={evento.id} evento={evento} />
                ))}
            </div>
        </section>
    );
}