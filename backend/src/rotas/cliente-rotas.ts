import { Router } from "express";
import type { DataSource } from "typeorm";
import { PerfilUsuario, Usuario } from "../entidades/usuario";
import { AcessoNegadoErro } from "../erros/erros-http";
import { autenticar, obterUsuarioAutenticado } from "../middlewares/autenticar";

export function criarRotasCliente(fonte: DataSource): Router {
  const rotas = Router();
  rotas.get("/painel", autenticar, async (req, res) => {
    const { id, perfil } = obterUsuarioAutenticado(req);
    if (perfil !== PerfilUsuario.CLIENTE) throw new AcessoNegadoErro("Área exclusiva de clientes.");
    const conta = await fonte.getRepository(Usuario).findOneBy({ id });
    if (!conta?.clienteId) throw new AcessoNegadoErro("Seu cadastro ainda não está vinculado a um cliente.");
    // Identity comes from the authenticated account; request parameters never choose the client.
    const eventos = await fonte.query(`
      SELECT e.id, e.nome, e.data_inicio AS dataInicio, e.data_fim AS dataFim,
             e.local_evento AS localEvento, e.status, e.valor_negociado AS valor,
             p.nome AS plano
      FROM eventos e LEFT JOIN planos p ON p.id = e.plano_id
      WHERE e.cliente_id = ? ORDER BY e.data_inicio DESC, e.id DESC
    `, [conta.clienteId]);
    res.json({ eventos: eventos.map((e: Record<string, unknown>) => ({
      ...e, valor: e.valor === null ? null : Number(e.valor),
    })) });
  });
  return rotas;
}
