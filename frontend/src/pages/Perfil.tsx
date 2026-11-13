import { Link } from "react-router-dom";
import { useState } from "react";
import type { FormEvent } from "react";
import {
    REGEX_SENHA,
    validarCpf,
    validarCnpj,
    validarNome,
    somenteNumeros,
} from "../utils/validacoes";
import { mascararCpfOuCnpj, mascararNome } from "../utils/mascaras";
import { rotaInicial } from "../utils/perfis";
import { formatarIniciais, rotulosPerfil } from "../utils/formatacoes";
import { Input } from "../components/Input";
import { Botao } from "../components/Botao";
import { atualizarPerfilParcial } from "../services/autenticacao";
import { ApiError } from "../services/api";
import { useUsuario } from "../contexts/UsuarioContext";
import "./Auth.css";
import "./Perfil.css";

type Secao = "nome" | "cpf" | "senha" | null;

interface Erros {
    nome?: string;
    cpf?: string;
    senhaAtual?: string;
    senha?: string;
    confirmarSenha?: string;
}

type LinhaProps = {
    rotulo: string;
    valor: string;
};

function Linha({ rotulo, valor }: LinhaProps) {
    return (
        <div className="perfil-linha">
            <dt>{rotulo}</dt>
            <dd>{valor}</dd>
        </div>
    );
}

export function Perfil() {
    const { usuario, atualizarUsuario } = useUsuario();
    const [editando, setEditando] = useState<Secao>(null);
    const [nome, setNome] = useState(usuario?.nome ?? "");
    const [cpf, setCpf] = useState("");
    const [senhaAtual, setSenhaAtual] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [erros, setErros] = useState<Erros>({});
    const [erroGeral, setErroGeral] = useState("");
    const [sucesso, setSucesso] = useState("");
    const [enviando, setEnviando] = useState(false);

    function handleAbrir(secao: Secao) {
        setEditando(secao);
        setErros({});
        setErroGeral("");
        setSucesso("");
        setNome(usuario?.nome ?? "");
        setCpf("");
        setSenhaAtual("");
        setSenha("");
        setConfirmarSenha("");
    }

    function handleCancelar() {
        setEditando(null);
        setErros({});
        setErroGeral("");
        setCpf("");
        setSenhaAtual("");
        setSenha("");
        setConfirmarSenha("");
    }

    async function handleSubmitNome(event: FormEvent) {
        event.preventDefault();
        setErroGeral("");

        const novosErros: Erros = {};

        if (nome.trim() === "") {
            novosErros.nome = "Informe o nome.";
        } else if (nome.trim().length < 3) {
            novosErros.nome = "O nome deve ter pelo menos 3 caracteres.";
        } else if (!validarNome(nome)) {
            novosErros.nome = "Use apenas letras no nome.";
        }

        setErros(novosErros);

        if (Object.keys(novosErros).length > 0) {
            return;
        }

        setEnviando(true);
        try {
            await atualizarPerfilParcial({ nome: nome.trim() });

            if (usuario) {
                atualizarUsuario({ ...usuario, nome: nome.trim() });
            }

            setEditando(null);
            setSucesso("Nome atualizado com sucesso.");
        } catch (erro) {
            setErroGeral(
                erro instanceof ApiError ? erro.message : "Erro inesperado. Tente novamente."
            );
        } finally {
            setEnviando(false);
        }
    }

    async function handleSubmitCpf(event: FormEvent) {
        event.preventDefault();
        setErroGeral("");

        const novosErros: Erros = {};
        const numerosDocumento = somenteNumeros(cpf);

        if (cpf.trim() === "") {
            novosErros.cpf = "Informe o CPF ou CNPJ.";
        } else if (numerosDocumento.length <= 11) {
            if (!validarCpf(cpf)) {
                novosErros.cpf = "CPF inválido.";
            }
        } else if (!validarCnpj(cpf)) {
            novosErros.cpf = "CNPJ inválido.";
        }

        setErros(novosErros);

        if (Object.keys(novosErros).length > 0) {
            return;
        }

        setEnviando(true);
        try {
            await atualizarPerfilParcial({ cpf: numerosDocumento });
            setCpf("");
            setEditando(null);
            setSucesso("Documento atualizado com sucesso.");
        } catch (erro) {
            setErroGeral(
                erro instanceof ApiError ? erro.message : "Erro inesperado. Tente novamente."
            );
        } finally {
            setEnviando(false);
        }
    }

    async function handleSubmitSenha(event: FormEvent) {
        event.preventDefault();
        setErroGeral("");

        const novosErros: Erros = {};

        if (senhaAtual === "") {
            novosErros.senhaAtual = "Informe a senha atual.";
        }

        if (senha === "") {
            novosErros.senha = "Informe a nova senha.";
        } else if (senha.length < 8) {
            novosErros.senha = "A senha deve ter pelo menos 8 caracteres.";
        } else if (!REGEX_SENHA.test(senha)) {
            novosErros.senha =
                "Use letra maiúscula, minúscula, número e caractere especial.";
        } else if (senha === senhaAtual) {
            novosErros.senha = "A nova senha deve ser diferente da atual.";
        }

        if (confirmarSenha === "") {
            novosErros.confirmarSenha = "Confirme a nova senha.";
        } else if (senha !== confirmarSenha) {
            novosErros.confirmarSenha = "As senhas não conferem.";
        }

        setErros(novosErros);

        if (Object.keys(novosErros).length > 0 || !usuario) {
            return;
        }

        setEnviando(true);
        try {
            await atualizarPerfilParcial({
                senhaAtual,
                senha,
                confirmacaoSenha: confirmarSenha,
            });

            setSenhaAtual("");
            setSenha("");
            setConfirmarSenha("");
            setEditando(null);
            setSucesso("Senha alterada com sucesso.");
        } catch (erro) {
            setErroGeral(
                erro instanceof ApiError ? erro.message : "Erro inesperado. Tente novamente."
            );
        } finally {
            setEnviando(false);
        }
    }

    const nomeAtual = usuario?.nome ?? "";
    const rotuloPerfil = usuario ? (rotulosPerfil[usuario.perfil] ?? usuario.perfil) : "";

    return (
        <div className="auth-page perfil-page">
            <div className="perfil-card">
                <div className="perfil-topo">
                    <div className="perfil-avatar">{formatarIniciais(nomeAtual)}</div>
                    <h1>{nomeAtual}</h1>
                    <p className="perfil-email">{usuario?.email}</p>
                    {rotuloPerfil && <span className="perfil-selo">{rotuloPerfil}</span>}
                </div>

                {sucesso && (
                    <p role="status" className="perfil-sucesso">
                        {sucesso}
                    </p>
                )}

                {erroGeral && (
                    <p role="alert" className="form-alert perfil-alerta">
                        {erroGeral}
                    </p>
                )}

                <section className="perfil-secao">
                    <div className="perfil-secao-cabecalho">
                        <h2>Informações</h2>
                        {editando !== "nome" && (
                            <button
                                type="button"
                                className="perfil-link"
                                onClick={() => handleAbrir("nome")}
                            >
                                Editar nome
                            </button>
                        )}
                    </div>

                    {editando === "nome" ? (
                        <form onSubmit={handleSubmitNome} noValidate className="perfil-form">
                            <Input
                                type="text"
                                placeholder="Nome completo"
                                obrigatorio
                                maxLength={180}
                                value={nome}
                                onChange={(event) => setNome(mascararNome(event.target.value))}
                                erro={erros.nome}
                            />

                            <div className="perfil-acoes">
                                <Botao type="submit" disabled={enviando}>
                                    Salvar
                                </Botao>
                                <button
                                    type="button"
                                    className="perfil-cancelar"
                                    onClick={handleCancelar}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    ) : (
                        <dl>
                            <Linha rotulo="Nome" valor={nomeAtual} />
                            <Linha rotulo="E-mail" valor={usuario?.email ?? ""} />
                        </dl>
                    )}
                </section>

                <section className="perfil-secao">
                    <div className="perfil-secao-cabecalho">
                        <h2>Documento</h2>
                        {editando !== "cpf" && (
                            <button
                                type="button"
                                className="perfil-link"
                                onClick={() => handleAbrir("cpf")}
                            >
                                Alterar CPF/CNPJ
                            </button>
                        )}
                    </div>

                    {editando === "cpf" ? (
                        <form onSubmit={handleSubmitCpf} noValidate className="perfil-form">
                            <Input
                                type="text"
                                placeholder="CPF ou CNPJ"
                                obrigatorio
                                maxLength={18}
                                inputMode="numeric"
                                value={cpf}
                                onChange={(event) => setCpf(mascararCpfOuCnpj(event.target.value))}
                                erro={erros.cpf}
                            />

                            <div className="perfil-acoes">
                                <Botao type="submit" disabled={enviando}>
                                    Salvar documento
                                </Botao>
                                <button
                                    type="button"
                                    className="perfil-cancelar"
                                    onClick={handleCancelar}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    ) : (
                        <dl>
                            <Linha rotulo="CPF/CNPJ" valor="••••••••••••" />
                        </dl>
                    )}
                </section>

                <section className="perfil-secao">
                    <div className="perfil-secao-cabecalho">
                        <h2>Segurança</h2>
                        {editando !== "senha" && (
                            <button
                                type="button"
                                className="perfil-link"
                                onClick={() => handleAbrir("senha")}
                            >
                                Alterar senha
                            </button>
                        )}
                    </div>

                    {editando === "senha" ? (
                        <form onSubmit={handleSubmitSenha} noValidate className="perfil-form">
                            <Input
                                type="password"
                                placeholder="Senha atual"
                                obrigatorio
                                maxLength={72}
                                value={senhaAtual}
                                onChange={(event) => setSenhaAtual(event.target.value)}
                                erro={erros.senhaAtual}
                            />

                            <Input
                                type="password"
                                placeholder="Nova senha"
                                obrigatorio
                                maxLength={72}
                                value={senha}
                                onChange={(event) => setSenha(event.target.value)}
                                erro={erros.senha}
                            />

                            <Input
                                type="password"
                                placeholder="Confirmar nova senha"
                                obrigatorio
                                maxLength={72}
                                value={confirmarSenha}
                                onChange={(event) => setConfirmarSenha(event.target.value)}
                                erro={erros.confirmarSenha}
                            />

                            <div className="perfil-acoes">
                                <Botao type="submit" disabled={enviando}>
                                    Salvar senha
                                </Botao>
                                <button
                                    type="button"
                                    className="perfil-cancelar"
                                    onClick={handleCancelar}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    ) : (
                        <dl>
                            <Linha rotulo="Senha" valor="••••••••" />
                        </dl>
                    )}
                </section>

                <p className="perfil-rodape">
                    <Link to={usuario ? rotaInicial(usuario.perfil) : "/"}>Voltar</Link>
                </p>
            </div>
        </div>
    );
}