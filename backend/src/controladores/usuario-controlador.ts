import type { Request, Response } from "express";
import { validarDadosAtualizarUsuario } from "../dtos/atualizar-usuario-dto";
import { validarDadosCriarFuncionario } from "../dtos/criar-funcionario-dto";
import { validarDadosCriarUsuario } from "../dtos/criar-usuario-dto";
import { obterUsuarioAutenticado } from "../middlewares/autenticar";
import type { UsuarioServico } from "../servicos/usuario-servico";
import { lerId, lerPaginacao } from "../utils/paginacao";
import { validarEmail, validarNome } from "../dtos/campos-usuario";
import { RequisicaoInvalidaErro } from "../erros/erros-http";

export class UsuarioControlador {
  constructor(private readonly servico: UsuarioServico) { }

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

  obterFuncionario = async (req: Request, res: Response): Promise<void> => {
    res.status(200).json(await this.servico.obterFuncionario(lerId(req.params.id)));
  };

  atualizarFuncionario = async (req: Request, res: Response): Promise<void> => {
    const erros: string[] = [];
    const nome = validarNome(req.body?.nome, erros);
    const email = validarEmail(req.body?.email, erros);
    if (erros.length > 0) {
      throw new RequisicaoInvalidaErro("Dados do funcionário inválidos.", erros);
    }
    res.status(200).json(await this.servico.atualizarFuncionario(lerId(req.params.id), nome, email));
  };

  excluirFuncionario = async (req: Request, res: Response): Promise<void> => {
    await this.servico.excluirFuncionario(lerId(req.params.id));
    res.status(204).send();
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