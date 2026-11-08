import { useEffect, useState } from "react";
import "./Galeria.css";

type FotoGaleria = {
    numero: number;
    url: string;
};

const NUMERO_DESTAQUE = 4;
const LEGENDA_DESTAQUE = "Evento no Centro Universitário Integrado";

const arquivos = import.meta.glob<string>("../../assets/foto*.{jpg,jpeg,png,webp}", {
    eager: true,
    import: "default",
});

const fotos: FotoGaleria[] = Object.entries(arquivos)
    .map(([caminho, url]) => ({
        numero: Number(caminho.match(/foto(\d+)\./)?.[1]),
        url,
    }))
    .filter((foto) => !Number.isNaN(foto.numero))
    .sort((a, b) => a.numero - b.numero);

type MiniaturaProps = {
    foto: FotoGaleria;
    legenda: string;
    onAbrir: (foto: FotoGaleria) => void;
    className?: string;
};

function Miniatura({ foto, legenda, onAbrir, className = "" }: MiniaturaProps) {
    return (
        <button
            type="button"
            className={`galeria-foto ${className}`}
            onClick={() => onAbrir(foto)}
        >
            <img src={foto.url} alt={legenda} loading="lazy" />
        </button>
    );
}

type VisualizadorProps = {
    foto: FotoGaleria;
    legenda: string;
    onFechar: () => void;
};

function Visualizador({ foto, legenda, onFechar }: VisualizadorProps) {
    useEffect(() => {
        function aoTeclar(evento: KeyboardEvent) {
            if (evento.key === "Escape") {
                onFechar();
            }
        }

        window.addEventListener("keydown", aoTeclar);

        return () => {
            window.removeEventListener("keydown", aoTeclar);
        };
    }, [onFechar]);

    return (
        <div className="galeria-visualizador" role="dialog" aria-modal="true" onClick={onFechar}>
            <img src={foto.url} alt={legenda} />
            <button
                type="button"
                className="galeria-fechar"
                aria-label="Fechar"
                onClick={onFechar}
            >
                ×
            </button>
        </div>
    );
}

export function Galeria() {
    const [aberta, setAberta] = useState<FotoGaleria | null>(null);

    const destaque = fotos.find((foto) => foto.numero === NUMERO_DESTAQUE);
    const demais = fotos.filter((foto) => foto.numero !== NUMERO_DESTAQUE);

    return (
        <section className="galeria">
            <h1>Galeria de eventos</h1>
            <p className="galeria-intro">Alguns dos eventos realizados pela Signus.</p>

            {fotos.length === 0 && <p>Nenhuma foto encontrada.</p>}

            {destaque && (
                <figure className="galeria-destaque">
                    <Miniatura
                        foto={destaque}
                        legenda={LEGENDA_DESTAQUE}
                        onAbrir={setAberta}
                        className="galeria-destaque-foto"
                    />
                    <figcaption>
                        <span className="galeria-selo">Destaque</span>
                        {LEGENDA_DESTAQUE}
                    </figcaption>
                </figure>
            )}

            <div className="galeria-grade">
                {demais.map((foto) => (
                    <Miniatura
                        key={foto.numero}
                        foto={foto}
                        legenda="Evento realizado pela Signus"
                        onAbrir={setAberta}
                    />
                ))}
            </div>

            {aberta && (
                <Visualizador
                    foto={aberta}
                    legenda={
                        aberta.numero === NUMERO_DESTAQUE
                            ? LEGENDA_DESTAQUE
                            : "Evento realizado pela Signus"
                    }
                    onFechar={() => setAberta(null)}
                />
            )}
        </section>
    );
}