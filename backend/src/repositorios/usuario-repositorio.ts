import type { Repository } from "typeorm";
import { Usuario } from "../entidades/usuario";

export interface RepositorioDeCredenciais {
  buscarPorEmailComSenha(email: string): Promise<Usuario | null>;
}

export interface RepositorioDeUsuarios {
  buscarPorId(id: number): Promise<Usuario | null>;
  buscarPorEmail(email: string): Promise<Usuario | null>;
  buscarPorCpf(cpf: string): Promise<Usuario | null>;
  salvar(usuario: Usuario): Promise<Usuario>;
}

export class UsuarioRepositorio
  implements RepositorioDeCredenciais, RepositorioDeUsuarios
{
  constructor(private readonly repositorio: Repository<Usuario>) {}

  buscarPorEmailComSenha(email: string): Promise<Usuario | null> {
    return this.repositorio
      .createQueryBuilder("usuario")
      .addSelect("usuario.senhaHash")
      .where("usuario.email = :email", { email })
      .getOne();
  }

  buscarPorId(id: number): Promise<Usuario | null> {
    return this.repositorio.findOne({ where: { id } });
  }

  buscarPorEmail(email: string): Promise<Usuario | null> {
    return this.repositorio.findOne({ where: { email } });
  }

  buscarPorCpf(cpf: string): Promise<Usuario | null> {
    return this.repositorio.findOne({ where: { cpf } });
  }

  salvar(usuario: Usuario): Promise<Usuario> {
    return this.repositorio.save(usuario);
  }
}