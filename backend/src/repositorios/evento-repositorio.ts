import type { SelectQueryBuilder } from "typeorm";
import { Evento } from "../entidades/evento";
import { Usuario } from "../entidades/usuario";
import { RepositorioBase } from "./repositorio-base";

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

export class EventoRepositorio extends RepositorioBase<Evento> {
  protected readonly alias = "evento";
  protected readonly ordenarPor = "_dataInicio";
  protected readonly direcao = "DESC";

  /** Toda consulta de evento já traz o cliente e o plano vinculados. */
  protected override consultaBase(): SelectQueryBuilder<Evento> {
    return super
      .consultaBase()
      .leftJoinAndSelect("evento.cliente", "cliente")
      .leftJoinAndSelect("evento.plano", "plano");
  }

  buscarUsuario(id: number): Promise<Usuario | null> {
    return this.repositorio.manager.getRepository(Usuario).findOneBy({ id });
  }

  async contarItensExistentes(itemIds: number[]): Promise<number> {
    if (itemIds.length === 0) return 0;
    const [linha] = await this.repositorio.query(
      "SELECT COUNT(*) AS total FROM itens WHERE id IN (?)",
      [itemIds],
    );
    return Number(linha.total);
  }

  async listarItensExtras(eventoIds: number[]): Promise<LinhaItemEvento[]> {
    if (eventoIds.length === 0) return [];
    const linhas: Record<string, unknown>[] = await this.repositorio.query(
      `SELECT ei.evento_id AS eventoId, i.id AS itemId, i.codigo, i.nome, i.categoria, ei.quantidade
         FROM evento_itens ei
         JOIN itens i ON i.id = ei.itens_id
        WHERE ei.evento_id IN (?)
        ORDER BY i.nome`,
      [eventoIds],
    );
    return linhas.map((l) => ({
      eventoId: Number(l.eventoId),
      itemId: Number(l.itemId),
      codigo: String(l.codigo),
      nome: String(l.nome),
      categoria: String(l.categoria),
      quantidade: Number(l.quantidade),
    }));
  }

  /** Salva o evento e substitui os itens extras numa única transação. */
  salvarComItens(evento: Evento, itens: ItemExtra[]): Promise<Evento> {
    return this.repositorio.manager.transaction(async (manager) => {
      const salvo = await manager.save(evento);
      await manager.query("DELETE FROM evento_itens WHERE evento_id = ?", [salvo.id]);
      for (const { itemId, quantidade } of itens) {
        await manager.query(
          "INSERT INTO evento_itens (evento_id, itens_id, quantidade) VALUES (?, ?, ?)",
          [salvo.id, itemId, quantidade],
        );
      }
      return salvo;
    });
  }
}
