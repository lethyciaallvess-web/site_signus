import { type Includeable, Op, type WhereOptions } from "sequelize";
import { sequelize } from "../config/banco";
import { Evento, type StatusEvento } from "../entidades/evento";
import type { Usuario } from "../entidades/usuario";
import {
  ClienteModelo,
  EventoItemModelo,
  EventoModelo,
  ItemModelo,
  PlanoModelo,
  UsuarioModelo,
} from "../modelos";
import { decimalParaNumero } from "../utils/transformador-decimal";
import { clienteDoRegistro } from "./cliente-repositorio";
import { planoDoRegistro } from "./plano-repositorio";
import {
  lerEstadoBase,
  RepositorioBase,
  type RepositorioCrud,
  type ValoresModelo,
} from "./repositorio-base";
import { usuarioDoRegistro } from "./usuario-repositorio";

export interface LinhaItemEvento {
  eventoId: number;
  itemId: number;
  codigo: string;
  nome: string;
  categoria: string;
  quantidade: number;
}

export interface ItemExtra {
  itemId: number;
  quantidade: number;
}

export interface EventoDoCliente {
  id: number;
  nome: string;
  dataInicio: Date;
  dataFim: Date;
  localEvento: string;
  status: StatusEvento;
  valor: number | null;
  plano: string | null;
}

export interface RepositorioDeEventos extends RepositorioCrud<Evento> {
  buscarUsuario(id: number): Promise<Usuario | null>;
  contarItensExistentes(itemIds: number[]): Promise<number>;
  listarItensExtras(eventoIds: number[]): Promise<LinhaItemEvento[]>;
  listarDoCliente(clienteId: number): Promise<EventoDoCliente[]>;
  salvarComItens(evento: Evento, itens: ItemExtra[]): Promise<Evento>;
}

export class EventoRepositorio
  extends RepositorioBase<Evento, EventoModelo>
  implements RepositorioDeEventos {
  protected readonly ordenarPor = "dataInicio";
  protected readonly direcao = "DESC";

  constructor(modelo: typeof EventoModelo = EventoModelo) {
    super(modelo);
  }

  protected override inclusoes(): Includeable[] {
    return [
      { model: ClienteModelo, as: "cliente", required: false },
      { model: PlanoModelo, as: "plano", required: false },
    ];
  }

  protected override filtroBusca(termo: string): WhereOptions<EventoModelo> {
    return {
      [Op.or]: [
        { nome: { [Op.like]: `%${termo}%` } },
        { localEvento: { [Op.like]: `%${termo}%` } },
        { "$cliente.nome$": { [Op.like]: `%${termo}%` } },
      ],
    };
  }

  protected paraEntidade(registro: EventoModelo): Evento {
    return Evento.restaurar(
      {
        ...lerEstadoBase(registro),
        clienteId: Number(registro.clienteId),
        planoId: registro.planoId === null ? null : Number(registro.planoId),
        criadoPorUsuarioId: Number(registro.criadoPorUsuarioId),
        nome: registro.nome,
        dataInicio: registro.dataInicio,
        dataFim: registro.dataFim,
        localEvento: registro.localEvento,
        status: registro.status,
        valorNegociado: decimalParaNumero(registro.valorNegociado),
        observacoes: registro.observacoes,
      },
      {
        cliente: registro.cliente ? clienteDoRegistro(registro.cliente) : undefined,
        plano: registro.plano ? planoDoRegistro(registro.plano) : null,
      },
    );
  }

  protected paraValores(evento: Evento): ValoresModelo<EventoModelo> {
    return { ...evento.paraPersistencia() };
  }

  async buscarUsuario(id: number): Promise<Usuario | null> {
    const registro = await UsuarioModelo.findByPk(id);
    return registro ? usuarioDoRegistro(registro) : null;
  }

  async contarItensExistentes(itemIds: number[]): Promise<number> {
    if (itemIds.length === 0) return 0;
    return ItemModelo.count({ where: { id: itemIds } });
  }

  async listarItensExtras(eventoIds: number[]): Promise<LinhaItemEvento[]> {
    if (eventoIds.length === 0) return [];
    const linhas = await EventoItemModelo.findAll({
      where: { eventoId: eventoIds },
      include: [{ model: ItemModelo, as: "item", required: true }],
      order: [[{ model: ItemModelo, as: "item" }, "nome", "ASC"]],
    });
    return linhas.flatMap(({ eventoId, quantidade, item }) =>
      item
        ? [
          {
            eventoId: Number(eventoId),
            itemId: Number(item.id),
            codigo: item.codigo,
            nome: item.nome,
            categoria: item.categoria,
            quantidade: Number(quantidade),
          },
        ]
        : [],
    );
  }

  async listarDoCliente(clienteId: number): Promise<EventoDoCliente[]> {
    const registros = await EventoModelo.findAll({
      where: { clienteId },
      include: [{ model: PlanoModelo, as: "plano", required: false, attributes: ["nome"] }],
      order: [
        ["dataInicio", "DESC"],
        ["id", "DESC"],
      ],
    });
    return registros.map((e) => ({
      id: Number(e.id),
      nome: e.nome,
      dataInicio: e.dataInicio,
      dataFim: e.dataFim,
      localEvento: e.localEvento,
      status: e.status,
      valor: decimalParaNumero(e.valorNegociado),
      plano: e.plano ? e.plano.nome : null,
    }));
  }

  /** Salva o evento e substitui os itens extras numa única transação. */
  salvarComItens(evento: Evento, itens: ItemExtra[]): Promise<Evento> {
    return sequelize.transaction(async (transaction) => {
      const salvo = await this.salvar(evento, transaction);
      await EventoItemModelo.destroy({ where: { eventoId: salvo.id }, transaction });
      for (const { itemId, quantidade } of itens) {
        await EventoItemModelo.create(
          { eventoId: salvo.id, itemId, quantidade },
          { transaction },
        );
      }
      return salvo;
    });
  }
}
