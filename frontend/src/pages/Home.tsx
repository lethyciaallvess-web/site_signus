import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useUsuario } from "../contexts/UsuarioContext";
import { Botao } from "../components/Botao";
import { PainelCliente } from "../components/PainelCliente";

export function Home() {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { usuario, sair } = useUsuario();

    function handleSair() {
        sair();
        navigate("/admin/login");
    }

    if (usuario?.perfil === "CLIENTE" && pathname !== "/cliente") return <Navigate to="/cliente" replace />;
    if (usuario?.perfil !== "CLIENTE" && pathname === "/cliente") return <Navigate to="/admin/home" replace />;
    return (
        <div className="app">
            <h1>{usuario?.perfil === "CLIENTE" ? "Minha área" : "Painel da equipe"}</h1>
            <p>Olá, {usuario?.nome}</p>
            <p>
                <Link to="/admin/perfil">Editar meus dados</Link>
            </p>
            <Botao onClick={handleSair}>Sair</Botao>
            {usuario?.perfil === "CLIENTE" && <PainelCliente />}        </div>
    );
}
