import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useUsuario } from "../contexts/UsuarioContext";
import { PERFIL_ADMIN } from "../utils/perfis";
import { Botao } from "./Botao";
import "./AdminLayout.css";

export function AdminLayout() {
    const navigate = useNavigate();
    const { usuario, sair } = useUsuario();
    const [aberto, setAberto] = useState(false);

    function handleSair() {
        sair();
        navigate("/admin/login");
    }

    return (
        <div className="admin">
            <button
                type="button"
                className="admin-hamburguer"
                aria-label="Abrir menu"
                onClick={() => setAberto(!aberto)}
            >
                ☰
            </button>

            <aside className={aberto ? "admin-menu aberto" : "admin-menu"}>
                <h2>Signus</h2>

                <nav onClick={() => setAberto(false)}>
                    <NavLink to="/admin/home">Início</NavLink>
                    <NavLink to="/admin/clientes">Clientes</NavLink>
                    <NavLink to="/admin/itens">Itens</NavLink>
                    <NavLink to="/admin/planos">Planos</NavLink>
                    <NavLink to="/admin/eventos">Eventos</NavLink>
                    {usuario?.perfil === PERFIL_ADMIN && (
                        <NavLink to="/admin/equipe">Equipe</NavLink>
                    )}
                    <NavLink to="/admin/perfil">Meus dados</NavLink>
                </nav>

                <p>{usuario?.nome}</p>
                <Botao onClick={handleSair}>Sair</Botao>
            </aside>

            <main className="admin-conteudo">
                <Outlet />
            </main>
        </div>
    );
}