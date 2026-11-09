import type { Request, Response } from "express";
import { validarDadosPlano } from "../dtos/plano-dto";
import type { PlanoServico } from "../servicos/plano-servico";
import { lerId, lerPaginacao } from "../utils/paginacao";

export class PlanoControlador {
  constructor(private readonly servico: PlanoServico) {}

  listar = async (req: Request, res: Response): Promise<void> => {
    res.json(await this.servico.listar(lerPaginacao(req.query)));
  };

  obter = async (req: Request, res: Response): Promise<void> => {
    res.json(await this.servico.obter(lerId(req.params.id)));
  };

  criar = async (req: Request, res: Response): Promise<void> => {
    res.status(201).json(await this.servico.criar(validarDadosPlano(req.body)));
  };

  atualizar = async (req: Request, res: Response): Promise<void> => {
    res.json(await this.servico.atualizar(lerId(req.params.id), validarDadosPlano(req.body)));
  };

  excluir = async (req: Request, res: Response): Promise<void> => {
    await this.servico.excluir(lerId(req.params.id));
    res.status(204).send();
  };
}
