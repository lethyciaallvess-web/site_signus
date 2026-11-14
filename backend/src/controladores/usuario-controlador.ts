import type { Request, Response } from "express";
import { validarDadosAtualizarUsuario } from "../dtos/atualizar-usuario-dto";
import { validarDadosCriarFuncionario } from "../dtos/criar-funcionario-dto";
import { validarDadosCriarUsuario } from "../dtos/criar-usuario-dto";
import { obterUsuarioAutenticado } from "../middlewares/autenticar";
import type { UsuarioServico } from "../servicos/usuario-servico";
import { lerPaginacao } from "../utils/paginacao";

export class UsuarioControlador {
  constructor(private readonly servico: UsuarioServico) {}

  cadastrar = async (req: Request, res: Response): Promise<void> => {
    const dados = validarDadosCriarUsuario(req.body);
    res.status(201).json(await this.servico.cadastrar(dados));
  };

  listarEquipe = async (req: Request, res: Response): Promise<void> => {
    res.status(200).json(await this.servico.listarEquipe(lerPaginacao(req.query)));
  };

  criarFuncionario = async (req: Request, res: Response): Promise<void> => {
    const dados = validarDadosCriarFuncionario(req.body);
    res.status(201).json(await this.servico.criarFuncionario(dados));
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