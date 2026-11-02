import { Link } from "react-router-dom";

export function NotFoundPage() {
    return (
        <div className="not-found">
            <h1>Página não encontrada!</h1>
            <Link to="/">Voltar para o início</Link>
        </div>
    );
}