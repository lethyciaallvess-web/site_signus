import jwt from "jsonwebtoken";
import { ambiente } from "../config/ambiente";
import type { DadosLogin } from "../dtos/login-dto";
import type { PerfilUsuario } from "../entidades/usuario";
import { NaoAutenticadoErro } from "../erros/erros-http";
import type { RepositorioDeCredenciais } from "../repositorios/usuario-repositorio";
import type { ConteudoJwt } from "../tipos/usuario-autenticado";

export interface RespostaLogin {
  accessToken: string;
  usuario: {
    id: number;
    nome: string;
    email: string;
    perfil: PerfilUsuario;
  };
}

export class AutenticacaoServico {
  constructor(private readonly usuarios: RepositorioDeCredenciais) { }

  async login(dados: DadosLogin): Promise<RespostaLogin> {
    const usuario = await this.usuarios.buscarPorEmailComSenha(dados.email);

    const senhaCorreta = usuario
      ? await usuario.senhaConfere(dados.senha)
      : false;

    if (!usuario || !senhaCorreta) {
      throw new NaoAutenticadoErro("E-mail ou senha inválidos.");
    }

    const conteudo: ConteudoJwt = {
      sub: usuario.id,
      email: usuario.email,
      perfil: usuario.perfil,
    };

    const accessToken = jwt.sign(conteudo, ambiente.jwt.segredo, {
      expiresIn: ambiente.jwt.expiracaoSegundos,
    });

    return {
      accessToken,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
      },
    };
  }
}