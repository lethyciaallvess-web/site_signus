import "./CampoBusca.css";

type CampoBuscaProps = {
    valor: string;
    placeholder: string;
    aoMudar: (valor: string) => void;
};

export function CampoBusca({ valor, placeholder, aoMudar }: CampoBuscaProps) {
    return (
        <div className="campo-busca">
            <svg
                className="campo-busca-icone"
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
                type="search"
                value={valor}
                placeholder={placeholder}
                aria-label={placeholder}
                onChange={(event) => aoMudar(event.target.value)}
            />
        </div>
    );
}