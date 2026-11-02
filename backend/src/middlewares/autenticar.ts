import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { DataSource } from "typeorm";
import { Usuario } from "../entidades/usuario";
import { ambiente } from "../config/ambiente";
import { NaoAutenticadoErro } from "../erros/erros-http";
import type {
  ConteudoJwt,
  UsuarioAutenticado,
} from "../tipos/usuario-autenticado";

function ehConteudoJwt(valor: unknown): valor is ConteudoJwt {
  if (typeof valor !== "object" || valor === null) {
    return false;
  }
  const { sub, email, perfil } = valor as Record<string, unknown>;
  return (
    typeof sub === "number" &&
    typeof email === "string" &&
    typeof perfil === "string"
  );
}

export async function autenticar(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const cabecalho = req.headers.authorization;

  if (!cabecalho?.startsWith("Bearer ")) {
    throw new NaoAutenticadoErro("Token de acesso não informado.");
  }

  const token = cabecalho.slice("Bearer ".length).trim();

  let conteudo: unknown;
  try {
    conteudo = jwt.verify(token, ambiente.jwt.segredo);
  } catch {
    throw new NaoAutenticadoErro("Token inválido ou expirado.");
  }

  if (!ehConteudoJwt(conteudo)) {
    throw new NaoAutenticadoErro("Token inválido ou expirado.");
  }

  // Read current permissions on every request, including sessions issued before a role change.
  const fonte = req.app.locals.fonteDeDados as DataSource;
  const usuario = await fonte.getRepository(Usuario).findOneBy({ id: conteudo.sub });
  if (!usuario) throw new NaoAutenticadoErro("Conta não encontrada. Entre novamente.");
  req.usuario = { id: usuario.id, email: usuario.email, perfil: usuario.perfil };
  next();
}

export function obterUsuarioAutenticado(req: Request): UsuarioAutenticado {
  if (!req.usuario) {
    throw new NaoAutenticadoErro();
  }
  return req.usuario;
}