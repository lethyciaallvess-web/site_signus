import type {
  Attributes,
  CreationAttributes,
  Includeable,
  Model,
  ModelStatic,
  Transaction,
  WhereOptions,
} from "sequelize";
import type { EstadoBase } from "../entidades/entidade-base";
import { RecursoNaoEncontradoErro } from "../erros/erros-http";
import type { ParametrosPaginacao } from "../utils/paginacao";

export type ValoresModelo<M extends Model> = CreationAttributes<M> & Partial<Attributes<M>>;

export interface RepositorioCrud<T> {
  listarPaginado(paginacao: ParametrosPaginacao): Promise<[T[], number]>;
  buscarPorId(id: number): Promise<T | null>;
  salvar(entidade: T): Promise<T>;
  excluir(entidade: T): Promise<void>;
}

export function lerEstadoBase(registro: {
  id: number;
  criadoEm: Date;
  atualizadoEm: Date;
}): EstadoBase {
  return {
    id: Number(registro.id),
    criadoEm: registro.criadoEm,
    atualizadoEm: registro.atualizadoEm,
  };
}

export abstract class RepositorioBase<T extends { readonly id: number }, M extends Model>
  implements RepositorioCrud<T> {
  protected abstract readonly ordenarPor: string;
  protected readonly direcao: "ASC" | "DESC" = "ASC";

  constructor(protected readonly modelo: ModelStatic<M>) { }

  protected abstract paraEntidade(registro: M): T;

  protected abstract paraValores(entidade: T): ValoresModelo<M>;

  protected inclusoes(): Includeable[] {
    return [];
  }

  protected async buscarUm(
    where: WhereOptions<Attributes<M>>,
    transaction?: Transaction,
  ): Promise<T | null> {
    const registro = await this.modelo.findOne({ where, include: this.inclusoes(), transaction });
    return registro ? this.paraEntidade(registro) : null;
  }

  protected filtroBusca(_termo: string): WhereOptions<Attributes<M>> | undefined {
    return undefined;
  }

  async listarPaginado({ pagina, limite, busca }: ParametrosPaginacao): Promise<[T[], number]> {
    const { rows, count } = await this.modelo.findAndCountAll({
      where: busca ? this.filtroBusca(busca) : undefined,
      include: this.inclusoes(),
      order: [
        [this.ordenarPor, this.direcao],
        ["id", this.direcao],
      ],
      offset: (pagina - 1) * limite,
      limit: limite,
      distinct: true,
    });
    return [rows.map((r) => this.paraEntidade(r)), count];
  }

  async buscarPorId(id: number, transaction?: Transaction): Promise<T | null> {
    const registro = await this.modelo.findByPk(id, { include: this.inclusoes(), transaction });
    return registro ? this.paraEntidade(registro) : null;
  }

  async salvar(entidade: T, transaction?: Transaction): Promise<T> {
    const valores = this.paraValores(entidade);
    let id: number | undefined = entidade.id;

    if (id === undefined || id === null) {
      const criado = await this.modelo.create(valores, { transaction });
      id = Number(criado.get("id"));
    } else {
      const registro = await this.modelo.findByPk(id, { transaction });
      if (!registro) throw new RecursoNaoEncontradoErro("Registro não encontrado.");
      registro.set(valores);
      if (registro.changed()) await registro.save({ transaction });
    }

    const salvo = await this.buscarPorId(id, transaction);
    if (!salvo) throw new RecursoNaoEncontradoErro("Registro não encontrado.");
    return salvo;
  }

  async excluir(entidade: T): Promise<void> {
    const registro = await this.modelo.findByPk(entidade.id);
    if (!registro) throw new RecursoNaoEncontradoErro("Registro não encontrado.");
    await registro.destroy();
  }
}
