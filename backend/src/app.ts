import cors from "cors";
import express, { Router } from "express";
import type { Express } from "express";
import { join } from "node:path";
import type { DataSource } from "typeorm";
import { AutenticacaoControlador } from "./controladores/autenticacao-controlador";
import { UsuarioControlador } from "./controladores/usuario-controlador";
import { Usuario } from "./entidades/usuario";
import { rotaNaoEncontrada, tratarErros } from "./middlewares/tratar-erros";
import { UsuarioRepositorio } from "./repositorios/usuario-repositorio";
import { criarRotasAutenticacao } from "./rotas/autenticacao-rotas";
import { criarRotasUsuario } from "./rotas/usuario-rotas";
import { AutenticacaoServico } from "./servicos/autenticacao-servico";
import { UsuarioServico } from "./servicos/usuario-servico";

export function criarApp(fonteDeDados: DataSource): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use("/img", express.static(join(process.cwd(), "src", "img")));

  const usuarioRepositorio = new UsuarioRepositorio(
    fonteDeDados.getRepository(Usuario),
  );

  const autenticacaoControlador = new AutenticacaoControlador(
    new AutenticacaoServico(usuarioRepositorio),
  );
  const usuarioControlador = new UsuarioControlador(
    new UsuarioServico(usuarioRepositorio),
  );

  const api = Router();
  api.use("/autenticacao", criarRotasAutenticacao(autenticacaoControlador));
  api.use("/usuarios", criarRotasUsuario(usuarioControlador));
  app.use("/api", api);

  app.use(rotaNaoEncontrada);
  app.use(tratarErros);

  return app;
}