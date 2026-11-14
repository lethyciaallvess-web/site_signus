import { Item } from "../entidades/item";
import { ItemModelo } from "../modelos";
import {
  lerEstadoBase,
  RepositorioBase,
  type RepositorioCrud,
  type ValoresModelo,
} from "./repositorio-base";

export interface RepositorioDeItens extends RepositorioCrud<Item> {
  buscarPorCodigo(codigo: string): Promise<Item | null>;
}

export class ItemRepositorio
  extends RepositorioBase<Item, ItemModelo>
  implements RepositorioDeItens
{
  protected readonly ordenarPor = "nome";

  constructor(modelo: typeof ItemModelo = ItemModelo) {
    super(modelo);
  }

  protected paraEntidade(registro: ItemModelo): Item {
    return Item.restaurar({
      ...lerEstadoBase(registro),
      codigo: registro.codigo,
      nome: registro.nome,
      categoria: registro.categoria,
      quantidadeTotal: Number(registro.quantidadeTotal),
      descricao: registro.descricao,
      ativo: Boolean(registro.ativo),
      imagem: registro.imagem,
    });
  }

  protected paraValores(item: Item): ValoresModelo<ItemModelo> {
    return { ...item.paraPersistencia() };
  }

  buscarPorCodigo(codigo: string): Promise<Item | null> {
    return this.buscarUm({ codigo });
  }
}
