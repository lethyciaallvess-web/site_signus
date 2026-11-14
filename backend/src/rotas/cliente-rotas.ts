import { Router } from "express";
import { PerfilUsuario } from "../entidades/usuario";
import { AcessoNegadoErro } from "../erros/erros-http";
import { autenticar, obterUsuarioAutenticado } from "../middlewares/autenticar";
import type { RepositorioDeEventos } from "../repositorios/evento-repositorio";
import type { RepositorioDeUsuarios } from "../repositorios/usuario-repositorio";

export function criarRotasCliente(
  usuarios: RepositorioDeUsuarios,
  eventos: RepositorioDeEventos,
): Router {
  const rotas = Router();
  rotas.get("/painel", autenticar, async (req, res) => {
    const { id, perfil } = obterUsuarioAutenticado(req);
    if (perfil !== PerfilUsuario.CLIENTE) throw new AcessoNegadoErro("Área exclusiva de clientes.");
    const conta = await usuarios.buscarPorId(id);
    if (!conta?.clienteId) throw new AcessoNegadoErro("Seu cadastro ainda não está vinculado a um cliente.");
    res.json({ eventos: await eventos.listarDoCliente(conta.clienteId) });
  });
  return rotas;
}
