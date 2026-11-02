import { Router } from "express";
import type { UsuarioControlador } from "../controladores/usuario-controlador";
import { autenticar } from "../middlewares/autenticar";

export function criarRotasUsuario(controlador: UsuarioControlador): Router {
  const rotas = Router();

  rotas.post("/", controlador.cadastrar); 
  rotas.get("/me", autenticar, controlador.obterProprio);
  rotas.put("/me", autenticar, controlador.atualizarProprio);

  return rotas;
}