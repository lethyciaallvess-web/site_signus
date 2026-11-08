import { Item } from "../entidades/item";
import { RepositorioBase } from "./repositorio-base";

export class ItemRepositorio extends RepositorioBase<Item> {
  protected readonly alias = "item";
  protected readonly ordenarPor = "_nome";

  buscarPorCodigo(codigo: string): Promise<Item | null> {
    return this.consultaBase().where("item._codigo = :codigo", { codigo }).getOne();
  }
}
