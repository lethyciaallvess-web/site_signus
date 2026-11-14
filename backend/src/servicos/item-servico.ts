import type { DadosItem } from "../dtos/item-dto";
import { Item } from "../entidades/item";
import { ConflitoErro, RecursoNaoEncontradoErro } from "../erros/erros-http";
import type { RepositorioDeItens } from "../repositorios/item-repositorio";
import { codigoErroBanco } from "../utils/erros-banco";
import { montarPagina, type Pagina, type ParametrosPaginacao } from "../utils/paginacao";

export interface ItemPublico {
  id: number;
  codigo: string;
  nome: string;
  categoria: string;
  quantidadeTotal: number;
  descricao: string | null;
  ativo: boolean;
  imagem: string | null;
}

function paraPublico(item: Item): ItemPublico {
  return {
    id: Number(item.id),
    codigo: item.codigo,
    nome: item.nome,
    categoria: item.categoria,
    quantidadeTotal: item.quantidadeTotal,
    descricao: item.descricao,
    ativo: item.ativo,
    imagem: item.imagem,
  };
}

export class ItemServico {
  constructor(private readonly itens: RepositorioDeItens) {}

  async listar(paginacao: ParametrosPaginacao): Promise<Pagina<ItemPublico>> {
    const [itens, total] = await this.itens.listarPaginado(paginacao);
    return montarPagina(itens.map(paraPublico), total, paginacao);
  }

  async obter(id: number): Promise<ItemPublico> {
    return paraPublico(await this.buscarOuFalhar(id));
  }

  async criar(dados: DadosItem): Promise<ItemPublico> {
    await this.garantirCodigoLivre(dados.codigo);
    const item = new Item(dados);
    this.aplicar(item, dados);
    return paraPublico(await this.itens.salvar(item));
  }

  async atualizar(id: number, dados: DadosItem): Promise<ItemPublico> {
    const item = await this.buscarOuFalhar(id);
    await this.garantirCodigoLivre(dados.codigo, item.id);
    item.codigo = dados.codigo;
    item.nome = dados.nome;
    item.categoria = dados.categoria;
    if (dados.quantidadeTotal !== undefined) item.quantidadeTotal = dados.quantidadeTotal;
    this.aplicar(item, dados);
    return paraPublico(await this.itens.salvar(item));
  }

  async excluir(id: number): Promise<void> {
    const item = await this.buscarOuFalhar(id);
    try {
      await this.itens.excluir(item);
    } catch (erro) {
      const codigo = codigoErroBanco(erro);
      if (codigo === "ER_ROW_IS_REFERENCED_2") {
        throw new ConflitoErro("Este item está em uso em planos ou eventos. Desative-o em vez de excluir.");
      }
      throw erro;
    }
  }

  private aplicar(item: Item, dados: DadosItem): void {
    item.descricao = dados.descricao;
    if (dados.ativo) item.ativar();
    else item.desativar();
  }

  private async garantirCodigoLivre(codigo: string, idAtual?: number): Promise<void> {
    const existente = await this.itens.buscarPorCodigo(codigo);
    if (existente && Number(existente.id) !== Number(idAtual)) {
      throw new ConflitoErro("Já existe um item com esse código.");
    }
  }

  private async buscarOuFalhar(id: number): Promise<Item> {
    const item = await this.itens.buscarPorId(id);
    if (!item) throw new RecursoNaoEncontradoErro("Item não encontrado.");
    return item;
  }
}
