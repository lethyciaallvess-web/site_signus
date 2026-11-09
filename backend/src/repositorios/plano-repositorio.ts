import { Plano } from "../entidades/plano";
import { RepositorioBase } from "./repositorio-base";

export interface LinhaItemPlano {
  planoId: number;
  itemId: number;
  codigo: string;
  nome: string;
  categoria: string;
  quantidade: number;
}

export class PlanoRepositorio extends RepositorioBase<Plano> {
  protected readonly alias = "plano";
  protected readonly ordenarPor = "_nome";

  buscarPorNome(nome: string): Promise<Plano | null> {
    return this.consultaBase().where("plano._nome = :nome", { nome }).getOne();
  }

  async listarItens(planoIds: number[]): Promise<LinhaItemPlano[]> {
    if (planoIds.length === 0) return [];
    const linhas: Record<string, unknown>[] = await this.repositorio.query(
      `SELECT pi.plano_id AS planoId, i.id AS itemId, i.codigo, i.nome, i.categoria, pi.quantidade
         FROM plano_itens pi
         JOIN itens i ON i.id = pi.itens_id
        WHERE pi.plano_id IN (?)
        ORDER BY i.nome`,
      [planoIds],
    );
    return linhas.map((l) => ({
      planoId: Number(l.planoId),
      itemId: Number(l.itemId),
      codigo: String(l.codigo),
      nome: String(l.nome),
      categoria: String(l.categoria),
      quantidade: Number(l.quantidade),
    }));
  }

  async contarItensExistentes(itemIds: number[]): Promise<number> {
    if (itemIds.length === 0) return 0;
    const [linha] = await this.repositorio.query(
      "SELECT COUNT(*) AS total FROM itens WHERE id IN (?)",
      [itemIds],
    );
    return Number(linha.total);
  }

  /** Salva o plano e substitui a lista de itens dele numa única transação. */
  salvarComItens(
    plano: Plano,
    itens: { itemId: number; quantidade: number }[],
  ): Promise<Plano> {
    return this.repositorio.manager.transaction(async (manager) => {
      const salvo = await manager.save(plano);
      await manager.query("DELETE FROM plano_itens WHERE plano_id = ?", [salvo.id]);
      for (const { itemId, quantidade } of itens) {
        await manager.query(
          "INSERT INTO plano_itens (plano_id, itens_id, quantidade) VALUES (?, ?, ?)",
          [salvo.id, itemId, quantidade],
        );
      }
      return salvo;
    });
  }
}
