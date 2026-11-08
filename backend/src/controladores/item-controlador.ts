import type { Request, Response } from "express";
import { validarDadosItem } from "../dtos/item-dto";
import type { ItemServico } from "../servicos/item-servico";
import { lerId, lerPaginacao } from "../utils/paginacao";

export class ItemControlador {
  constructor(private readonly servico: ItemServico) {}

  listar = async (req: Request, res: Response): Promise<void> => {
    res.json(await this.servico.listar(lerPaginacao(req.query)));
  };

  obter = async (req: Request, res: Response): Promise<void> => {
    res.json(await this.servico.obter(lerId(req.params.id)));
  };

  criar = async (req: Request, res: Response): Promise<void> => {
    res.status(201).json(await this.servico.criar(validarDadosItem(req.body)));
  };

  atualizar = async (req: Request, res: Response): Promise<void> => {
    res.json(await this.servico.atualizar(lerId(req.params.id), validarDadosItem(req.body)));
  };

  excluir = async (req: Request, res: Response): Promise<void> => {
    await this.servico.excluir(lerId(req.params.id));
    res.status(204).send();
  };
}
