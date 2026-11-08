import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./pages/Login";
import { Cadastro } from "./pages/Cadastro";
import { Home } from "./pages/Home";
import { Perfil } from "./pages/Perfil";
import { RotaProtegida } from "./components/RotaProtegida";
import { AdminLayout } from "./components/AdminLayout";
import { SiteLayout } from "./components/site/SiteLayout";
import { Inicio } from "./pages/site/Inicio";
import { Galeria } from "./pages/site/Galeria";
import { Orcamento } from "./pages/site/Orcamento";
import { NotFoundPage } from "./pages/NotFoundPage";
import { UsuarioProvider } from "./contexts/UsuarioProvider";
import { PlanosLista } from "./pages/planos/PlanosLista";
import { PlanoForm } from "./pages/planos/PlanoForm";
import { ItensLista } from "./pages/itens/ItensLista";
import { ItemForm } from "./pages/itens/ItemForm";
import { ClientesLista } from "./pages/clientes/ClientesLista";
import { ClienteForm } from "./pages/clientes/ClienteForm";
import { EventosLista } from "./pages/eventos/EventosLista";
import { EventoForm } from "./pages/eventos/EventoForm";
import { EventoFicha } from "./pages/eventos/EventoFicha";
import { EquipeLista } from "./pages/equipe/EquipeLista";
import { EquipeForm } from "./pages/equipe/EquipeForm";
import { MeusEventos } from "./pages/cliente/MeusEventos";

function App() {
  return (
    <UsuarioProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<SiteLayout />}>
            <Route path="/" element={<Inicio />} />
            <Route path="/galeria" element={<Galeria />} />
            <Route path="/orcamento" element={<Orcamento />} />
            <Route
              path="/cliente"
              element={
                <RotaProtegida area="cliente">
                  <MeusEventos />
                </RotaProtegida>
              }
            />
          </Route>

          <Route
            path="/admin"
            element={
              <RotaProtegida area="equipe">
                <AdminLayout />
              </RotaProtegida>
            }
          >
            <Route index element={<Navigate to="/admin/home" replace />} />
            <Route path="home" element={<Home />} />
            <Route path="planos" element={<PlanosLista />} />
            <Route path="planos/novo" element={<PlanoForm key="novo" />} />
            <Route path="planos/:id/editar" element={<PlanoForm key="editar" />} />
            <Route path="itens" element={<ItensLista />} />
            <Route path="itens/novo" element={<ItemForm key="novo" />} />
            <Route path="itens/:id/editar" element={<ItemForm key="editar" />} />
            <Route path="clientes" element={<ClientesLista />} />
            <Route path="clientes/novo" element={<ClienteForm key="novo" />} />
            <Route path="clientes/:id/editar" element={<ClienteForm key="editar" />} />
            <Route path="eventos" element={<EventosLista />} />
            <Route path="eventos/novo" element={<EventoForm key="novo" />} />
            <Route path="eventos/:id" element={<EventoFicha />} />
            <Route path="eventos/:id/editar" element={<EventoForm key="editar" />} />
            <Route path="equipe" element={<EquipeLista />} />
            <Route path="equipe/novo" element={<EquipeForm />} />
          </Route>

          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin/cadastro" element={<Cadastro />} />
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