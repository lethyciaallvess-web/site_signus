import type { Request, Response } from "express";
import { validarDadosEvento } from "../dtos/evento-dto";
import { obterUsuarioAutenticado } from "../middlewares/autenticar";
import type { EventoServico } from "../servicos/evento-servico";
import { lerId, lerPaginacao } from "../utils/paginacao";

export class EventoControlador {
  constructor(private readonly servico: EventoServico) {}

  listar = async (req: Request, res: Response): Promise<void> => {
    res.json(await this.servico.listar(lerPaginacao(req.query)));
  };

  obter = async (req: Request, res: Response): Promise<void> => {
    res.json(await this.servico.obter(lerId(req.params.id)));
  };

  criar = async (req: Request, res: Response): Promise<void> => {
    const { id: usuarioId } = obterUsuarioAutenticado(req);
    res.status(201).json(await this.servico.criar(validarDadosEvento(req.body), usuarioId));
  };

  atualizar = async (req: Request, res: Response): Promise<void> => {
    res.json(await this.servico.atualizar(lerId(req.params.id), validarDadosEvento(req.body)));
  };

  excluir = async (req: Request, res: Response): Promise<void> => {
    await this.servico.excluir(lerId(req.params.id));
    res.status(204).send();
  };
}
