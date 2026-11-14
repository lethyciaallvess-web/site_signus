import { Router } from "express";
import type { ClienteControlador } from "../controladores/cliente-controlador";
import { PerfilUsuario } from "../entidades/usuario";
import { autenticar, exigirPerfil } from "../middlewares/autenticar";

export function criarRotasClientes(controlador: ClienteControlador): Router {
  const rotas = Router();
  rotas.use(autenticar);
  rotas.use(exigirPerfil(PerfilUsuario.ADMIN, PerfilUsuario.OPERADOR));

  rotas.get("/", controlador.listar);
  rotas.get("/:id", controlador.obter);
  rotas.post("/", controlador.criar);
  rotas.put("/:id", controlador.atualizar);
  rotas.delete("/:id", controlador.excluir);

  return rotas;
}
