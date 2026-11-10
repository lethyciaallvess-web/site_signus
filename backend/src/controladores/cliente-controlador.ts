import type { Request, Response } from "express";
import { validarDadosCliente } from "../dtos/cliente-dto";
import type { ClienteServico } from "../servicos/cliente-servico";
import { lerId, lerPaginacao } from "../utils/paginacao";

export class ClienteControlador {
  constructor(private readonly servico: ClienteServico) {}

  listar = async (req: Request, res: Response): Promise<void> => {
    res.json(await this.servico.listar(lerPaginacao(req.query)));
  };

  obter = async (req: Request, res: Response): Promise<void> => {
    res.json(await this.servico.obter(lerId(req.params.id)));
  };

  criar = async (req: Request, res: Response): Promise<void> => {
    res.status(201).json(await this.servico.criar(validarDadosCliente(req.body)));
  };

  atualizar = async (req: Request, res: Response): Promise<void> => {
    res.json(await this.servico.atualizar(lerId(req.params.id), validarDadosCliente(req.body)));
  };

  excluir = async (req: Request, res: Response): Promise<void> => {
    await this.servico.excluir(lerId(req.params.id));
    res.status(204).send();
  };
}
