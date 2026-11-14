import { Op, type WhereOptions } from "sequelize";
import { sequelize } from "../config/banco";
import { Cliente } from "../entidades/cliente";
import { ClienteModelo, UsuarioModelo } from "../modelos";
import {
  lerEstadoBase,
  RepositorioBase,
  type RepositorioCrud,
  type ValoresModelo,
} from "./repositorio-base";

export interface RepositorioDeClientes extends RepositorioCrud<Cliente> {
  buscarPorDocumento(documento: string): Promise<Cliente | null>;
}

export function clienteDoRegistro(registro: ClienteModelo): Cliente {
  return Cliente.restaurar({
    ...lerEstadoBase(registro),
    tipoPessoa: registro.tipoPessoa,
    nome: registro.nome,
    documento: registro.documento,
    email: registro.email,
    telefone: registro.telefone,
    observacoes: registro.observacoes,
  });
}

export function valoresDoCliente(cliente: Cliente): ValoresModelo<ClienteModelo> {
  return { ...cliente.paraPersistencia() };
}

export class ClienteRepositorio
  extends RepositorioBase<Cliente, ClienteModelo>
  implements RepositorioDeClientes {
  protected readonly ordenarPor = "nome";

  constructor(modelo: typeof ClienteModelo = ClienteModelo) {
    super(modelo);
  }

  protected paraEntidade(registro: ClienteModelo): Cliente {
    return clienteDoRegistro(registro);
  }

  protected paraValores(cliente: Cliente): ValoresModelo<ClienteModelo> {
    return valoresDoCliente(cliente);
  }

  buscarPorDocumento(documento: string): Promise<Cliente | null> {
    return this.buscarUm({ documento });
  }

  protected override filtroBusca(termo: string): WhereOptions<ClienteModelo> {
    const condicoes: WhereOptions<ClienteModelo>[] = [
      { nome: { [Op.like]: `%${termo}%` } },
      { email: { [Op.like]: `%${termo}%` } },
    ];
    const numeros = termo.replace(/\D/g, "");
    if (numeros) condicoes.push({ documento: { [Op.like]: `%${numeros}%` } });
    return { [Op.or]: condicoes };
  }

  override async excluir(cliente: Cliente): Promise<void> {
    await sequelize.transaction(async (transaction) => {
      await UsuarioModelo.destroy({ where: { clienteId: cliente.id }, transaction });
      await ClienteModelo.destroy({ where: { id: cliente.id }, transaction });
    });
  }
}
