import { sequelize } from "../config/banco";
import { Plano } from "../entidades/plano";
import { ItemModelo, PlanoItemModelo, PlanoModelo } from "../modelos";
import { decimalParaNumero } from "../utils/transformador-decimal";
import {
  lerEstadoBase,
  RepositorioBase,
  type RepositorioCrud,
  type ValoresModelo,
} from "./repositorio-base";

export interface LinhaItemPlano {
  planoId: number;
  itemId: number;
  codigo: string;
  nome: string;
  categoria: string;
  quantidade: number;
}

export interface ItemDoPlanoParaSalvar {
  itemId: number;
  quantidade: number;
}

export interface RepositorioDePlanos extends RepositorioCrud<Plano> {
  buscarPorNome(nome: string): Promise<Plano | null>;
  listarItens(planoIds: number[]): Promise<LinhaItemPlano[]>;
  contarItensExistentes(itemIds: number[]): Promise<number>;
  salvarComItens(plano: Plano, itens: ItemDoPlanoParaSalvar[]): Promise<Plano>;
}

export function planoDoRegistro(registro: PlanoModelo): Plano {
  return Plano.restaurar({
    ...lerEstadoBase(registro),
    nome: registro.nome,
    descricao: registro.descricao,
    valorBase: decimalParaNumero(registro.valorBase),
    ativo: Boolean(registro.ativo),
  });
}

export class PlanoRepositorio
  extends RepositorioBase<Plano, PlanoModelo>
  implements RepositorioDePlanos
{
  protected readonly ordenarPor = "nome";

  constructor(modelo: typeof PlanoModelo = PlanoModelo) {
    super(modelo);
  }

  protected paraEntidade(registro: PlanoModelo): Plano {
    return planoDoRegistro(registro);
  }

  protected paraValores(plano: Plano): ValoresModelo<PlanoModelo> {
    return { ...plano.paraPersistencia() };
  }

  buscarPorNome(nome: string): Promise<Plano | null> {
    return this.buscarUm({ nome });
  }

  async listarItens(planoIds: number[]): Promise<LinhaItemPlano[]> {
    if (planoIds.length === 0) return [];
    const linhas = await PlanoItemModelo.findAll({
      where: { planoId: planoIds },
      include: [{ model: ItemModelo, as: "item", required: true }],
      order: [[{ model: ItemModelo, as: "item" }, "nome", "ASC"]],
    });
    return linhas.flatMap(({ planoId, quantidade, item }) =>
      item
        ? [
            {
              planoId: Number(planoId),
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

  async contarItensExistentes(itemIds: number[]): Promise<number> {
    if (itemIds.length === 0) return 0;
    return ItemModelo.count({ where: { id: itemIds } });
  }

  /** Salva o plano e substitui a lista de itens dele numa única transação. */
  salvarComItens(
    plano: Plano,
    itens: ItemDoPlanoParaSalvar[],
  ): Promise<Plano> {
    return sequelize.transaction(async (transaction) => {
      const salvo = await this.salvar(plano, transaction);
      await PlanoItemModelo.destroy({ where: { planoId: salvo.id }, transaction });
      for (const { itemId, quantidade } of itens) {
        await PlanoItemModelo.create(
          { planoId: salvo.id, itemId, quantidade },
          { transaction },
        );
      }
      return salvo;
    });
  }
}
