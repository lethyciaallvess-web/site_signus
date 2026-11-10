import type { DadosCliente } from "../dtos/cliente-dto";
import { Cliente } from "../entidades/cliente";
import { ConflitoErro, RecursoNaoEncontradoErro } from "../erros/erros-http";
import type { ClienteRepositorio } from "../repositorios/cliente-repositorio";
import { montarPagina, type Pagina, type ParametrosPaginacao } from "../utils/paginacao";

export interface ClientePublico {
  id: number;
  nome: string;
  documento: string;
  email: string;
  telefone: string;
  observacoes: string | null;
}

function paraPublico(cliente: Cliente): ClientePublico {
  return {
    id: Number(cliente.id),
    nome: cliente.nome,
    documento: cliente.documento,
    email: cliente.email,
    telefone: cliente.telefone,
    observacoes: cliente.observacoes,
  };
}

export class ClienteServico {
  constructor(private readonly clientes: ClienteRepositorio) {}

  async listar(paginacao: ParametrosPaginacao): Promise<Pagina<ClientePublico>> {
    const [clientes, total] = await this.clientes.listarPaginado(paginacao);
    return montarPagina(clientes.map(paraPublico), total, paginacao);
  }

  async obter(id: number): Promise<ClientePublico> {
    return paraPublico(await this.buscarOuFalhar(id));
  }

  async criar(dados: DadosCliente): Promise<ClientePublico> {
    await this.garantirDocumentoLivre(dados.documento);
    const cliente = new Cliente({ nome: dados.nome, email: dados.email, cpf: dados.documento });
    this.aplicarContato(cliente, dados);
    return paraPublico(await this.clientes.salvar(cliente));
  }

  async atualizar(id: number, dados: DadosCliente): Promise<ClientePublico> {
    const cliente = await this.buscarOuFalhar(id);
    await this.garantirDocumentoLivre(dados.documento, Number(cliente.id));
    cliente.nome = dados.nome;
    cliente.email = dados.email;
    cliente.documento = dados.documento;
    this.aplicarContato(cliente, dados);
    return paraPublico(await this.clientes.salvar(cliente));
  }

  async excluir(id: number): Promise<void> {
    const cliente = await this.buscarOuFalhar(id);
    try {
      await this.clientes.excluir(cliente);
    } catch (erro) {
      const codigo = (erro as { driverError?: { code?: string } }).driverError?.code;
      if (codigo === "ER_ROW_IS_REFERENCED_2") {
        throw new ConflitoErro(
          "Este cliente possui eventos ou acesso vinculado e não pode ser excluído.",
        );
      }
      throw erro;
    }
  }

  private aplicarContato(cliente: Cliente, dados: DadosCliente): void {
    cliente.telefone = dados.telefone;
    cliente.observacoes = dados.observacoes;
  }

  private async garantirDocumentoLivre(documento: string, idAtual?: number): Promise<void> {
    const existente = await this.clientes.buscarPorDocumento(documento);
    if (existente && Number(existente.id) !== idAtual) {
      throw new ConflitoErro("Já existe um cliente com esse CPF.");
    }
  }

  private async buscarOuFalhar(id: number): Promise<Cliente> {
    const cliente = await this.clientes.buscarPorId(id);
    if (!cliente) throw new RecursoNaoEncontradoErro("Cliente não encontrado.");
    return cliente;
  }
}
