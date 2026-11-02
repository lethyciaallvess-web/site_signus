import { Link, useNavigate } from "react-router-dom";
import { useUsuario } from "../contexts/UsuarioContext";
import { Botao } from "../components/Botao";

export function Home() {
    const navigate = useNavigate();
    const { usuario, sair } = useUsuario();

    function handleSair() {
        sair();
        navigate("/admin/login");
    }

    return (
        <div className="app">
            <h1>Área logada</h1>
            <p>Login realizado com sucesso.</p>
            <p>Olá, {usuario?.nome}</p>
            <p>
                <Link to="/admin/perfil">Editar meus dados</Link>
            </p>
            <Botao onClick={handleSair}>Sair</Botao>
        </div>
    );
}