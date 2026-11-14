import type { DadosPlano } from "../dtos/plano-dto";
import { Plano } from "../entidades/plano";
import { ConflitoErro, RecursoNaoEncontradoErro } from "../erros/erros-http";
import type { LinhaItemPlano, RepositorioDePlanos } from "../repositorios/plano-repositorio";
import { codigoErroBanco } from "../utils/erros-banco";
import { montarPagina, type Pagina, type ParametrosPaginacao } from "../utils/paginacao";

export interface ItemPlanoPublico {
  itemId: number;
  codigo: string;
  nome: string;
  categoria: string;
  quantidade: number;
}

export interface PlanoPublico {
  id: number;
  nome: string;
  descricao: string | null;
  valorBase: number | null;
  ativo: boolean;
  itens: ItemPlanoPublico[];
}

function paraPublico(plano: Plano, linhas: LinhaItemPlano[]): PlanoPublico {
  const id = Number(plano.id);
  return {
    id,
    nome: plano.nome,
    descricao: plano.descricao,
    valorBase: plano.valorBase,
    ativo: plano.ativo,
    itens: linhas
      .filter((l) => l.planoId === id)
      .map(({ itemId, codigo, nome, categoria, quantidade }) => ({
        itemId, codigo, nome, categoria, quantidade,
      })),
  };
}

export class PlanoServico {
  constructor(private readonly planos: RepositorioDePlanos) {}

  async listar(paginacao: ParametrosPaginacao): Promise<Pagina<PlanoPublico>> {
    const [planos, total] = await this.planos.listarPaginado(paginacao);
    const linhas = await this.planos.listarItens(planos.map((p) => Number(p.id)));
    return montarPagina(planos.map((p) => paraPublico(p, linhas)), total, paginacao);
  }

  async obter(id: number): Promise<PlanoPublico> {
    return this.montar(await this.buscarOuFalhar(id));
  }

  async criar(dados: DadosPlano): Promise<PlanoPublico> {
    await this.validarRegras(dados);
    const plano = new Plano(dados);
    this.aplicarAtivo(plano, dados.ativo);
    return this.montar(await this.planos.salvarComItens(plano, dados.itens));
  }

  async atualizar(id: number, dados: DadosPlano): Promise<PlanoPublico> {
    const plano = await this.buscarOuFalhar(id);
    await this.validarRegras(dados, Number(plano.id));
    plano.nome = dados.nome;
    plano.descricao = dados.descricao;
    plano.valorBase = dados.valorBase;
    this.aplicarAtivo(plano, dados.ativo);
    return this.montar(await this.planos.salvarComItens(plano, dados.itens));
  }

  async excluir(id: number): Promise<void> {
    const plano = await this.buscarOuFalhar(id);
    try {
      await this.planos.excluir(plano);
    } catch (erro) {
      const codigo = codigoErroBanco(erro);
      if (codigo === "ER_ROW_IS_REFERENCED_2") {
        throw new ConflitoErro("Este plano está em uso em eventos. Desative-o em vez de excluir.");
      }
      throw erro;
    }
  }

  private async montar(plano: Plano): Promise<PlanoPublico> {
    return paraPublico(plano, await this.planos.listarItens([Number(plano.id)]));
  }

  private aplicarAtivo(plano: Plano, ativo: boolean): void {
    if (ativo) plano.ativar();
    else plano.desativar();
  }

  private async validarRegras(dados: DadosPlano, idAtual?: number): Promise<void> {
    const mesmoNome = await this.planos.buscarPorNome(dados.nome);
    if (mesmoNome && Number(mesmoNome.id) !== idAtual) {
      throw new ConflitoErro("Já existe um plano com esse nome.");
    }
    const ids = dados.itens.map((i) => i.itemId);
    if ((await this.planos.contarItensExistentes(ids)) !== ids.length) {
      throw new RecursoNaoEncontradoErro("Um ou mais itens do plano não existem.");
    }
  }

  private async buscarOuFalhar(id: number): Promise<Plano> {
    const plano = await this.planos.buscarPorId(id);
    if (!plano) throw new RecursoNaoEncontradoErro("Plano não encontrado.");
    return plano;
  }
}
