import { Router } from "express";
import type { UsuarioControlador } from "../controladores/usuario-controlador";
import { PerfilUsuario } from "../entidades/usuario";
import { autenticar, exigirPerfil } from "../middlewares/autenticar";

export function criarRotasUsuario(controlador: UsuarioControlador): Router {
  const rotas = Router();

  rotas.post("/", controlador.cadastrar); 
  rotas.get("/equipe", autenticar, exigirPerfil(PerfilUsuario.ADMIN), controlador.listarEquipe);
  rotas.post("/equipe", autenticar, exigirPerfil(PerfilUsuario.ADMIN), controlador.criarFuncionario);
  rotas.get("/me", autenticar, controlador.obterProprio);
  rotas.patch("/me", autenticar, controlador.atualizarProprio);

  return rotas;
}