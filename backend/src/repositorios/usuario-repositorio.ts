import type { Transaction } from "sequelize";
import { sequelize } from "../config/banco";
import { Cliente } from "../entidades/cliente";
import { ConflitoErro, RecursoNaoEncontradoErro, RequisicaoInvalidaErro } from "../erros/erros-http";
import { PerfilUsuario, Usuario } from "../entidades/usuario";
import { ClienteModelo, UsuarioModelo } from "../modelos";
import { valoresDoCliente } from "./cliente-repositorio";
import type { ParametrosPaginacao } from "../utils/paginacao";
import { lerEstadoBase } from "./repositorio-base";

export interface RepositorioDeCredenciais {
  buscarPorEmailComSenha(email: string): Promise<Usuario | null>;
}

export interface RepositorioDeUsuarios {
  buscarPorId(id: number): Promise<Usuario | null>;
  buscarPorIdComSenha(id: number): Promise<Usuario | null>;
  buscarPorEmail(email: string): Promise<Usuario | null>;
  buscarPorCpf(cpf: string): Promise<Usuario | null>;
  buscarPorCnpj(cnpj: string): Promise<Usuario | null>;
  salvar(usuario: Usuario): Promise<Usuario>;
  salvarNovoCliente(usuario: Usuario): Promise<Usuario>;
  salvarNovo(usuario: Usuario): Promise<Usuario>;
  listarEquipe(paginacao: ParametrosPaginacao): Promise<[Usuario[], number]>;
  buscarFuncionarioPorId(id: number): Promise<Usuario | null>;
  excluir(id: number): Promise<void>;
}

export function usuarioDoRegistro(registro: UsuarioModelo): Usuario {
  return Usuario.restaurar({
    ...lerEstadoBase(registro),
    nome: registro.nome,
    email: registro.email,
    cpf: registro.cpf,
    cnpj: registro.cnpj ?? null,
    senhaHash: registro.senhaHash ?? undefined,
    perfil: registro.perfil,
    clienteId: registro.clienteId === null ? null : Number(registro.clienteId),
  });
}

export class UsuarioRepositorio
  implements RepositorioDeCredenciais, RepositorioDeUsuarios {
  constructor(private readonly modelo: typeof UsuarioModelo = UsuarioModelo) { }

  async buscarPorEmailComSenha(email: string): Promise<Usuario | null> {
    const registro = await this.modelo.unscoped().findOne({ where: { email } });
    return registro ? usuarioDoRegistro(registro) : null;
  }

  async buscarPorIdComSenha(id: number): Promise<Usuario | null> {
    const registro = await this.modelo.unscoped().findByPk(id);
    return registro ? usuarioDoRegistro(registro) : null;
  }

  async buscarPorId(id: number): Promise<Usuario | null> {
    const registro = await this.modelo.findByPk(id);
    return registro ? usuarioDoRegistro(registro) : null;
  }

  async buscarPorEmail(email: string): Promise<Usuario | null> {
    const registro = await this.modelo.findOne({ where: { email } });
    return registro ? usuarioDoRegistro(registro) : null;
  }

  async buscarPorCpf(cpf: string): Promise<Usuario | null> {
    const registro = await this.modelo.findOne({ where: { cpf } });
    return registro ? usuarioDoRegistro(registro) : null;
  }

  async buscarPorCnpj(cnpj: string): Promise<Usuario | null> {
    const registro = await this.modelo.findOne({ where: { cnpj } });
    return registro ? usuarioDoRegistro(registro) : null;
  }

  salvarNovoCliente(usuario: Usuario): Promise<Usuario> {
    return sequelize.transaction(async (transaction) => {
      const documento = usuario.cnpj ?? usuario.cpf;
      const existente = await ClienteModelo.findOne({ where: { documento }, transaction });

      if (existente) {
        throw new ConflitoErro(
          `Este ${usuario.cnpj ? "CNPJ" : "CPF"} já possui cadastro de cliente. Solicite à Signus a vinculação do acesso.`,
        );
      }

      const cliente = new Cliente({ nome: usuario.nome, email: usuario.email, documento });
      const clienteCriado = await ClienteModelo.create(valoresDoCliente(cliente), { transaction });
      usuario.vincularCliente(Number(clienteCriado.id));

      const { senhaHash, ...estado } = usuario.paraPersistencia();
      if (senhaHash === undefined) {
        throw new RequisicaoInvalidaErro("O hash da senha é inválido.");
      }
      const criado = await this.modelo.create({ ...estado, senhaHash }, { transaction });
      return this.buscarObrigatorio(Number(criado.id), transaction);
    });
  }

  async salvarNovo(usuario: Usuario): Promise<Usuario> {
    const { senhaHash, ...estado } = usuario.paraPersistencia();
    if (senhaHash === undefined) {
      throw new RequisicaoInvalidaErro("O hash da senha é inválido.");
    }
    const criado = await this.modelo.create({ ...estado, senhaHash });
    return this.buscarObrigatorio(Number(criado.id));
  }

  async listarEquipe({ pagina, limite }: ParametrosPaginacao): Promise<[Usuario[], number]> {
    const { rows, count } = await this.modelo.findAndCountAll({
      where: { perfil: [PerfilUsuario.ADMIN, PerfilUsuario.OPERADOR] },
      order: [
        ["nome", "ASC"],
        ["id", "ASC"],
      ],
      offset: (pagina - 1) * limite,
      limit: limite,
    });
    return [rows.map(usuarioDoRegistro), count];
  }

  async buscarFuncionarioPorId(id: number): Promise<Usuario | null> {
    const registro = await this.modelo.findOne({
      where: { id, perfil: [PerfilUsuario.ADMIN, PerfilUsuario.OPERADOR] },
    });
    return registro ? usuarioDoRegistro(registro) : null;
  }

  async excluir(id: number): Promise<void> {
    await this.modelo.destroy({ where: { id } });
  }

  async salvar(usuario: Usuario): Promise<Usuario> {
    const registro = await this.modelo.findByPk(usuario.id);
    if (!registro) throw new RecursoNaoEncontradoErro("Usuário não encontrado.");
    registro.set({ ...usuario.paraPersistencia() });
    if (registro.changed()) await registro.save();
    return this.buscarObrigatorio(usuario.id);
  }

  private async buscarObrigatorio(id: number, transaction?: Transaction): Promise<Usuario> {
    const registro = await this.modelo.findByPk(id, { transaction });
    if (!registro) throw new RecursoNaoEncontradoErro("Usuário não encontrado.");
    return usuarioDoRegistro(registro);
  }
}
