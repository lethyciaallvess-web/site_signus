import { Router } from "express";
import type { PlanoControlador } from "../controladores/plano-controlador";
import { PerfilUsuario } from "../entidades/usuario";
import { autenticar, exigirPerfil } from "../middlewares/autenticar";

export function criarRotasPlano(controlador: PlanoControlador): Router {
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
