import type { DadosAtualizarUsuario } from "../dtos/atualizar-usuario-dto";
import type { DadosCriarUsuario } from "../dtos/criar-usuario-dto";
import { Senha } from "../dominio/senha";
import { PerfilUsuario, Usuario } from "../entidades/usuario";
import { ConflitoErro, RecursoNaoEncontradoErro, RequisicaoInvalidaErro } from "../erros/erros-http";
import type { RepositorioDeUsuarios } from "../repositorios/usuario-repositorio";
import { codigoErroBanco } from "../utils/erros-banco";
import { montarPagina, type Pagina, type ParametrosPaginacao } from "../utils/paginacao";
import type { DadosCriarFuncionario } from "../dtos/criar-funcionario-dto";

export interface UsuarioPublico {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  cnpj: string | null;
  perfil: PerfilUsuario;
  criadoEm: Date;
  atualizadoEm: Date;
}

function paraPublico(usuario: Usuario): UsuarioPublico {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    cpf: usuario.cpf,
    cnpj: usuario.cnpj,
    perfil: usuario.perfil,
    criadoEm: usuario.criadoEm,
    atualizadoEm: usuario.atualizadoEm,
  };
}

export interface FuncionarioPublico {
  id: number;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
}

function paraFuncionario(usuario: Usuario): FuncionarioPublico {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    perfil: usuario.perfil,
  };
}

function ehErroDeDuplicidade(erro: unknown): boolean {
  return codigoErroBanco(erro) === "ER_DUP_ENTRY";
}

export class UsuarioServico {
  constructor(private readonly usuarios: RepositorioDeUsuarios) { }

  async cadastrar(dados: DadosCriarUsuario): Promise<UsuarioPublico> {
    if (await this.usuarios.buscarPorEmail(dados.email)) {
      throw new ConflitoErro("Já existe um usuário com esse e-mail.");
    }
    if (await this.usuarios.buscarPorCpf(dados.cpf)) {
      throw new ConflitoErro("Já existe um usuário com esse CPF.");
    }
    if (dados.cnpj && (await this.usuarios.buscarPorCnpj(dados.cnpj))) {
      throw new ConflitoErro("Já existe um usuário com esse CNPJ.");
    }

    const usuario = Usuario.criar(
      dados.nome,
      dados.email,
      dados.cpf,
      await new Senha(dados.senha).gerarHash(),
      dados.cnpj,
    );

    try {
      return paraPublico(await this.usuarios.salvarNovoCliente(usuario));
    } catch (erro) {
      if (ehErroDeDuplicidade(erro)) {
        throw new ConflitoErro("Já existe um usuário com esse e-mail, CPF ou CNPJ.");
      }
      throw erro;
    }
  }

  async listarEquipe(paginacao: ParametrosPaginacao): Promise<Pagina<FuncionarioPublico>> {
    const [usuarios, total] = await this.usuarios.listarEquipe(paginacao);
    return montarPagina(usuarios.map(paraFuncionario), total, paginacao);
  }

  async criarFuncionario(dados: DadosCriarFuncionario): Promise<FuncionarioPublico> {
    if (await this.usuarios.buscarPorEmail(dados.email)) {
      throw new ConflitoErro("Já existe um usuário com esse e-mail.");
    }
    if (await this.usuarios.buscarPorCpf(dados.cpf)) {
      throw new ConflitoErro("Já existe um usuário com esse CPF.");
    }

    const funcionario = Usuario.criarFuncionario(
      dados.nome,
      dados.email,
      dados.cpf,
      await new Senha(dados.senha).gerarHash(),
      dados.perfil,
    );

    try {
      return paraFuncionario(await this.usuarios.salvarNovo(funcionario));
    } catch (erro) {
      if (ehErroDeDuplicidade(erro)) {
        throw new ConflitoErro("Já existe um usuário com esse e-mail ou CPF.");
      }
      throw erro;
    }
  }

  async obterPorId(id: number): Promise<UsuarioPublico> {
    return paraPublico(await this.buscarOuFalhar(id));
  }

  async atualizar(
    id: number,
    dados: DadosAtualizarUsuario,
  ): Promise<UsuarioPublico> {
    const usuario = await this.buscarOuFalhar(id);

    if (dados.cpf !== undefined) {
      const outroComCpf = await this.usuarios.buscarPorCpf(dados.cpf);
      if (outroComCpf && outroComCpf.id !== usuario.id) {
        throw new ConflitoErro("Já existe outro usuário com esse CPF.");
      }
      usuario.cpf = dados.cpf;
    }

    if (dados.cnpj !== undefined) {
      if (dados.cnpj !== null) {
        const outroComCnpj = await this.usuarios.buscarPorCnpj(dados.cnpj);
        if (outroComCnpj && outroComCnpj.id !== usuario.id) {
          throw new ConflitoErro("Já existe outro usuário com esse CNPJ.");
        }
      }
      usuario.cnpj = dados.cnpj;
    }

    if (dados.nome !== undefined) usuario.nome = dados.nome;

    if (dados.senha !== undefined) {
      const comSenha = await this.usuarios.buscarPorIdComSenha(id);
      if (!comSenha || !(await comSenha.senhaConfere(dados.senhaAtual ?? ""))) {
        throw new RequisicaoInvalidaErro("Senha atual incorreta.");
      }
      usuario.definirSenhaHash(await new Senha(dados.senha).gerarHash());
    }

    try {
      return paraPublico(await this.usuarios.salvar(usuario));
    } catch (erro) {
      if (ehErroDeDuplicidade(erro)) {
        throw new ConflitoErro("Já existe outro usuário com esse CPF ou CNPJ.");
      }
      throw erro;
    }
  }

  private async buscarOuFalhar(id: number): Promise<Usuario> {
    const usuario = await this.usuarios.buscarPorId(id);
    if (!usuario) {
      throw new RecursoNaoEncontradoErro("Usuário não encontrado.");
    }
    return usuario;
  }
}
