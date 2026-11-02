import { Link, NavLink, Outlet } from "react-router-dom";

export function SiteLayout() {
    return (
        <>
            <header>
                <Link to="/">Signus Som e Luz</Link>

                <nav>
                    <NavLink to="/" end>Início</NavLink>
                    <NavLink to="/galeria">Galeria</NavLink>
                    <NavLink to="/orcamento">Orçamento</NavLink>
                </nav>
            </header>

            <main>
                <Outlet />
            </main>

            <footer>
                <p>Desenvolvido por Camila Watanabe e Lethycia Alves</p>
            </footer>
        </>
    );
}