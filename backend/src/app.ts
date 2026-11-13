import cors from "cors";
import express, { Router } from "express";
import type { Express } from "express";
import { join } from "node:path";
import { AutenticacaoControlador } from "./controladores/autenticacao-controlador";
import { ItemControlador } from "./controladores/item-controlador";
import { UsuarioControlador } from "./controladores/usuario-controlador";
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
import { PlanoControlador } from "./controladores/plano-controlador";
import { PlanoRepositorio } from "./repositorios/plano-repositorio";
import { criarRotasPlano } from "./rotas/plano-rotas";
import { PlanoServico } from "./servicos/plano-servico";
import { ClienteControlador } from "./controladores/cliente-controlador";
import { ClienteRepositorio } from "./repositorios/cliente-repositorio";
import { criarRotasClientes } from "./rotas/clientes-rotas";
import { ClienteServico } from "./servicos/cliente-servico";
import { EventoControlador } from "./controladores/evento-controlador";
import { EventoRepositorio } from "./repositorios/evento-repositorio";
import { criarRotasEvento } from "./rotas/evento-rotas";
import { EventoServico } from "./servicos/evento-servico";

export function criarApp(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use("/img", express.static(join(process.cwd(), "src", "img")));

  const usuarioRepositorio = new UsuarioRepositorio();
  app.locals.usuarioRepositorio = usuarioRepositorio;

  const autenticacaoControlador = new AutenticacaoControlador(
    new AutenticacaoServico(usuarioRepositorio),
  );
  const usuarioControlador = new UsuarioControlador(
    new UsuarioServico(usuarioRepositorio),
  );
  const itemControlador = new ItemControlador(
    new ItemServico(new ItemRepositorio()),
  );
  const clienteRepositorio = new ClienteRepositorio();
  const planoRepositorio = new PlanoRepositorio();
  const eventoRepositorio = new EventoRepositorio();
  const planoControlador = new PlanoControlador(
    new PlanoServico(planoRepositorio)
  );
  const clienteControlador = new ClienteControlador(
    new ClienteServico(clienteRepositorio)
  );
  const eventoControlador = new EventoControlador(
    new EventoServico(
      eventoRepositorio,
      clienteRepositorio,
      planoRepositorio,
    ),
  );

  const api = Router();
  api.use("/autenticacao", criarRotasAutenticacao(autenticacaoControlador));
  api.use("/usuarios", criarRotasUsuario(usuarioControlador));
  api.use("/cliente", criarRotasCliente(usuarioRepositorio, eventoRepositorio));
  api.use("/itens", criarRotasItem(itemControlador));
  api.use("/planos", criarRotasPlano(planoControlador));
  api.use("/clientes", criarRotasClientes(clienteControlador));
  api.use("/eventos", criarRotasEvento(eventoControlador));
  app.use("/api", api);

  app.use(rotaNaoEncontrada);
  app.use(tratarErros);

  return app;
}