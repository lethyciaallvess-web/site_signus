import { Router } from "express";
import type { ItemControlador } from "../controladores/item-controlador";
import { autenticar } from "../middlewares/autenticar";

export function criarRotasItem(controlador: ItemControlador): Router {
  const rotas = Router();
  rotas.use(autenticar);

  rotas.get("/", controlador.listar);
  rotas.get("/:id", controlador.obter);
  rotas.post("/", controlador.criar);
  rotas.put("/:id", controlador.atualizar);
  rotas.delete("/:id", controlador.excluir);

  return rotas;
}
