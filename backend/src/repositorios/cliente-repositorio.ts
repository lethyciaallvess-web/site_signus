import { Cliente } from "../entidades/cliente";
import { RepositorioBase } from "./repositorio-base";

export class ClienteRepositorio extends RepositorioBase<Cliente> {
  protected readonly alias = "cliente";
  protected readonly ordenarPor = "_nome";

  buscarPorDocumento(documento: string): Promise<Cliente | null> {
    return this.consultaBase()
      .where("cliente._documento = :documento", { documento })
      .getOne();
  }
}
