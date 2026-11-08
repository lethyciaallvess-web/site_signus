import type { ObjectLiteral, Repository, SelectQueryBuilder } from "typeorm";
import type { ParametrosPaginacao } from "../utils/paginacao";

export abstract class RepositorioBase<T extends ObjectLiteral & { id: number }> {
  protected abstract readonly alias: string;
  protected abstract readonly ordenarPor: string;

  constructor(protected readonly repositorio: Repository<T>) {}

  protected consultaBase(): SelectQueryBuilder<T> {
    return this.repositorio.createQueryBuilder(this.alias);
  }

  async listarPaginado({ pagina, limite }: ParametrosPaginacao): Promise<[T[], number]> {
    return this.consultaBase()
      .orderBy(`${this.alias}.${this.ordenarPor}`, "ASC")
      .addOrderBy(`${this.alias}.id`, "ASC")
      .skip((pagina - 1) * limite)
      .take(limite)
      .getManyAndCount();
  }

  buscarPorId(id: number): Promise<T | null> {
    return this.consultaBase().where(`${this.alias}.id = :id`, { id }).getOne();
  }

  salvar(entidade: T): Promise<T> {
    return this.repositorio.save(entidade);
  }

  async excluir(entidade: T): Promise<void> {
    await this.repositorio.remove(entidade);
  }
}
