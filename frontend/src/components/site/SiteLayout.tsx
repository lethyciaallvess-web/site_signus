import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import logo from "../../assets/logo-clara.png";
import { useUsuario } from "../../contexts/UsuarioContext";
import { PERFIL_CLIENTE, rotaInicial } from "../../utils/perfis";
import "./SiteLayout.css";

export function SiteLayout() {
    const navigate = useNavigate();
    const { usuario, sair } = useUsuario();

    function handleSair() {
        sair();
        navigate("/");
    }

    return (
        <div className="site">
            <header className="site-cabecalho">
                <Link to="/" className="site-logo">
                    <img src={logo} alt="Signus Som e Luz" />
                </Link>

                <nav className="site-menu">
                    <NavLink to="/" end>
                        Início
                    </NavLink>
                    <NavLink to="/galeria">Galeria</NavLink>
                    <NavLink to="/orcamento">Orçamento</NavLink>

                    {usuario ? (
                        <>
                            <Link to={rotaInicial(usuario.perfil)} className="site-menu-destaque">
                                {usuario.perfil === PERFIL_CLIENTE ? "Meus eventos" : "Painel"}
                            </Link>
                            <button type="button" className="site-menu-sair" onClick={handleSair}>
                                Sair
                            </button>
                        </>
                    ) : (
                        <Link to="/login" className="site-menu-destaque">
                            Entrar
                        </Link>
                    )}
                </nav>
            </header>

            <main className="site-conteudo">
                <Outlet />
            </main>

            <footer className="site-rodape">
                <strong>Signus Som e Luz</strong>
                <p>Desenvolvido por Camila Watanabe e Lethycia Alves</p>
            </footer>
        </div>
    );
}