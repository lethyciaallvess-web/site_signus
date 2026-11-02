import type { DadosAtualizarUsuario } from "../dtos/atualizar-usuario-dto";
import type { DadosCriarUsuario } from "../dtos/criar-usuario-dto";
import { Cpf } from "../dominio/cpf";
import { Senha } from "../dominio/senha";
import { PerfilUsuario, Usuario } from "../entidades/usuario";
import { ConflitoErro, RecursoNaoEncontradoErro } from "../erros/erros-http";
import type { RepositorioDeUsuarios } from "../repositorios/usuario-repositorio";


export interface UsuarioPublico {
  id: number;
  nome: string;
  email: string;
  cpf: string;
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
    perfil: usuario.perfil,
    criadoEm: usuario.criadoEm,
    atualizadoEm: usuario.atualizadoEm,
  };
}

function ehErroDeDuplicidade(erro: unknown): boolean {
  const causa = (erro as { driverError?: { code?: string } } | null)
    ?.driverError;
  return causa?.code === "ER_DUP_ENTRY";
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

    const usuario = new Usuario();
    usuario.nome = dados.nome;
    usuario.email = dados.email;
    usuario.cpf = new Cpf(dados.cpf).numeros;
    usuario.senhaHash = await new Senha(dados.senha).gerarHash();
    usuario.perfil = PerfilUsuario.OPERADOR;

    try {
      return paraPublico(await this.usuarios.salvar(usuario));
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

    const outroComCpf = await this.usuarios.buscarPorCpf(dados.cpf);
    if (outroComCpf && outroComCpf.id !== usuario.id) {
      throw new ConflitoErro("Já existe outro usuário com esse CPF.");
    }

    usuario.nome = dados.nome;
    usuario.cpf = new Cpf(dados.cpf).numeros;
    usuario.senhaHash = await new Senha(dados.senha).gerarHash(); 

    try {
      return paraPublico(await this.usuarios.salvar(usuario));
    } catch (erro) {
      if (ehErroDeDuplicidade(erro)) {
        throw new ConflitoErro("Já existe outro usuário com esse CPF.");
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