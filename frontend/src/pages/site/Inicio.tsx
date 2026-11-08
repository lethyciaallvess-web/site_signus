import { Link } from "react-router-dom";
import fundo from "../../assets/fundo.jpeg";
import "./Inicio.css";

type ServicoProps = {
    titulo: string;
    descricao: string;
};

function Servico({ titulo, descricao }: ServicoProps) {
    return (
        <article className="inicio-servico">
            <h3>{titulo}</h3>
            <p>{descricao}</p>
        </article>
    );
}

type PassoProps = {
    numero: number;
    titulo: string;
    descricao: string;
};

function Passo({ numero, titulo, descricao }: PassoProps) {
    return (
        <li className="inicio-passo">
            <span className="inicio-passo-numero">{numero}</span>
            <div>
                <h3>{titulo}</h3>
                <p>{descricao}</p>
            </div>
        </li>
    );
}

export function Inicio() {
    return (
        <div>
            <section
                className="inicio-hero"
                style={{
                    backgroundImage: `url(${fundo})`,
                }}
            >
                <h1>Som, luz e estrutura para o seu evento</h1>
                <p>
                    Casamentos, formaturas, festas e eventos corporativos com equipamentos
                    profissionais e equipe de montagem.
                </p>
                <div className="inicio-hero-acoes">
                    <Link to="/orcamento" className="btn btn-primary">
                        Pedir orçamento
                    </Link>
                    <Link to="/galeria" className="inicio-botao-claro">
                        Ver galeria
                    </Link>
                </div>
            </section>

            <section className="inicio-secao">
                <h2>O que fazemos</h2>
                <div className="inicio-grade">
                    <Servico
                        titulo="Som"
                        descricao="Caixas, mesas e microfones para que todos ouçam bem, do cerimonial à pista."
                    />
                    <Servico
                        titulo="Iluminação"
                        descricao="Refletores e efeitos que criam o clima certo para cada momento da festa."
                    />
                    <Servico
                        titulo="Painel de LED"
                        descricao="Imagens, vídeos e visuais em alta definição no palco e na pista."
                    />
                    <Servico
                        titulo="Estrutura"
                        descricao="Palcos, treliças e montagem completa, com segurança e acabamento."
                    />
                </div>
            </section>

            <section className="inicio-secao inicio-secao-clara">
                <h2>Como funciona</h2>
                <ol className="inicio-passos">
                    <Passo
                        numero={1}
                        titulo="Peça seu orçamento"
                        descricao="Escolha a melhor data para você e peça seu orçamento gratuito."
                    />
                    <Passo
                        numero={2}
                        titulo="Escolhemos o plano"
                        descricao="Definimos o plano e os equipamentos extras que o seu evento precisa."
                    />
                    <Passo
                        numero={3}
                        titulo="Nós montamos tudo"
                        descricao="A equipe recebe a ficha de montagem e deixa tudo pronto no dia."
                    />
                </ol>
            </section>

            <section className="inicio-chamada">
                <h2>Vamos planejar o seu evento?</h2>
                <Link to="/orcamento" className="btn btn-primary">
                    Pedir orçamento
                </Link>
            </section>
        </div>
    );
}