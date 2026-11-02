import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./pages/Login";
import { Cadastro } from "./pages/Cadastro";
import { Home } from "./pages/Home";
import { RotaProtegida } from "./components/RotaProtegida";
import { SiteLayout } from "./components/site/SiteLayout";
import { Inicio } from "./pages/site/Inicio";
import { Galeria } from "./pages/site/Galeria";
import { Orcamento } from "./pages/site/Orcamento";
import { NotFoundPage } from "./pages/NotFoundPage";
import { UsuarioProvider } from "./contexts/UsuarioProvider";
import { Perfil } from "./pages/Perfil";

function App() {
  return (
    <UsuarioProvider>
      <BrowserRouter>
        <Routes>
          {/* site dos clientes */}
          <Route element={<SiteLayout />}>
            <Route path="/" element={<Inicio />} />
            <Route path="/galeria" element={<Galeria />} />
            <Route path="/orcamento" element={<Orcamento />} />
          </Route>

          {/* painel administrativo */}
          <Route path="/admin" element={<Navigate to="/admin/home" replace />} />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin/cadastro" element={<Cadastro />} />
          <Route
            path="/admin/home"
            element={
              <RotaProtegida>
                <Home />
              </RotaProtegida>
            }
          />
          <Route
            path="/admin/perfil"
            element={
              <RotaProtegida>
                <Perfil />
              </RotaProtegida>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </UsuarioProvider>
  );
}

export default App;