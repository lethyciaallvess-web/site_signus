import { linkWhatsapp } from "../../utils/contato";
import "./Orcamento.css";

type InformacaoProps = {
    texto: string;
};

function Informacao({ texto }: InformacaoProps) {
    return <li className="orcamento-informacao">{texto}</li>;
}

export function Orcamento() {
    return (
        <section className="orcamento">
            <div className="orcamento-cartao">
                <h1>Agende seu orçamento</h1>
                <p>
                    Fale direto com a nossa equipe pelo WhatsApp. Para agilizar o atendimento,
                    tenha em mãos:
                </p>

                <ul className="orcamento-lista">
                    <Informacao texto="Data e horário do evento" />
                    <Informacao texto="Local do evento" />
                    <Informacao texto="Tipo de evento (casamento, formatura, festa...)" />
                    <Informacao texto="Número aproximado de convidados" />
                </ul>

                <a
                    href={linkWhatsapp()}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-primary"
                >
                    Chamar no WhatsApp
                </a>
            </div>
        </section>
    );
}