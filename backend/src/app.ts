import cors from "cors";
import express, { Router } from "express";
import type { Express } from "express";
import { join } from "node:path";
import type { DataSource } from "typeorm";
import { AutenticacaoControlador } from "./controladores/autenticacao-controlador";
import { ItemControlador } from "./controladores/item-controlador";
import { UsuarioControlador } from "./controladores/usuario-controlador";
import { Item } from "./entidades/item";
import { Usuario } from "./entidades/usuario";
import { rotaNaoEncontrada, tratarErros } from "./middlewares/tratar-erros";
import { ItemRepositorio } from "./repositorios/item-repositorio";
import { UsuarioRepositorio } from "./repositorios/usuario-repositorio";
import { criarRotasCliente } from "./rotas/cliente-rotas";
import { criarRotasAutenticacao } from "./rotas/autenticacao-rotas";
import { criarRotasItem } from "./rotas/item-rotas";
import { criarRotasUsuario } from "./rotas/usuario-rotas";
import { AutenticacaoServico } from "./servicos/autenticacao-servico";
import { ItemServico } from "./servicos/item-servico";
import { UsuarioServico } from "./servicos/usuario-servico";

export function criarApp(fonteDeDados: DataSource): Express {
  const app = express();
  app.locals.fonteDeDados = fonteDeDados;

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
  const itemControlador = new ItemControlador(
    new ItemServico(new ItemRepositorio(fonteDeDados.getRepository(Item))),
  );

  const api = Router();
  api.use("/autenticacao", criarRotasAutenticacao(autenticacaoControlador));
  api.use("/usuarios", criarRotasUsuario(usuarioControlador));
  api.use("/cliente", criarRotasCliente(fonteDeDados));
  api.use("/itens", criarRotasItem(itemControlador));
  app.use("/api", api);

  app.use(rotaNaoEncontrada);
  app.use(tratarErros);

  return app;
}