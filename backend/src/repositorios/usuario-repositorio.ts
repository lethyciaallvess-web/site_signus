import type { Repository } from "typeorm";
import { Cliente } from "../entidades/cliente";
import { ConflitoErro } from "../erros/erros-http";
import { Usuario } from "../entidades/usuario";

export interface RepositorioDeCredenciais {
  buscarPorEmailComSenha(email: string): Promise<Usuario | null>;
}

export interface RepositorioDeUsuarios {
  buscarPorId(id: number): Promise<Usuario | null>;
  buscarPorEmail(email: string): Promise<Usuario | null>;
  buscarPorCpf(cpf: string): Promise<Usuario | null>;
  salvar(usuario: Usuario): Promise<Usuario>;
  salvarNovoCliente(usuario: Usuario): Promise<Usuario>;
}

export class UsuarioRepositorio
  implements RepositorioDeCredenciais, RepositorioDeUsuarios {
  constructor(private readonly repositorio: Repository<Usuario>) { }

  buscarPorEmailComSenha(email: string): Promise<Usuario | null> {
    return this.repositorio
      .createQueryBuilder("usuario")
      .addSelect("usuario._senhaHash")
      .where("usuario._email = :email", { email })
      .getOne();
  }

  buscarPorId(id: number): Promise<Usuario | null> {
    return this.repositorio.findOne({ where: { id } });
  }

  buscarPorEmail(email: string): Promise<Usuario | null> {
    return this.repositorio
      .createQueryBuilder("usuario")
      .where("usuario._email = :email", { email })
      .getOne();
  }

  buscarPorCpf(cpf: string): Promise<Usuario | null> {
    return this.repositorio
      .createQueryBuilder("usuario")
      .where("usuario._cpf = :cpf", { cpf })
      .getOne();
  }

  salvarNovoCliente(usuario: Usuario): Promise<Usuario> {
    return this.repositorio.manager.transaction(async (manager) => {
      const existente = await manager
        .getRepository(Cliente)
        .createQueryBuilder("cliente")
        .where("cliente._documento = :cpf", { cpf: usuario.cpf })
        .getOne();

      if (existente) {
        throw new ConflitoErro(
          "Este CPF já possui cadastro de cliente. Solicite à Signus a vinculação do acesso.",
        );
      }

      const cliente = new Cliente({
        nome: usuario.nome,
        email: usuario.email,
        cpf: usuario.cpf,
      });

      await manager.save(cliente);
      usuario.vincularCliente(cliente.id);

      return manager.save(usuario);
    });
  }

  salvar(usuario: Usuario): Promise<Usuario> {
    return this.repositorio.save(usuario);
  }
}