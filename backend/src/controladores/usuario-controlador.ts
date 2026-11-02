import type { Request, Response } from "express";
import { validarDadosAtualizarUsuario } from "../dtos/atualizar-usuario-dto";
import { validarDadosCriarUsuario } from "../dtos/criar-usuario-dto";
import { obterUsuarioAutenticado } from "../middlewares/autenticar";
import type { UsuarioServico } from "../servicos/usuario-servico";

export class UsuarioControlador {
  constructor(private readonly servico: UsuarioServico) {}

  cadastrar = async (req: Request, res: Response): Promise<void> => {
    const dados = validarDadosCriarUsuario(req.body);
    res.status(201).json(await this.servico.cadastrar(dados));
  };

  obterProprio = async (req: Request, res: Response): Promise<void> => {
    const { id } = obterUsuarioAutenticado(req);
    res.status(200).json(await this.servico.obterPorId(id));
  };

  atualizarProprio = async (req: Request, res: Response): Promise<void> => {
    const { id } = obterUsuarioAutenticado(req);
    const dados = validarDadosAtualizarUsuario(req.body);
    res.status(200).json(await this.servico.atualizar(id, dados));
  };
}