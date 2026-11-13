import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { RepositorioDeUsuarios } from "../repositorios/usuario-repositorio";
import { ambiente } from "../config/ambiente";
import type { PerfilUsuario } from "../entidades/usuario";
import { AcessoNegadoErro, NaoAutenticadoErro } from "../erros/erros-http";
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

  const usuarios = req.app.locals.usuarioRepositorio as RepositorioDeUsuarios;
  const usuario = await usuarios.buscarPorId(conteudo.sub);
  if (!usuario) throw new NaoAutenticadoErro("Conta não encontrada. Entre novamente.");
  req.usuario = { id: usuario.id, email: usuario.email, perfil: usuario.perfil };
  next();
}

export function exigirPerfil(...perfis: PerfilUsuario[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const { perfil } = obterUsuarioAutenticado(req);
    if (!perfis.includes(perfil)) {
      throw new AcessoNegadoErro("Você não tem permissão para isso.");
    }
    next();
  };
}

export function obterUsuarioAutenticado(req: Request): UsuarioAutenticado {
  if (!req.usuario) {
    throw new NaoAutenticadoErro();
  }
  return req.usuario;
}