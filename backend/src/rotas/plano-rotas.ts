import { Router } from "express";
import type { PlanoControlador } from "../controladores/plano-controlador";
import { autenticar } from "../middlewares/autenticar";

export function criarRotasPlano(controlador: PlanoControlador): Router {
  const rotas = Router();
  rotas.use(autenticar);

  rotas.get("/", controlador.listar);
  rotas.get("/:id", controlador.obter);
  rotas.post("/", controlador.criar);
  rotas.put("/:id", controlador.atualizar);
  rotas.delete("/:id", controlador.excluir);

  return rotas;
}
