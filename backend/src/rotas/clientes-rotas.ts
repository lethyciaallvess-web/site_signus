import { Router } from "express";
import type { ClienteControlador } from "../controladores/cliente-controlador";
import { autenticar } from "../middlewares/autenticar";

export function criarRotasClientes(controlador: ClienteControlador): Router {
  const rotas = Router();
  rotas.use(autenticar);

  rotas.get("/", controlador.listar);
  rotas.get("/:id", controlador.obter);
  rotas.post("/", controlador.criar);
  rotas.put("/:id", controlador.atualizar);
  rotas.delete("/:id", controlador.excluir);

  return rotas;
}
